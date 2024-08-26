"use client";

import * as z from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heading } from "@/components/heading";
import { Music } from "lucide-react";
import { useForm } from "react-hook-form";
import { formSchema } from "./constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField, FormItem, Form, FormControl } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

export default function MusicPage() {
  const router = useRouter();
  const [music, setMusic] = useState<string>();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setMusic(undefined);
      const response = await axios.post("/api/music", values);
      setMusic(response.data.audio);
      form.reset();
      toast({
        title: "Music generated successfully",
        description: "Your music is ready to play!",
      });
    } catch (error: any) {
      console.error("[MusicPage] Error:", error);
      toast({
        title: "Error",
        description: "Failed to generate music. Please try again.",
        variant: "destructive",
      });
    } finally {
      router.refresh();
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        className="min-h-[100px] resize-none"
                        disabled={isLoading}
                        placeholder="Describe the music you want to create..."
                        {...field}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault(); // Prevent the default form submission behavior
                            form.handleSubmit(onSubmit)(); // Trigger the submit function
                          }
                        }}
                      />
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
            <div className="flex items-center justify-center" >
              <Loader />
            </div>
          )}
          {!music && !isLoading && <Empty label="No music composed yet." />}
          {music && (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold">Your Composition</h3>

    {/* Audio Playback with Speed Control */}
    <audio controls className="w-full" id="audioPlayer">
      <source src={music} type="audio/wav" />
      Your browser does not support the audio element.
    </audio>

    {/* Speed Control */}
    <div className="flex items-center space-x-2">
      <label htmlFor="speedControl" className="text-sm font-medium">
        Speed:
      </label>
      <select
        id="speedControl"
        className="border p-1 rounded"
        onChange={(e) => {
          const audioPlayer = document.getElementById("audioPlayer") as HTMLAudioElement;
          audioPlayer.playbackRate = parseFloat(e.target.value);
        }}
      > <option value="0.5">0.25x</option>
        <option value="0.5">0.5x</option>
        <option value="1" selected>
          1x (Normal)
        </option>
        <option value="1.5">1.5x</option>
        <option value="2">2x</option>
      </select>
    </div>

    {/* Download Button */}
    <div>
      <a
        href={music}
        download="composition.wav"
        className="text-blue-500 hover:text-blue-700 font-semibold"
      >
        Download Audio
      </a>
    </div>
  </div>
)}

        </CardContent>
        {music && (
          <CardFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setMusic(undefined)}
            >
              Clear Composition
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
