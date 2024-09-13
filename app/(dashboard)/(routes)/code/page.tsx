"use client";

import * as z from "zod";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heading } from "@/components/heading";
import {
  MessageCircle,
  Copy,
  Check,
  Code,
  Send,
  Trash,
  Download,
  Moon,
  Sun,
  Save,
  RefreshCcw,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { formSchema } from "./constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField, FormItem, Form, FormControl } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import axios from "axios";
import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";
import { UserAvatar } from "@/components/user.avatar";
import { BotAvatar } from "@/components/bot-avatar";
import ReactMarkdown from "react-markdown";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Toaster, toast } from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Import Select components

type ChatCompletionMessageParam = {
  role: "user" | "assistant" | "system";
  content: string;
};

export default function CodePage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatCompletionMessageParam[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [latestCode, setLatestCode] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false); // State for dark mode
  const [selectedModel, setSelectedModel] = useState<string>("llama3-70b-8192"); // State for selected model

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  useEffect(() => {
    document.body.className = isDarkMode ? "dark" : "";
  }, [isDarkMode]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const userMessage: ChatCompletionMessageParam = {
        role: "user",
        content: values.prompt,
      };
      const newMessages = [...messages, userMessage];

      const response = await axios.post("/api/code", {
        messages: newMessages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        model: selectedModel, // Include selected model in the API request
      });

      const assistantMessage: ChatCompletionMessageParam = {
        role: "assistant",
        content: response.data,
      };

      setMessages((current) => [...current, userMessage, assistantMessage]);
      setLatestCode(response.data); // Store the latest generated code
      toast.success("Code generated successfully!");
      form.reset();
    } catch (error: any) {
      if (error.status.code === 500) {
        toast.error("High traffic! Please try again later.");
      } else if (error.message === 504) {
        toast.error(
          "Request timeout or longer response! Please try again later."
        );
      } else {
        toast.error("Failed to generate code! Please try again later.");
      }
    } finally {
      router.refresh();
    }
  };

  const onCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(content);
    setTimeout(() => setCopied(null), 2000);
    toast.success("Code copied to clipboard!");
  };

  const onClear = () => {
    setMessages([]);
    setLatestCode(null); // Clear the latest code
    form.reset();
    toast.success("Chat cleared successfully!");
  };

  const onDownload = () => {
    const content = messages
      .map((msg) => `${msg.role.toUpperCase()}:\n${msg.content}\n\n`)
      .join("");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "code_conversation.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const onSaveSession = () => {
    // Save the current session to local storage
    localStorage.setItem("chatSession", JSON.stringify(messages));
    toast.success("Session saved successfully!");
  };

  const onLoadSession = () => {
    // Load the saved session from local storage
    const savedMessages = localStorage.getItem("chatSession");
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
      toast.success("Session loaded successfully check chat history!");
    } else {
      toast.error("No saved session found!");
    }
  };

  return (
    <div
      className={cn(
        "container mx-auto p-4",
        isDarkMode ? "dark bg-gray-900 text-white" : "bg-white text-black"
      )}
    >
      <Toaster position="top-right" />
      <Heading
        title="AI Code Assistant"
        description="Generate, analyze, and optimize code using AI."
        icon={Code}
        iconColor="text-green-700"
        bgColor="bg-green-700/10"
      />

      {/* Model Selection Dropdown */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-4 space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4 w-full md:w-auto">
          <Select onValueChange={setSelectedModel} defaultValue={selectedModel}>
            <SelectTrigger className="w-full md:w-64">
              <SelectValue placeholder="Select Model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Meta-Llama-3.1-405B">
                Llama-3.1-405B
              </SelectItem>
              <SelectItem value="llama3-70b-8192">Llama3-70b-8192</SelectItem>
              <SelectItem value="llama3-8b-8192">Llama3-8b-8192</SelectItem>
              <SelectItem value="llama-guard-3-8b">Llama-Guard-3-8b</SelectItem>
              <SelectItem value="llama-3.1-8b-instant">
                Llama-3.1-8b-Instant
              </SelectItem>
              <SelectItem value="llama-3.1-70b-versatile">
                Llama-3.1-70b-Versatile
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Other buttons */}
        <Button
          onClick={onLoadSession}
          variant="outline"
          className="flex items-center space-x-2 w-full md:w-auto"
        >
          <RefreshCcw className="w-4 h-4" />
          <span>Load Session</span>
        </Button>
        <Button
          onClick={onSaveSession}
          variant="outline"
          className="flex items-center space-x-2 w-full md:w-auto"
        >
          <Save className="w-4 h-4" />
          <span>Save Session</span>
        </Button>
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Sun
            className={cn(
              "w-4 h-4",
              isDarkMode ? "text-gray-500" : "text-yellow-500"
            )}
          />
          <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
          <Moon
            className={cn(
              "w-4 h-4",
              isDarkMode ? "text-blue-500" : "text-gray-500"
            )}
          />
        </div>
      </div>

      <Tabs defaultValue="generate" className="mt-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">Generate Code</TabsTrigger>
          <TabsTrigger value="chat">Chat History</TabsTrigger>
        </TabsList>
        <TabsContent value="generate">
          <Card>
            <CardContent className="pt-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    name="prompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            className={cn(
                              "min-h-[100px] resize",
                              isDarkMode
                                ? "bg-gray-800 text-white"
                                : "bg-gray-100"
                            )}
                            disabled={isLoading}
                            placeholder="Describe the code you want to generate..."
                            {...field}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                form.handleSubmit(onSubmit)();
                              }
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClear}
                      disabled={isLoading || messages.length === 0}
                    >
                      <Trash className="w-4 h-4 mr-2" />
                      Clear
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="bg-green-700 hover:bg-green-800"
                    >
                      {isLoading ? (
                        <div className="animate-spin">✨</div>
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      Generate
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Display only the current generated code */}
          {latestCode && (
            <Card className="mt-8">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <BotAvatar />
                    <span className="ml-2 font-semibold text-green-700">
                      Generated Code
                    </span>
                  </div>
                  <Button
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={() => onCopy(latestCode)}
                    size="sm"
                  >
                    {copied === latestCode ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <ReactMarkdown
                  components={{
                    code: (props) => (
                      <code
                        className={cn(
                          "block bg-gray-800 text-white p-4 rounded mt-2",
                          isDarkMode ? "bg-gray-900" : "bg-gray-100 text-black"
                        )}
                        {...props}
                      />
                    ),
                  }}
                  className="text-sm leading-relaxed"
                >
                  {latestCode || ""}
                </ReactMarkdown>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent
          value="chat"
          className={cn(
            "bg-white dark:bg-gray-900 pt-6",
            isDarkMode ? "dark" : ""
          )}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <Empty label="No conversation started" />
                ) : (
                  <>
                    <div className="flex justify-end mb-4">
                      <Button onClick={onDownload} variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download Chat
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {[...messages].reverse().map((message, index) => (
                        <div
                          key={index}
                          className={cn(
                            "p-4 rounded-lg",
                            message.role === "user"
                              ? "bg-blue-100 text-blue-900"
                              : "bg-gray-100 text-gray-900",
                            isDarkMode ? "bg-gray-800 text-white" : ""
                          )}
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            {message.role === "user" ? (
                              <UserAvatar />
                            ) : (
                              <BotAvatar />
                            )}
                            <span className="font-semibold">
                              {message.role === "user" ? "You" : "AI Assistant"}
                            </span>
                          </div>
                          <ReactMarkdown
                            components={{
                              pre: ({ children }) => {
                                let codeContent = "";
                                const childrenArray =
                                  React.Children.toArray(children);
                                const codeElement = childrenArray.find(
                                  (child): child is React.ReactElement =>
                                    React.isValidElement(child) &&
                                    child.type === "code"
                                );
                                if (codeElement) {
                                  const codeChildren = React.Children.toArray(
                                    codeElement.props.children
                                  );
                                  codeContent = codeChildren
                                    .map((child) =>
                                      typeof child === "string" ? child : ""
                                    )
                                    .join("");
                                }
                                return (
                                  <div className="relative bg-gray-800 text-white p-4 rounded-md my-2">
                                    <pre className="overflow-x-auto">
                                      {children}
                                    </pre>
                                  </div>
                                );
                              },
                              code: (props) => (
                                <code
                                  className={cn(
                                    "bg-gray-200 text-gray-900 px-1 py-0.5 rounded",
                                    isDarkMode
                                      ? "bg-gray-900 text-white"
                                      : "bg-gray-200"
                                  )}
                                  {...props}
                                />
                              ),
                            }}
                            className="text-sm leading-relaxed"
                          >
                            {message.content || ""}
                          </ReactMarkdown>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
