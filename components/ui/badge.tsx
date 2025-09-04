"use client";

import React, { useEffect, useRef, useState } from "react";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Heading } from "@/components/heading";
import {
  MessageSquareIcon,
  Send,
  Mic,
  Trash2,
  Save,
  Copy,
  Speaker,
  Zap,
  Loader as LoaderIcon,
  X,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField, FormItem, Form, FormControl } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import axios from "axios";
import { Empty } from "@/components/empty";
import { UserAvatar } from "@/components/user.avatar";
import { BotAvatar } from "@/components/bot-avatar";
import ReactMarkdown from "react-markdown";
import { ScrollArea } from "@/components/ui/scroll-area";


const formSchema = z.object({
  prompt: z.string().min(1, {
    message: "Prompt is required",
  }),
});

type Role = "user" | "assistant" | "system";

type Message = {
  id: string;
  role: Role;
  content: string;
  time: string;
  status?: "sent" | "delivered" | "typing" | "error";
};

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export default function GenAIConversationPage(): JSX.Element {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      if (typeof window === "undefined") return [];
      const raw = localStorage.getItem("genai_conversation_v1");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { prompt: "" },
  });

  const isLoading = form.formState.isSubmitting;

  const suggestions = [
    "Summarize the last message",
    "Give me 3 follow-up questions",
    "Explain like I'm 5",
    "Convert to a TODO list",
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Init Speech Recognition if available
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) return;

    const sr = new SpeechRecognition();
    sr.continuous = false;
    sr.interimResults = false;
    sr.lang = "en-IN";

    sr.onresult = (ev: any) => {
      try {
        const transcript = ev.results[0][0].transcript;
        form.setValue("prompt", transcript);
      } catch {
        // ignore
      }
    };

    sr.onerror = () => setIsRecording(false);
    sr.onend = () => setIsRecording(false);

    setRecognition(sr);
  }, [form]);

  const nowTime = () =>
    new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const handleSave = () => {
    setIsSaving(true);
    try {
      localStorage.setItem("genai_conversation_v1", JSON.stringify(messages));
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setIsSaving(false), 400);
    }
  };

  const handleClear = () => {
    setIsClearing(true);
    setMessages([]);
    form.reset();
    setTimeout(() => {
      try {
        localStorage.removeItem("genai_conversation_v1");
      } catch (e) {
        // ignore
      }
      setIsClearing(false);
    }, 300);
  };

  const addMessage = (m: Message) => setMessages((cur) => [...cur, m]);

  // Simple typing animation for assistant (optimistic)
  const typeAssistant = async (fullText: string) => {
    const id = `msg_${Date.now()}`;
    addMessage({ id, role: "assistant", content: "", time: nowTime(), status: "typing" });

    return new Promise<void>((resolve) => {
      let i = 0;
      const interval = Math.max(12, Math.floor(1200 / Math.max(1, fullText.length / 30)));
      const timer = window.setInterval(() => {
        i += 2;
        setMessages((cur) =>
          cur.map((m) => (m.id === id ? { ...m, content: fullText.slice(0, i) } : m))
        );
        if (i >= fullText.length) {
          clearInterval(timer);
          setMessages((cur) => cur.map((m) => (m.id === id ? { ...m, status: "delivered" } : m)));
          resolve();
        }
      }, interval);
    });
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!values.prompt?.trim()) return;

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      role: "user",
      content: values.prompt.trim(),
      time: nowTime(),
      status: "sent",
    };

    addMessage(userMsg);
    form.reset();

    try {
      const loadingId = `loading_${Date.now()}`;
      addMessage({ id: loadingId, role: "assistant", content: "", time: nowTime(), status: "typing" });

      const resp = await axios.post(
        "/api/conversation",
        { messages: [...messages, userMsg] },
        { timeout: 60000 }
      );

      setMessages((cur) => cur.filter((m) => m.id !== loadingId));

      const text =
        typeof resp.data === "string" ? resp.data : resp.data?.text || JSON.stringify(resp.data);

      await typeAssistant(text);
    } catch (err) {
      console.error(err);
      const errMsg: Message = {
        id: `err_${Date.now()}`,
        role: "assistant",
        content: "Sorry — something went wrong. Try again or check the console.",
        time: nowTime(),
        status: "error",
      };
      addMessage(errMsg);
    } finally {
      try {
        localStorage.setItem("genai_conversation_v1", JSON.stringify(messages));
      } catch {
        // ignore
      }
      router.refresh();
    }
  };

  const handleVoice = () => {
    if (!recognition) return;
    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      try {
        recognition.start();
        setIsRecording(true);
      } catch (e) {
        console.warn(e);
      }
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      console.warn(e);
    }
  };

  // Text-to-speech: picks a good female voice when available and speaks in chunks
  const handleSpeak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const synth = window.speechSynthesis;

    const preferred = [
      "Google UK English Female",
      "Google US English",
      "Microsoft Zira Desktop - English (United States)",
      "Samantha",
      "Joanna",
      "Nicole",
      "Olivia",
    ];

    const loadVoices = () =>
      new Promise<SpeechSynthesisVoice[]>((resolve) => {
        let voices = synth.getVoices();
        if (voices.length) return resolve(voices);
        const handler = () => {
          voices = synth.getVoices();
          synth.removeEventListener("voiceschanged", handler);
          resolve(voices);
        };
        synth.addEventListener("voiceschanged", handler);
        setTimeout(() => resolve(synth.getVoices()), 700);
      });

    (async () => {
      try {
        const voices = await loadVoices();

        let voice = voices.find((v) => preferred.includes(v.name));

        if (!voice) {
          voice =
            voices.find((v) => /female|woman/i.test(v.name)) ||
            voices.find(
              (v) =>
                /en-(US|GB|IN)/i.test(v.lang) &&
                /Google|Microsoft|Amazon|Amy|Samantha|Joanna|Nicole|Olivia/i.test(v.name)
            ) ||
            voices.find((v) => /^en-/i.test(v.lang)) ||
            voices[0];
        }

        // Safe single-line regex (no literal newlines)
        const chunks = text.match(/[^.!?\r\n]+[.!?\r\n]*/g) || [text];

        for (const c of chunks) {
          const chunk = c.trim();
          if (!chunk) continue;

          await new Promise<void>((resolve) => {
            const u = new SpeechSynthesisUtterance(chunk);
            u.lang = voice?.lang || "en-IN";
            if (voice) u.voice = voice;

            // tuned for sweet female tone
            u.pitch = 1.15;
            u.rate = 0.95;
            u.volume = 1;

            u.onend = () => resolve();
            u.onerror = () => resolve();

            try {
              synth.cancel();
            } catch {
              // ignore
            }

            synth.speak(u);
          });
        }
      } catch (e) {
        console.warn("TTS error:", e);
      }
    })();
  };

  const handleDeleteMessage = (id: string) => setMessages((cur) => cur.filter((m) => m.id !== id));

  const handleSuggestion = (s: string) => {
    form.setValue("prompt", s);
    form.handleSubmit(onSubmit)();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-50">
      <Heading
        title="GenAI Studio — Chat"
        description="Interactive assistant with voice, quick prompts, and persistent conversations"
        icon={MessageSquareIcon}
        iconColor="text-violet-600"
        bgColor="bg-violet-600/10"
      />

      <div className="flex-grow p-4 lg:p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">Conversation</div>
            <div className="text-xs text-muted-foreground/70">Saved locally · {messages.length} messages</div>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <LoaderIcon className="animate-spin" /> : <Save />}
              <span className="ml-2">Save</span>
            </Button>
            <Button size="sm" variant="ghost" onClick={handleClear} disabled={isClearing}>
              <Trash2 /> <span className="ml-2">Clear</span>
            </Button>
          </div>
        </div>

        <div className="flex gap-4 h-full">
          <div className="w-full lg:w-3/4 h-full flex flex-col bg-white rounded-2xl shadow-sm border overflow-hidden">
            <ScrollArea className="flex-grow p-6" ref={scrollRef as any}>
              {messages.length === 0 ? (
                <Empty label="Say hi to GenAI — try a suggestion below" />
              ) : (
                <div className="space-y-4">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={cn(
                        "p-4 rounded-lg flex items-start gap-4",
                        m.role === "user" ? "bg-white border border-black/5" : "bg-slate-50"
                      )}
                    >
                      <div className="flex-shrink-0">{m.role === "user" ? <UserAvatar /> : <BotAvatar />}</div>

                      <div className="flex-grow">
                        <div className="flex items-start justify-between gap-4">
                          <div className="text-sm font-medium text-slate-800">{m.role === "user" ? "You" : "GenAI"}</div>
                          <div className="text-xs text-muted-foreground">{m.time}</div>
                        </div>

                        <div className="mt-1 text-sm prose max-w-full">
                          <ReactMarkdown>{m.content}</ReactMarkdown>
                        </div>

                        <div className="mt-2 flex items-center gap-2">
                          <button
                            aria-label="copy"
                            className="text-xs px-2 py-1 rounded-md hover:bg-slate-100"
                            onClick={() => handleCopy(m.content)}
                          >
                            <Copy className="inline-block mr-1" /> Copy
                          </button>

                          {m.role === "assistant" && (
                            <button
                              aria-label="speak"
                              className="text-xs px-2 py-1 rounded-md hover:bg-slate-100"
                              onClick={() => handleSpeak(m.content)}
                            >
                              <Speaker className="inline-block mr-1" /> Read
                            </button>
                          )}

                          <button
                            aria-label="delete"
                            className="text-xs px-2 py-1 rounded-md hover:bg-slate-100"
                            onClick={() => handleDeleteMessage(m.id)}
                          >
                            <X className="inline-block mr-1" /> Remove
                          </button>

                          <div className="ml-auto text-xs text-muted-foreground">{m.status}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            <div className="border-t p-4 bg-white/80 sticky bottom-0">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-12 gap-2 items-end">
                  <FormField
                    name="prompt"
                    render={({ field }) => (
                      <FormItem className="col-span-12 lg:col-span-10">
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={1}
                            placeholder="Type a message or press the mic to speak..."
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                form.handleSubmit(onSubmit)();
                              }
                            }}
                            className="resize-none"
                            disabled={isLoading}
                            aria-label="Message input"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="col-span-12 lg:col-span-2 flex justify-end items-center gap-2">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={handleVoice}
                      aria-pressed={isRecording}
                      className={cn(isRecording && "text-rose-500")}
                    >
                      {isRecording ? <LoaderIcon className="animate-spin" /> : <Mic />}
                    </Button>

                    <Button type="submit" size="icon" disabled={isLoading} aria-label="Send message">
                      {isLoading ? <LoaderIcon className="animate-spin" /> : <Send />}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>

          <aside className="hidden lg:block lg:w-1/4">
            <div className="sticky top-6 space-y-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">Quick Suggestions</div>
                    <div className="text-xs text-muted-foreground">Tap to use — or edit before sending</div>
                  </div>
                  <Zap />
                </div>

                <div className="mt-3 flex flex-col gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSuggestion(s)}
                      className="text-left px-3 py-2 rounded-md hover:bg-slate-50 text-sm border"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="text-sm font-semibold">Conversation tools</div>
                <div className="mt-2 text-xs text-muted-foreground">Export or manage this chat</div>

                <div className="mt-3 flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const blob = new Blob([JSON.stringify(messages, null, 2)], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `genai_conversation_${Date.now()}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    Export JSON
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm("Are you sure you want to clear the conversation?")) handleClear();
                    }}
                  >
                    Clear Conversation
                  </Button>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="text-sm font-semibold">Tips</div>
                <ul className="mt-2 list-disc ml-5 text-xs text-muted-foreground">
                  <li>Press Enter to send (Shift+Enter for newline).</li>
                  <li>Use the mic to dictate prompts faster.</li>
                  <li>Save frequently — chat is persisted locally.</li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
