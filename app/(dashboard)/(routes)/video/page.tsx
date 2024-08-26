// "use client";

// import * as z from "zod";
// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { Heading } from "@/components/heading";
// import { VideoIcon, FilmIcon, DownloadIcon } from "lucide-react";
// import { useForm } from "react-hook-form";
// import { formSchema } from "./constants";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { FormField, FormItem, Form, FormControl } from "@/components/ui/form";
// import { Button } from "@/components/ui/button";
// import axios from "axios";
// import { Empty } from "@/components/empty";
// import { Loader } from "@/components/loader";
// import { Card, CardContent, CardFooter } from "@/components/ui/card";
// import { Textarea } from "@/components/ui/textarea";
// import { toast } from "@/components/ui/use-toast";

// export default function VideoPage() {
//   const router = useRouter();
//   const [gif, setGif] = useState<string>();

//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       prompt: "",
//     },
//   });

//   const isLoading = form.formState.isSubmitting;

//   const onSubmit = async (values: z.infer<typeof formSchema>) => {
//     try {
//       setGif(undefined);
//       const response = await axios.post("/api/video", values);
//       setGif(response.data.video);
//       form.reset();
//       toast({
//         title: "Animation generated successfully",
//         description: "Your GIF is ready to view!",
//       });
//     } catch (error: any) {
//       console.error("[VideoPage] Error:", error);
//       toast({
//         title: "Error",
//         description: "Failed to generate animation. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       router.refresh();
//     }
//   };

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <Heading
//         title="AI Animation Generator"
//         description="Transform your ideas into animated GIFs with AI"
//         icon={VideoIcon}
//         iconColor="text-pink-700"
//         bgColor="bg-pink-700/10"
//       />
//       <Card className="mt-8">
//         <CardContent className="pt-6">
//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//               <FormField
//                 name="prompt"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormControl>
//                       <Textarea
//                         className="min-h-[100px] resize-none"
//                         disabled={isLoading}
//                         placeholder="Describe the animation you want to create..."
//                         {...field}
//                       />
//                     </FormControl>
//                   </FormItem>
//                 )}
//               />
//               <Button
//                 type="submit"
//                 className="w-full"
//                 disabled={isLoading}
//                 size="lg"
//               >
//                 {isLoading ? (
//                   <>
//                     {/* <Loader className="mr-2 h-4 w-4 animate-spin" /> */}
//                     Generating...
//                   </>
//                 ) : (
//                   <>
//                     <FilmIcon className="mr-2 h-4 w-4" />
//                     Generate Animation
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
//               <Loader />
//             </div>
//           )}
//           {!gif && !isLoading && <Empty label="No animation generated yet." />}
//           {gif && (
//             <div className="space-y-4">
//               <h3 className="text-lg font-semibold">Your Generated Animation</h3>
//               <img src={gif} alt="Generated Animation" className="w-full rounded-lg" />
//               <Button
//                 onClick={() => {
//                   const link = document.createElement("a");
//                   link.href = gif;
//                   link.download = "generated_animation.gif";
//                   link.click();
//                 }}
//                 variant="outline"
//                 className="w-full"
//               >
//                 <DownloadIcon className="mr-2 h-4 w-4" />
//                 Download GIF
//               </Button>
//             </div>
//           )}
//         </CardContent>
//         {gif && (
//           <CardFooter>
//             <Button
//               variant="outline"
//               className="w-full"
//               onClick={() => setGif(undefined)}
//             >
//               Clear Animation
//             </Button>
//           </CardFooter>
//         )}
//       </Card>
//     </div>
//   );
// }





export default function Video() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      This page is under development.
    </div>
  )
}