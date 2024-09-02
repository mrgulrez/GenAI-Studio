"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Music, Loader2 } from "lucide-react";
import { Heading } from "@/components/heading";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Empty } from "@/components/empty";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MUSIC_MODELS, formSchema } from "./constants";
import { z } from "zod";
import { Loader } from "@/components/loader";
import WaveSurfer from 'wavesurfer.js';

type FormValues = z.infer<typeof formSchema>;

interface MusicOutput { 
  audio: string | null; 
  error: string | null; 
}

const TIMEOUT_DURATION = 60000;

export default function MusicPage() {
  const router = useRouter();
  const [musicOutputs, setMusicOutputs] = useState<Record<string, MusicOutput>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [volume, setVolume] = useState<number>(1);
  const [waveformRef, setWaveformRef] = useState<Record<string, HTMLDivElement | null>>({});
  const [wavesurferInstance, setWavesurferInstance] = useState<Record<string, WaveSurfer | null>>({});

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
      form.setValue("models", MUSIC_MODELS.map((model) => model.id));
    }
    setSelectAll(!selectAll);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
      setMusicOutputs({});

      const responses = await Promise.all(
        values.models.map(async (modelId) => {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_DURATION);

            const response = await axios.post("/api/music",
              { prompt: values.prompt, model: modelId },
              { signal: controller.signal }
            );

            clearTimeout(timeoutId);
            return { modelId, data: response.data, error: null };
          } catch (error: any) {
            if (axios.isCancel(error)) {
              return { modelId, data: null, error: "Request timed out" };
            }
            return {
              modelId,
              data: null,
              error: error.response?.data?.error || "Failed to generate music",
            };
          }
        })
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
        toast.success(`Music generated successfully for ${successCount} model(s)`);
      } else {
        toast.error("Failed to generate music for all models");
      }
    } catch (error: any) {
      console.error("Error in music generation:", error);
      toast.error(`Error: ${error.message || "Something went wrong. Please try again."}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(event.target.value);
    setVolume(volume);
    Object.values(wavesurferInstance).forEach(ws => {
      if (ws) {
        ws.setVolume(volume);
      }
    });
  };

  useEffect(() => {
    Object.entries(musicOutputs).forEach(([modelId, output]) => {
      if (output.audio && waveformRef[modelId]) {
        const wavesurfer = WaveSurfer.create({
          container: waveformRef[modelId]!,
          waveColor: 'violet',
          progressColor: 'purple',
          height: 150,
        });

        wavesurfer.load(output.audio);
        setWavesurferInstance(prev => ({ ...prev, [modelId]: wavesurfer }));
      }
    });
  }, [musicOutputs, waveformRef]);

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
              <FormField control={form.control} name="prompt" render={({ field }) => (
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
              )} />
              <FormField control={form.control} name="models" render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <div className="flex items-center space-x-2">
                      <Checkbox checked={selectAll} onCheckedChange={toggleSelectAll} />
                      <span>Select All Models ({MUSIC_MODELS.length} available)</span>
                    </div>
                  </FormLabel>
                  <FormControl>
                    <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                      {MUSIC_MODELS.map((model) => (
                        <div key={model.id} className="flex items-center space-x-2 mb-4">
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
              )} />
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
                  <AlertDescription>{output.error}</AlertDescription>
                </Alert>
              ) : output.audio ? (
                <>
                  <div
                    ref={(el) => {
                      if (el) waveformRef[modelId] = el;
                    }}
                    className="waveform mb-4"
                  ></div>

                  <audio
                    controls
                    className="w-full mb-2"
                    src={output.audio}
                  >
                    Your browser does not support the audio element.
                  </audio>

                  <div className="flex items-center justify-between mb-4">
                    <select
                      className="border p-1 rounded"
                      onChange={(e) =>
                        wavesurferInstance[modelId]?.setPlaybackRate(parseFloat(e.target.value))
                      }
                      defaultValue="1"
                    >
                      <option value="0.25">0.25x</option>
                      <option value="0.5">0.5x</option>
                      <option value="1">1x (Normal)</option>
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

                  <div className="flex items-center space-x-2">
                    <label htmlFor={`volume-${modelId}`} className="text-sm">Volume:</label>
                    <input
                      id={`volume-${modelId}`}
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-1/2"
                    />
                    <span>{(volume * 100).toFixed(0)}%</span>
                  </div>
                </>
              ) : null}
            </div>
          ))}
        </CardContent>
        <CardFooter className="items-center justify-center">
          <div className="text-sm text-gray-500">
            Adjust playback rate and volume using the controls above. For best results, preview the audio before downloading.
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
