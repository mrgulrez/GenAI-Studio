"use client";

import * as z from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heading } from "@/components/heading";
import { MessageCircle, Copy, Check } from "lucide-react";
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
import { ReactNode } from "react";
import React from "react";

type ChatCompletionMessageParam = {
  role: "user" | "assistant" | "system";
  content: string;
};

export default function CodePage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatCompletionMessageParam[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

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
      });

      setMessages((current) => [
        ...current,
        userMessage,
        { role: "assistant", content: response.data },
      ]);
      form.reset();
    } catch (error: any) {
      console.error("[CodePage] Error:", error);
    } finally {
      router.refresh();
    }
  };

  const onCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(content);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="mb-8 space-y-4">
      <Heading
        title="Code Generation"
        description="Generate code using descriptive text."
        icon={MessageCircle}
        iconColor="text-green-700"
        bgColor="bg-green-700/10"
      />
      <div className="px-4 lg:px-8">
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
                    <Input
                      className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                      disabled={isLoading}
                      placeholder="Simple toggle button using react Hooks"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="col-span-12 lg:col-span-2 w-full"
              disabled={isLoading}
            >
              Generate
            </Button>
          </form>
        </Form>
        <div className="space-y-4 mt-4">
          {isLoading && (
            <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
              <Loader />
            </div>
          )}
          {messages.length === 0 && !isLoading && (
            <Empty label="No conversation started" />
          )}
          <div className="flex flex-col-reverse gap-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "p-8 w-full flex items-start gap-x-8 rounded-lg",
                  message.role === "user"
                    ? "bg-white border border-black/10"
                    : "bg-muted"
                )}
              >
                {message.role === "user" ? <UserAvatar /> : <BotAvatar />}
                <div className="flex-1 overflow-hidden">
                  <ReactMarkdown
                    components={{
                      pre: ({ children }: { children: ReactNode }) => {
                        let codeContent = "";

                        const childrenArray = React.Children.toArray(children);

                        const codeElement = childrenArray.find(
                          (child): child is React.ReactElement =>
                            React.isValidElement(child) && child.type === "code"
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
                          <div className="relative overflow-auto w-full my-2 bg-black/10 p-2 rounded-lg">
                            <pre>{children}</pre>
                            <Button
                              className="absolute top-2 right-2 bg-transparent text-blue-700 items-center align-middle space-x-4 hover:bg-black/5"
                              onClick={() => onCopy(codeContent)}
                              size="icon"
                            >
                              {copied === codeContent ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        );
                      },
                      code: (props: React.HTMLProps<HTMLElement>) => (
                        <code className="rounded-lg p-1" {...props} />
                      ),
                    }}
                    className="text-sm overflow-hidden leading-7"
                  >
                    {message.content || ""}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
