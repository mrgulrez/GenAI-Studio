"use client";

import { Card } from '@/components/ui/card';
import { 
  MessageSquare, 
  ImageIcon, 
  VideoIcon, 
  Music, 
  ArrowRight, 
  CodeIcon, 
  ImagePlusIcon, 
  ImagePlayIcon 
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { useRouter } from 'next/navigation';

const tools = [
  {
    label: "Conversation",
    description: "Chat with an AI to get responses and insights.",
    icon: MessageSquare,
    href: "/conversation",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
  },
  {
    label: "Text to Code Generation",
    description: "Generate code snippets from plain text descriptions.",
    icon: CodeIcon,
    href: "/code",
    color: "text-green-700",
    bgColor: "bg-green-700/10",
  },
  {
    label: "Text to Image Generation",
    description: "Convert text prompts into stunning images.",
    icon: ImageIcon,
    href: "/image",
    color: "text-pink-700",
    bgColor: "bg-pink-700/10",
  },
  {
    label: "Text to Music Generation",
    description: "Transform text into harmonious music compositions.",
    icon: Music,
    href: "/music",
    color: "text-emerald-700",
    bgColor: "bg-emerald-700/10",
  },
  {
    label: "Text to Video Generation",
    description: "Create engaging videos from text descriptions.",
    icon: VideoIcon,
    href: "/video",
    color: "text-orange-700",
    bgColor: "bg-orange-700/10",
  },
  {
    label: "Image to Image Generation",
    description: "Modify images using advanced AI techniques.",
    icon: ImagePlusIcon,
    href: "/image2image",
    color: "text-green-700",
    bgColor: "bg-green-700/10",
  },
  {
    label: "Image to Video Generation",
    description: "Generate videos from image sequences.",
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
      <h2 className="text-2xl md:text-4xl font-bold text-center text-gray-800">
        Explore the Power of AI
      </h2>
      <p className="text-muted-foreground font-light text-sm md:text-lg text-center text-gray-500">
        Play with the smartest AI - Experience the power of AI
      </p>
      <div className='px-4 md:px-20 lg:px-32 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
        {tools.map((tool) => (
          <Card
            onClick={() => router.push(tool.href)}
            key={tool.href}
            className="relative p-6 border border-transparent bg-white shadow-sm flex flex-col items-start justify-between rounded-xl overflow-hidden transform transition-transform duration-300 hover:scale-105 hover:shadow-xl cursor-pointer group"
          >
            {/* Background effect */}
            <div className={cn("absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-20 transition-opacity duration-300", tool.bgColor)}></div>
            
            <div className="flex items-center gap-x-4 relative z-10 mb-4">
              <div className={cn("p-3 w-fit rounded-full bg-white shadow-md", tool.bgColor)}>
                <tool.icon className={cn("w-8 h-8", tool.color)} />
              </div>
              <div className="font-semibold text-lg text-gray-800 group-hover:text-gray-900 transition-colors duration-200">
                {tool.label}
              </div>
            </div>
            <p className="text-sm text-gray-600 group-hover:text-gray-700 relative z-10 transition-colors duration-200 mb-4">
              {tool.description}
            </p>
            <div className="flex items-center justify-between w-full relative z-10">
              <span className="text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors duration-200">
                Learn More
              </span>
              <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors duration-200" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
