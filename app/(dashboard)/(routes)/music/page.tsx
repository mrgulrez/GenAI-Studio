"use client"
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Music, Loader2 } from "lucide-react";
import { Heading } from "@/components/heading";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Empty } from "@/components/empty";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MUSIC_MODELS, formSchema } from "./constants";
import { z } from "zod";
import { Loader } from "@/components/loader";

type FormValues = z.infer<typeof formSchema>;

interface MusicOutput {
  audio: string | null;
  error: string | null;
}

export default function MusicPage() {
  const router = useRouter();
  const [musicOutputs, setMusicOutputs] = useState<Record<string, MusicOutput>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      models: [],
    },
  });

  const toggleSelectAll = () => {
    if (selectAll) {
      form.setValue("models", []);
    } else {
      form.setValue(
        "models",
        MUSIC_MODELS.map((model) => model.id)
      );
    }
    setSelectAll(!selectAll);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
      setMusicOutputs({});
      const responses = await Promise.all(
        values.models.map((modelId) =>
          axios
            .post("/api/music", { prompt: values.prompt, model: modelId })
            .then((response) => ({ modelId, data: response.data, error: null }))
            .catch((error) => ({
              modelId,
              data: null,
              error: error.response?.data?.error || "Failed to generate music",
            }))
        )
      );

      const newOutputs: Record<string, MusicOutput> = {};
      responses.forEach(({ modelId, data, error }) => {
        newOutputs[modelId] = {
          audio: data?.audio || null,
          error: error,
        };
      });
      setMusicOutputs(newOutputs);

      const successCount = responses.filter((r) => !r.error).length;
      if (successCount > 0) {
        toast({
          title: "Music generation complete",
          description: `Successfully generated music for ${successCount} out of ${values.models.length} models.`,
        });
      } else {
        toast({
          title: "Music generation failed",
          description:
            "Failed to generate music for all selected models. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("[MusicPage] Error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaybackRateChange = (modelId: string, rate: number) => {
    const audioElement = audioRefs.current[modelId];
    if (audioElement) {
      audioElement.playbackRate = rate;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Heading
        title="AI Music Composer"
        description="Transform your ideas into melodies with AI"
        icon={Music}
        iconColor="text-emerald-500"
        bgColor="bg-emerald-500/10"
      />
      <Card className="mt-8">
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prompt</FormLabel>
                    <FormControl>
                      <Textarea
                        className="min-h-[100px] resize-none"
                        disabled={isLoading}
                        placeholder="Describe the music you want to create..."
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="models"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={selectAll}
                          onCheckedChange={toggleSelectAll}
                        />
                        <span>
                          Select All Models ({MUSIC_MODELS.length} available)
                        </span>
                      </div>
                    </FormLabel>

                    <FormControl>
                      <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                        {MUSIC_MODELS.map((model) => (
                          <div
                            key={model.id}
                            className="flex items-center space-x-2 mb-4"
                          >
                            <Checkbox
                              checked={field.value.includes(model.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, model.id])
                                  : field.onChange(
                                      field.value.filter(
                                        (value) => value !== model.id
                                      )
                                    );
                              }}
                            />
                            <div className="grid gap-1.5 leading-none">
                              <label
                                htmlFor={`model-${model.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {model.name}
                              </label>
                              <p className="text-sm text-muted-foreground">
                                {model.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </ScrollArea>
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? (
                  <>
                    {" "}
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Composing...
                  </>
                ) : (
                  <>
                    <Music className="mr-2 h-4 w-4" />
                    Compose Music
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardContent className="pt-6">
          {isLoading && (
            <div className="flex items-center justify-center">
              <Loader />
            </div>
          )}
          {Object.keys(musicOutputs).length === 0 && !isLoading && (
            <Empty label="No music composed yet." />
          )}
          {Object.entries(musicOutputs).map(([modelId, output]) => (
            <div key={modelId} className="mb-6 p-4 bg-gray-100 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">
                {MUSIC_MODELS.find((m) => m.id === modelId)?.name ||
                  "Unknown Model"}
              </h3>
              {output.error ? (
                <Alert variant="destructive">
                  {/* <AlertTriangle className="h-4 w-4" /> */}
                  <AlertDescription>{output.error}</AlertDescription>
                </Alert>
              ) : output.audio ? (
                <>
                  <audio
                    ref={(el) => {
                      audioRefs.current[modelId] = el;
                    }}
                    controls
                    className="w-full mb-2"
                  >
                    <source src={output.audio} type="audio/wav" />
                    Your browser does not support the audio element.
                  </audio>

                  <div className="flex items-center justify-between">
                    <select
                      className="border p-1 rounded"
                      onChange={(e) =>
                        handlePlaybackRateChange(
                          modelId,
                          parseFloat(e.target.value)
                        )
                      }
                    >
                      <option value="0.25">0.25x</option>
                      <option value="0.5">0.5x</option>
                      <option value="1" selected>
                        1x (Normal)
                      </option>
                      <option value="1.5">1.5x</option>
                      <option value="2">2x</option>
                    </select>
                    <a
                      href={output.audio}
                      download={`composition_${modelId.replace("/", "_")}.wav`}
                      className="text-blue-600 underline"
                    >
                      Download
                    </a>
                  </div>
                </>
              ) : null}
            </div>
          ))}
        </CardContent>
        <CardFooter></CardFooter>
      </Card>
    </div>
  );
}
