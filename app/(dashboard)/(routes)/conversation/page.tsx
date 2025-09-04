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
  Edit3,
  Search,
  Download,
  Upload,
  History,
  Pin,
  Pause,
  Bot,
  User,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { formSchema } from "./constants";
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [pinnedMessages, setPinnedMessages] = useState<string[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

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

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Load conversation history
    try {
      const history = localStorage.getItem("genai_conversation_history");
      if (history) {
        setConversationHistory(JSON.parse(history));
      }
    } catch (e) {
      console.error("Failed to load conversation history", e);
    }

    // Load pinned messages
    try {
      const pinned = localStorage.getItem("genai_pinned_messages");
      if (pinned) {
        setPinnedMessages(JSON.parse(pinned));
      }
    } catch (e) {
      console.error("Failed to load pinned messages", e);
    }
  }, []);

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
      
      // Save to history
      const historyItem = {
        id: Date.now(),
        title: messages.length > 0 
          ? messages[0].content.slice(0, 30) + (messages[0].content.length > 30 ? "..." : "")
          : "New Conversation",
        timestamp: Date.now(),
        messageCount: messages.length
      };
      
      const updatedHistory = [historyItem, ...conversationHistory.filter((h: any) => 
        h.title !== historyItem.title
      ).slice(0, 9)];
      
      setConversationHistory(updatedHistory);
      localStorage.setItem("genai_conversation_history", JSON.stringify(updatedHistory));
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
      const interval = Math.max(6, Math.floor(600 / Math.max(1, fullText.length / 30)));
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

      const text = resp.data.text;

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

  const handleEditMessage = (id: string, content: string) => {
    setIsEditing(id);
    setEditContent(content);
  };

  const saveEditedMessage = (id: string) => {
    setMessages(messages.map(msg => 
      msg.id === id ? {...msg, content: editContent} : msg
    ));
    setIsEditing(null);
    setEditContent("");
  };

  const togglePinMessage = (id: string) => {
    const newPinned = pinnedMessages.includes(id)
      ? pinnedMessages.filter(msgId => msgId !== id)
      : [...pinnedMessages, id];
    
    setPinnedMessages(newPinned);
    localStorage.setItem("genai_pinned_messages", JSON.stringify(newPinned));
  };

  // Text-to-speech: picks a good female voice when available and speaks in chunks
  const handleSpeak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const synth = window.speechSynthesis;

    if (isSpeaking) {
      synth.cancel();
      setIsSpeaking(false);
      return;
    }

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
        setIsSpeaking(true);
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
      } finally {
        setIsSpeaking(false);
      }
    })();
  };

  const handleDeleteMessage = (id: string) => setMessages((cur) => cur.filter((m) => m.id !== id));

  const handleSuggestion = (s: string) => {
    form.setValue("prompt", s);
    form.handleSubmit(onSubmit)();
  };

  const filteredMessages = searchQuery
    ? messages.filter(msg => 
        msg.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  const loadConversation = (id: number) => {
    // In a real app, we would load the conversation from storage
    // This is a simplified implementation
    const conversation = conversationHistory.find(c => c.id === id);
    if (conversation) {
      setShowHistory(false);
      // Would actually load the messages here
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      <Heading
        title="GenAI Studio — Chat"
        description="Interactive assistant with voice, quick prompts, and persistent conversations"
        icon={MessageSquareIcon}
        iconColor="text-violet-600"
        bgColor="bg-violet-600/10"
      />

      <div className="flex-1 p-4 lg:p-6 flex flex-col gap-4 overflow-hidden">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2"
            >
              <History size={16} />
              History
            </Button>
            <div className="text-sm text-muted-foreground hidden md:block">
              {messages.length} messages · Saved locally
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <input
                type="text"
                placeholder="Search messages..."
                className="pl-8 pr-4 py-1.5 text-sm rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button size="sm" variant="outline" onClick={handleSave} disabled={isSaving} className="flex items-center gap-1">
              {isSaving ? <LoaderIcon className="animate-spin h-4 w-4" /> : <Save size={16} />}
              <span className="hidden sm:inline">Save</span>
            </Button>
            <Button size="sm" variant="outline" onClick={handleClear} disabled={isClearing} className="flex items-center gap-1">
              <Trash2 size={16} /> 
              <span className="hidden sm:inline">Clear</span>
            </Button>
          </div>
        </div>

        <div className="flex gap-4 h-full overflow-hidden">
          {/* Main Chat Container */}
          <div className="w-full lg:w-3/4 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              {messages.length === 0 ? (
                <Empty label="Say hi to GenAI — try a suggestion below" />
              ) : (
                <div className="space-y-4">
                  {filteredMessages.map((m) => (
                    <div
                      key={m.id}
                      className={cn(
                        "p-4 rounded-xl flex items-start gap-4 group relative",
                        m.role === "user" 
                          ? "bg-blue-50 border border-blue-200" 
                          : "bg-gray-50 border border-gray-200",
                        pinnedMessages.includes(m.id) && "ring-2 ring-yellow-400"
                      )}
                    >
                      <div className="flex-shrink-0">
                        {m.role === "user" ? (
                          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                            <User size={16} className="text-white" />
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                            <Bot size={16} className="text-white" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="text-sm font-medium text-gray-800">
                            {m.role === "user" ? "You" : "GenAI Assistant"}
                          </div>
                          <div className="text-xs text-gray-500">{m.time}</div>
                        </div>

                        <div className="mt-1 text-sm prose max-w-full">
                          {isEditing === m.id ? (
                            <div className="space-y-2">
                              <Textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="min-h-[100px]"
                                autoFocus
                              />
                              <div className="flex gap-2">
                                <Button size="sm" onClick={() => saveEditedMessage(m.id)}>
                                  Save
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={() => setIsEditing(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <ReactMarkdown>{m.content}</ReactMarkdown>
                          )}
                        </div>

                        <div className="mt-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            aria-label="copy"
                            className="text-xs p-1.5 rounded-md hover:bg-gray-200 transition-colors"
                            onClick={() => handleCopy(m.content)}
                          >
                            <Copy size={14} />
                          </button>

                          {m.role === "assistant" && (
                            <button
                              aria-label="speak"
                              className="text-xs p-1.5 rounded-md hover:bg-gray-200 transition-colors"
                              onClick={() => handleSpeak(m.content)}
                            >
                              {isSpeaking ? <Pause size={14} /> : <Speaker size={14} />}
                            </button>
                          )}

                          <button
                            aria-label="edit"
                            className="text-xs p-1.5 rounded-md hover:bg-gray-200 transition-colors"
                            onClick={() => handleEditMessage(m.id, m.content)}
                          >
                            <Edit3 size={14} />
                          </button>

                          <button
                            aria-label="pin"
                            className="text-xs p-1.5 rounded-md hover:bg-gray-200 transition-colors"
                            onClick={() => togglePinMessage(m.id)}
                          >
                            <Pin size={14} className={pinnedMessages.includes(m.id) ? "fill-yellow-400 text-yellow-400" : ""} />
                          </button>

                          <button
                            aria-label="delete"
                            className="text-xs p-1.5 rounded-md hover:bg-gray-200 transition-colors"
                            onClick={() => handleDeleteMessage(m.id)}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Input Area - Fixed at Bottom */}
            <div className="border-t border-gray-200 p-4 bg-white sticky bottom-0">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-12 gap-2 items-end">
                  <FormField
                    name="prompt"
                    render={({ field }) => (
                      <FormItem className="col-span-12 lg:col-span-10">
                        <FormControl>
                          <Textarea
                            {...field}
                            ref={textareaRef}
                            rows={1}
                            placeholder="Type a message or press the mic to speak..."
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                form.handleSubmit(onSubmit)();
                              }
                            }}
                            className="resize-none min-h-[60px] border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                      variant={isRecording ? "destructive" : "outline"}
                      onClick={handleVoice}
                      aria-pressed={isRecording}
                      className="rounded-full h-10 w-10"
                    >
                      {isRecording ? <LoaderIcon className="animate-spin h-5 w-5" /> : <Mic size={18} />}
                    </Button>

                    <Button 
                      type="submit" 
                      size="icon" 
                      disabled={isLoading} 
                      aria-label="Send message"
                      className="rounded-full h-10 w-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      {isLoading ? <LoaderIcon className="animate-spin h-5 w-5" /> : <Send size={18} />}
                    </Button>
                  </div>
                </form>
              </Form>

              <div className="mt-3 flex flex-wrap gap-2">
                {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSuggestion(s)}
                      className="text-left px-3 py-1.5 rounded-full text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 hover:from-blue-200 hover:to-indigo-200 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <aside className="hidden lg:block lg:w-1/4">
            <div className="sticky top-0 h-full overflow-y-auto space-y-4">
              {showHistory ? (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Conversation History</h3>
                    <Button variant="ghost" size="sm" onClick={() => setShowHistory(false)}>
                      <X size={16} />
                    </Button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {conversationHistory.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No history yet</p>
                    ) : (
                      <div className="space-y-2">
                        {conversationHistory.map((conversation) => (
                          <div 
                            key={conversation.id} 
                            className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => loadConversation(conversation.id)}
                          >
                            <div className="font-medium text-sm">{conversation.title}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(conversation.timestamp).toLocaleDateString()} · {conversation.messageCount} messages
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-semibold">Quick Tools</div>
                      <Zap size={18} className="text-blue-600" />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
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
                        className="text-xs h-9"
                      >
                        <Download size={14} className="mr-1" />
                        Export JSON
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const text = messages.map(m => `${m.role}: ${m.content}`).join('\n\n');
                          const blob = new Blob([text], { type: "text/plain" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `genai_conversation_${Date.now()}.txt`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        className="text-xs h-9"
                      >
                        <Download size={14} className="mr-1" />
                        Export Text
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Implement import functionality
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = '.json';
                          input.onchange = (e: any) => {
                            const file = e.target.files[0];
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              try {
                                const content = JSON.parse(e.target?.result as string);
                                if (Array.isArray(content)) {
                                  setMessages(content);
                                }
                              } catch (err) {
                                console.error('Error parsing JSON file', err);
                              }
                            };
                            reader.readAsText(file);
                          };
                          input.click();
                        }}
                        className="text-xs h-9"
                      >
                        <Upload size={14} className="mr-1" />
                        Import
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm("Are you sure you want to clear the conversation?")) handleClear();
                        }}
                        className="text-xs h-9"
                      >
                        <Trash2 size={14} className="mr-1" />
                        Clear
                      </Button>
                    </div>
                  </div>

                  {pinnedMessages.length > 0 && (
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-semibold">Pinned Messages</div>
                        <Pin size={16} className="text-yellow-500" />
                      </div>
                      <div className="max-h-40 overflow-y-auto">
                        {messages
                          .filter(m => pinnedMessages.includes(m.id))
                          .map(m => (
                            <div key={m.id} className="p-2 mb-2 text-sm bg-yellow-50 rounded-lg border border-yellow-200">
                              <div className="font-medium">{m.role === "user" ? "You" : "GenAI"}</div>
                              <div className="truncate">{m.content.slice(0, 60)}...</div>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  )}

                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <div className="font-semibold mb-3">Tips & Shortcuts</div>
                    <ul className="space-y-1.5 text-sm text-gray-600">
                      <li className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        Press <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 rounded border">Enter</kbd> to send
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        Use <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 rounded border">Shift+Enter</kbd> for new line
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        Click message actions on hover
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        Search through all messages
                      </li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}