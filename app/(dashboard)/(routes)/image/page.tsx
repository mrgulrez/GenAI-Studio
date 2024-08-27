"use client";

import * as z from "zod";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import Image from "next/image";
import { Download, Image as ImageIcon, X, Zap, RefreshCcw } from "lucide-react";

import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";
import { MiniLoader } from "@/components/mini-loader";
import { useToast } from "@/components/ui/use-toast";

import { amountOptions, formSchema, resolutionOptions, modelOptions } from "./constants";









export default function ImagePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [images, setImages] = useState<Array<{ url: string; model: string }>>([]);
  const [viewImage, setViewImage] = useState<string | null>(null);
  const [selectAll, setSelectAll] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      amount: "1",
      resolution: "512x512",
      models: [],
    },
  });

  const isLoading = form.formState.isSubmitting;

  useEffect(() => {
    if (selectAll) {
      form.setValue('models', modelOptions.map(option => option.value));
    } else {
      form.setValue('models', []);
    }
  }, [selectAll, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setImages([]);
      const response = await axios.post("/api/image", values);
      setImages(response.data.images);
      toast({
        title: "Images generated successfully",
        description: `${response.data.images.length} images have been generated.`,
      });
    } catch (error: any) {
      console.error("[ImagePage] Error:", error);
      toast({
        title: "Error",
        description: "Failed to generate images. Please try again.",
        variant: "destructive",
      });
    } finally {
      router.refresh();
    }
  };

  const resetForm = () => {
    form.reset();
    setSelectAll(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Heading
        title="AI Image Generation"
        description="Transform your ideas into stunning visuals with our multi-model AI image generator."
        icon={ImageIcon}
        iconColor="text-pink-700"
        bgColor="bg-pink-700/10"
      />

      <div className="mt-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Describe the image you want to generate..."
                        {...field}
                        className="w-full pr-16"
                        maxLength={500}
                      />
                      <span className="absolute right-2 top-2 text-sm text-gray-400">
                        {field.value.length}/500
                      </span>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Images</FormLabel>
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
                  <FormItem>
                    <FormLabel>Resolution</FormLabel>
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
            </div>

            <FormField
              control={form.control}
              name="models"
              render={() => (
                <FormItem>
                  <FormLabel>AI Models</FormLabel>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={selectAll}
                        onCheckedChange={(checked) => setSelectAll(!!checked)}
                      />
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Select All Models
                      </label>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {modelOptions.map((option) => (
                        <FormField
                          key={option.value}
                          control={form.control}
                          name="models"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={option.value}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(option.value)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, option.value])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== option.value
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {option.label}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex space-x-4">
              <Button
                type="submit"
                className="flex-1"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <MiniLoader />
                ) : (
                  <>
                    Generate Images
                    <Zap className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={resetForm}
                disabled={isLoading}
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <div className="space-y-8 mt-10">
        {images.length === 0 && !isLoading && (
          <Empty label="No images generated yet. Start creating!" />
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {images.map((image, index) => (
            <Card key={index} className="overflow-hidden">
              <div
                className="relative aspect-square cursor-pointer"
                onClick={() => setViewImage(image.url)}
              >
                <Image
                  alt={`Generated image ${index + 1}`}
                  fill
                  src={image.url}
                  className="object-cover"
                />
              </div>
              <CardFooter className="p-4 flex-col items-start">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="text-sm text-gray-500 mb-2 truncate w-full">
                        Model: {image.model}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{image.model}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = image.url;
                    link.download = `generated-image-${index + 1}.png`;
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

      {viewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative max-w-4xl w-full">
            <Button
              className="absolute top-4 right-4 z-10"
              size="icon"
              variant="secondary"
              onClick={() => setViewImage(null)}
            >
              <X className="h-4 w-4" />
            </Button>
            <Image
              src={viewImage}
              alt="Zoomed image"
              width={1024}
              height={1024}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}