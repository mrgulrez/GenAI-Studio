import * as z from "zod";

export const formSchema = z.object({
  prompt: z.string().min(1, {
    message: "Image Prompt is required",
  }),
  amount: z.string().min(1),
  resolution: z.string().min(1),
  models: z.array(z.string()).min(1, {
    message: "Select at least one model",
  }),
});

export const amountOptions = [
  { value: "1", level: "1 Photo" },
  { value: "2", level: "2 Photos" },
  { value: "3", level: "3 Photos" },
  { value: "4", level: "4 Photos" },
  { value: "5", level: "5 Photos" },
];

export const resolutionOptions = [
  { value: "512x512", level: "512x512" },
];

export const modelOptions = [
  { value: "black-forest-labs/FLUX.1-dev", label: "FLUX.1-dev" },
  { value: "black-forest-labs/FLUX.1-schnell", label: "FLUX.1-schnell" },
  { value: "runwayml/stable-diffusion-v1-5", label: "Stable Diffusion v1.5" },
  { value: "stabilityai/stable-diffusion-xl-base-1.0", label: "Stable Diffusion XL Base 1.0" },
  { value: "stabilityai/sdxl-turbo", label: "sdxl-turbo" },
  { value: "stabilityai/stable-diffusion-2-1", label: "Stable Diffusion 2.1" },
];