"use client";

import * as z from "zod";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heading } from "@/components/heading";
import { MessageSquareIcon, Send, Mic } from "lucide-react";
import { useForm } from "react-hook-form";
import { formSchema } from "./constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField, FormItem, Form, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import axios from "axios";
import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";
import { UserAvatar } from "@/components/user.avatar";
import { BotAvatar } from "@/components/bot-avatar";
import ReactMarkdown from "react-markdown";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";




type ChatCompletionMessageParam = {
  role: "user" | "assistant" | "system";
  content: string;
};

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any; 
  }
}


type SpeechRecognition = any;

export default function ConversationPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatCompletionMessageParam[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined" && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition =
        window.webkitSpeechRecognition || window.SpeechRecognition;
      const speechRecognitionInstance = new SpeechRecognition();

      speechRecognitionInstance.continuous = false;
      speechRecognitionInstance.interimResults = false;
      speechRecognitionInstance.lang = "en-US";

      speechRecognitionInstance.onresult = (event:any) => {
        const transcript = event.results[0][0].transcript;
        form.setValue("prompt", transcript);
      };

      speechRecognitionInstance.onerror = (event:any) => {
        console.error("Speech recognition error", event);
        setIsRecording(false);
      };

      speechRecognitionInstance.onend = () => {
        setIsRecording(false);
      };

      setRecognition(speechRecognitionInstance);
    } else {
      console.warn("Speech recognition not supported in this browser.");
    }
  }, [form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const userMessage: ChatCompletionMessageParam = {
        role: "user",
        content: values.prompt,
      };
      const newMessages = [...messages, userMessage];

      const response = await axios.post("/api/conversation", {
        messages: newMessages,
      });

      setMessages((current) => [
        ...current,
        userMessage,
        { role: "assistant", content: response.data },
      ]);
      form.reset();
    } catch (error: any) {
      console.error("[ConversationPage] Error:", error);
    } finally {
      router.refresh();
    }
  };

  const handleVoiceInput = () => {
    if (!recognition) {
      console.error("Speech Recognition not supported");
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      recognition.start();
      setIsRecording(true);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();  // Prevents newline from being entered
      form.handleSubmit(onSubmit)();  // Submits the form
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <Heading
        title="GenAI Studio Chatbot Conversation"
        description="Our advanced AI-powered conversation model"
        icon={MessageSquareIcon}
        iconColor="text-violet-500"
        bgColor="bg-violet-500/10"
      />
      <div className="flex-grow p-4 lg:p-8 flex flex-col">
        <ScrollArea className="flex-grow mb-4 pr-4" ref={scrollAreaRef}>
          {messages.length === 0 && !isLoading ? (
            <Empty label="Start a conversation with GenAI Studio" />
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-4 rounded-lg flex items-start gap-x-4",
                    message.role === "user"
                      ? "bg-white border border-black/10"
                      : "bg-muted"
                  )}
                >
                  {message.role === "user" ? <UserAvatar /> : <BotAvatar />}
                  <ReactMarkdown className="prose flex-grow">
                    {message.content}
                  </ReactMarkdown>
                </div>
              ))}
              {isLoading && (
                <div className="p-4 rounded-lg w-full flex items-center justify-center bg-muted">
                  <Loader />
                </div>
              )}
            </div>
          )}
        </ScrollArea>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2"
          >
            <FormField
              name="prompt"
              render={({ field }) => (
                <FormItem className="col-span-12 lg:col-span-10">
                  <FormControl className="m-0 p-0">
                    <Textarea
                      className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent resize-none"
                      rows={1}
                      disabled={isLoading}
                      placeholder="Type your message to GenAI Studio..."
                      {...field}
                      onKeyDown={handleKeyDown}
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
                onClick={handleVoiceInput}
                className={cn(isRecording && "text-red-500")}
              >
                <Mic className={isRecording ? "animate-pulse" : ""} />
              </Button>
              <Button type="submit" size="icon" disabled={isLoading}>
                <Send />
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
