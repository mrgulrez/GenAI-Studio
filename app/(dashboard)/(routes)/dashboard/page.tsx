"use client";

import { Card } from '@/components/ui/card';
import { UserButton } from '@clerk/nextjs';
import { MessageSquare, ImageIcon, VideoIcon, Music, ArrowRight, LayoutDashboard, CodeIcon, ImagePlusIcon, ImagePlayIcon } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';

// const tools = [
//   {
//     label: "Conversation",
//     icon: MessageSquare,
//     color: "text-violet-500",
//     bgColor: "bg-violet-500/10",
//     href: "/conversation",
//   },
//   {
//     label: "Code Generation",
//     icon: Code,
//     color: "text-green-700",
//     bgColor: "bg-green-700/10",
//     href: "/code",
//   },
//   {
//     label: "Image Generation",
//     icon: ImageIcon,
//     color: "text-pink-700",
//     bgColor: "bg-pink-700/10",
//     href: "/image",
//   },
//   {
//     label: "Video Generation",
//     icon: VideoIcon,
//     color: "text-orange-700",
//     bgColor: "bg-orange-700/10",
//     href: "/video",
//   },
//   {
//     label: "Audio Generation",
//     icon: Music,
//     color: "text-emerald-700",
//     bgColor: "bg-emerald-700/10",
//     href: "/music",
//   },
// ];

const tools = [
  {
    label: "Conversation",
    icon: MessageSquare,
    href: "/conversation",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
  },
  {
    label: "Text to Code Generation",
    icon: CodeIcon,
    href: "/code",
    color: "text-green-700",
    bgColor: "bg-green-700/10",
  },

  {
    label: "Text to Image Generation",
    icon: ImageIcon,
    href: "/image",
    color: "text-pink-700",
    bgColor: "bg-pink-700/10",
  },
  {
    label: "Text to Music Generation",
    icon: Music,
    href: "/music",
    color: "text-emerald-700",
    bgColor: "bg-emerald-700/10",
  },
  {
    label: "Text to Video Generation",
    icon: VideoIcon,
    href: "/video",
    color: "text-orange-700",
    bgColor: "bg-orange-700/10",
  },
  {
    label: "Image to Image Generation",
    icon: ImagePlusIcon,
    href: "/image2image",
    color: "text-green-700",
    bgColor: "bg-green-700/10",
  },
  {
    label: "Image to Video Generation",
    icon: ImagePlayIcon,
    href: "/image2video",
    color: "text-yellow-600",
    bgColor: "bg-yellow-600/10",
  }
];

export default function DashboardPage() {
  const router = useRouter();
  return (
    <div className="mb-8 space-y-4">
      <h2 className="text-2xl md:text-4xl font-bold text-center">
        Explore the power of AI
      </h2>
      <p className="text-muted-foreground font-light text-sm md:text-lg text-center">
        Play with the smartest AI - Experience the power of AI
      </p>
      <div className='px-4 md:px-20 lg:px-32 space-y-4'>
        {tools.map((tool) => (
          <Card
            onClick={() => router.push(tool.href)}
            key={tool.href}
            className="p-4 border-black/5 flex items-center justify-between hover:shadow-md transition cursor-pointer"
          >
            <div className="flex items-center gap-x-4">
              <div className={cn("p-2 w-fit rounded-md", tool.bgColor)}>
                <tool.icon className={cn("w-8 h-8", tool.color)} />
              </div>
              <div className="font-semibold">
                {tool.label}
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-black" />
          </Card>
        ))}
      </div>
    </div>
  );
}
