// "use client";

// import * as z from "zod";
// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { Heading } from "@/components/heading";
// import { VideoIcon, FilmIcon, DownloadIcon, UploadIcon } from "lucide-react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { FormField, FormItem, Form, FormControl } from "@/components/ui/form";
// import { Button } from "@/components/ui/button";
// import axios from "axios";
// import { Empty } from "@/components/empty";
// import { Loader } from "@/components/loader";
// import { Card, CardContent, CardFooter } from "@/components/ui/card";
// import { Textarea } from "@/components/ui/textarea";
// import { toast } from "@/components/ui/use-toast";
// import { Input } from "@/components/ui/input";

// const formSchema = z.object({
//   prompt: z.string().min(1, "Prompt is required"),
//   image: z.instanceof(File).refine((file) => file.size <= 5 * 1024 * 1024, "Image size should be less than 5MB"),
// });

// export default function VideoPage() {
//   const router = useRouter();
//   const [video, setVideo] = useState<string>();
//   const [preview, setPreview] = useState<string>();

//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       prompt: "",
//     },
//   });

//   const isLoading = form.formState.isSubmitting;

//   const onSubmit = async (values: z.infer<typeof formSchema>) => {
//     try {
//       setVideo(undefined);
//       const formData = new FormData();
//       formData.append("image", values.image);
//       formData.append("prompt", values.prompt);

//       const response = await axios.post("/api/video", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
      
//       setVideo(response.data.video);
//       toast({
//         title: "Video generated successfully",
//         description: "Your video is ready to view!",
//       });
//     } catch (error: any) {
//       console.error("[VideoPage] Error:", error);
//       toast({
//         title: "Error",
//         description: "Failed to generate video. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       router.refresh();
//     }
//   };

//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       form.setValue("image", file);
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setPreview(reader.result as string);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <Heading
//         title="AI Image-to-Video Generator"
//         description="Transform your images into videos with AI"
//         icon={VideoIcon}
//         iconColor="text-pink-700"
//         bgColor="bg-pink-700/10"
//       />
//       <Card className="mt-8">
//         <CardContent className="pt-6">
//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//               <FormField
//                 name="image"
//                 render={() => (
//                   <FormItem>
//                     <FormControl>
//                       <Input
//                         type="file"
//                         accept="image/*"
//                         onChange={handleImageChange}
//                         className="cursor-pointer"
//                       />
//                     </FormControl>
//                   </FormItem>
//                 )}
//               />
//               {preview && (
//                 <img src={preview} alt="Preview" className="mt-2 rounded-md max-h-40 object-contain" />
//               )}
//               <FormField
//                 name="prompt"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormControl>
//                       <Textarea
//                         className="min-h-[100px] resize-none"
//                         disabled={isLoading}
//                         placeholder="Describe the video you want to create..."
//                         {...field}
//                       />
//                     </FormControl>
//                   </FormItem>
//                 )}
//               />
//               <Button
//                 type="submit"
//                 className="w-full"
//                 disabled={isLoading || !form.getValues("image")}
//                 size="lg"
//               >
//                 {isLoading ? (
//                   <>
//                     Generating...
//                   </>
//                 ) : (
//                   <>
//                     <FilmIcon className="mr-2 h-4 w-4" />
//                     Generate Video
//                   </>
//                 )}
//               </Button>
//             </form>
//           </Form>
//         </CardContent>
//       </Card>
//       <Card className="mt-8">
//         <CardContent className="pt-6">
//           {isLoading && (
//             <div className="flex items-center justify-center p-8">
//               <Loader  />
//             </div>
//           )}
//           {!video && !isLoading && <Empty label="No video generated yet." />}
//           {video && (
//             <div className="space-y-4">
//               <h3 className="text-lg font-semibold">Your Generated Video</h3>
//               <video controls className="w-full rounded-lg">
//                 <source src={video} type="video/mp4" />
//                 Your browser does not support the video tag.
//               </video>
//               <Button
//                 onClick={() => {
//                   const link = document.createElement("a");
//                   link.href = video;
//                   link.download = "generated_video.mp4";
//                   link.click();
//                 }}
//                 variant="outline"
//                 className="w-full"
//               >
//                 <DownloadIcon className="mr-2 h-4 w-4" />
//                 Download Video
//               </Button>
//             </div>
//           )}
//         </CardContent>
//         {video && (
//           <CardFooter>
//             <Button
//               variant="outline"
//               className="w-full"
//               onClick={() => {
//                 setVideo(undefined);
//                 setPreview(undefined);
//                 form.reset();
//               }}
//             >
//               Clear Video
//             </Button>
//           </CardFooter>
//         )}
//       </Card>
//     </div>
//   );
// }


export default function Image2Image() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      This page is under development.
    </div>
  )
}