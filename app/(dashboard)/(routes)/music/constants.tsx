import * as z from "zod";

export const MUSIC_MODELS = [
  {
    id: "facebook/musicgen-small",
    name: "MusicGen Small",
    description: "Quick music generation for simpler compositions",
  },
  {
    id: "facebook/musicgen-stereo-small",
    name: "MusicGen Stereo Small",
    description: "Faster stereo music generation with good quality",
  },
  {
    id: "facebook/musicgen-medium",
    name: "MusicGen Medium",
    description: "Balanced performance for various music styles",
  },
  {
    id: "facebook/musicgen-stereo-medium",
    name: "MusicGen Stereo Medium",
    description:
      "High-quality stereo music generation with a balanced performance",
  },
];

export const formSchema = z.object({
  prompt: z.string().min(1, {
    message: "Music prompt is required",
  }),
  models: z.array(z.string()).min(1, {
    message: "At least one model must be selected",
  }),
});
