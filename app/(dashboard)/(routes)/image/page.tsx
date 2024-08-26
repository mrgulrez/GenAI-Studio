"use client";

import * as z from "zod";
import { 
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heading } from "@/components/heading";
import { Download, Image as ImageIcon, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { FormField, FormItem, Form, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";
import { zodResolver } from "@hookform/resolvers/zod";

import { amountOptions, formSchema, resolutionOptions } from "./constants";
import { Card, CardFooter } from "@/components/ui/card";
import Image from "next/image";

export default function ImagePage() {
  const router = useRouter();
  const [images, setImages] = useState<string[]>([]);
  const [viewImage, setViewImage] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      amount: "1",
      resolution: "512x512",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setImages([]);
      const response = await axios.post("/api/image", values);

      setImages(response.data.images);
      form.reset();
    } catch (error: any) {
      console.error("[ImagePage] Error:", error);
    } finally {
      router.refresh();
    }
  };



  return (
    <div className="mb-8 space-y-4">
      <Heading
        title="Image Generation"
        description="Turn your prompt into an image"
        icon={ImageIcon}
        iconColor="text-pink-500"
        bgColor="bg-pink-500/10"
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
                <FormItem className="col-span-12 lg:col-span-6">
                  <FormControl className="m-0 p-0">
                    <Input
                      className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                      disabled={isLoading}
                      placeholder="A picture of horse in the forest"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem className="col-span-12 lg:col-span-2">
                  <Select
                    disabled={isLoading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue defaultValue={field.value} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {amountOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="resolution"
              render={({ field }) => (
                <FormItem className="col-span-12 lg:col-span-2">
                  <Select
                    disabled={isLoading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue defaultValue={field.value} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {resolutionOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
            <div className="p-20">
              <Loader />
            </div>
          )}
          {images.length === 0 && !isLoading && (
            <Empty label="No Images generated" />
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8">
            {images.map((src, index) => (
              <Card 
                key={index}
                className="rounded-lg overflow-hidden"
              >
                <div className="relative aspect-square cursor-pointer" onClick={() => setViewImage(src)}>
                  <Image
                    alt="Generated image"
                    fill
                    src={src}
                  />
                </div>
                <CardFooter className="p-2">
                  <Button 
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = src;
                      link.download = `generated-image-${index}.png`;
                      link.click();
                    }}
                    variant="secondary" 
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
      {viewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative">
            <Button 
              className="absolute top-2 right-2 z-10"
              size="icon"
              variant="secondary"
              onClick={() => setViewImage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
            <Image
              src={viewImage}
              alt="Zoomed image"
              width={800}
              height={800}
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}