import * as z from "zod";

export const formSchema = z.object({
  prompt: z.string().min(1, {
    message: "Image Prompt is required",
  }),
  amount: z.string().min(1),
  resolution: z.string().min(1),
});

export const amountOptions = [
  { value: "1", level: "1 Photo" },
  { value: "2", level: "2 Photos" },
  { value: "3", level: "3 Photos" },
  { value: "4", level: "4 Photos" },
  { value: "5", level: "5 Photos" },
];

export const resolutionOptions = [
  { value: "256x256", level: "256x256" },
  { value: "512x512", level: "512x512" },
  { value: "1024x1024", level: "1024x1024" },
];