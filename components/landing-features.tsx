"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import {
  MessageSquare,
  ImageIcon,
  VideoIcon,
  Music,
  CodeIcon,
  ArrowRight,
  ImagePlusIcon,
  ImagePlayIcon,
  MicVocalIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Feature {
  label: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
  bgColor: string;
}

const features: Feature[] = [
  {
    label: "Conversation",
    description: "Chat with an AI to get responses and insights.",
    icon: MessageSquare,
    href: "/conversation",
    color: "text-violet-400",
    bgColor: "from-violet-500/20 to-violet-600/10",
  },
  {
    label: "Text to Lyrics",
    description: "Generate song lyrics from text prompts.",
    icon: MicVocalIcon,
    href: "/lyrics",
    color: "text-yellow-400",
    bgColor: "from-yellow-500/20 to-yellow-600/10",
  },
  {
    label: "Text to Code",
    description: "Generate code snippets from plain text descriptions.",
    icon: CodeIcon,
    href: "/code",
    color: "text-green-400",
    bgColor: "from-green-500/20 to-green-600/10",
  },
  {
    label: "Text to Image",
    description: "Convert text prompts into stunning images.",
    icon: ImageIcon,
    href: "/image",
    color: "text-pink-400",
    bgColor: "from-pink-500/20 to-pink-600/10",
  },
  {
    label: "Text to Music",
    description: "Transform text into harmonious music compositions.",
    icon: Music,
    href: "/music",
    color: "text-emerald-400",
    bgColor: "from-emerald-500/20 to-emerald-600/10",
  },
  {
    label: "Text to Video",
    description: "Create engaging videos from text descriptions.",
    icon: VideoIcon,
    href: "/video",
    color: "text-orange-400",
    bgColor: "from-orange-500/20 to-orange-600/10",
  },
  {
    label: "Image to Image",
    description: "Modify images using advanced AI techniques.",
    icon: ImagePlusIcon,
    href: "/image2image",
    color: "text-teal-400",
    bgColor: "from-teal-500/20 to-teal-600/10",
  },
  {
    label: "Image to Video",
    description: "Generate videos from image sequences.",
    icon: ImagePlayIcon,
    href: "/image2video",
    color: "text-indigo-400",
    bgColor: "from-indigo-500/20 to-indigo-600/10",
  },
];

export const LandingFeatures: React.FC = () => {
  const handleCardClick = (href: string) => {
    window.location.href = href;
  };

  return (
    <div className="py-24 sm:py-32 min-h-screen">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl lg:text-center mb-16">
          <p className="text-base font-semibold leading-7 text-blue-500 uppercase tracking-wide">
            Powerful AI Tools
          </p>
          <h2 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl drop-shadow-md">
            Everything you need to create with AI
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-200">
            Unlock the power of AI with our suite of tools. From chatbots to
            video generation, explore limitless possibilities.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {features.map((tool) => (
            <Card
              key={tool.href}
              onClick={() => handleCardClick(tool.href)}
              className="relative p-6 border border-gray-700 bg-gray-800/90 shadow-lg backdrop-blur-sm flex flex-col items-start justify-between rounded-2xl overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer group"
            >
              {/* Gradient Hover Overlay */}
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl",
                  tool.bgColor
                )}
              ></div>

              {/* Icon + Title */}
              <div className="flex items-center gap-x-4 relative z-10 mb-4">
                <div
                  className={cn(
                    "p-3 rounded-xl bg-gray-900 shadow-inner ring-1 ring-gray-700 group-hover:ring-gray-600 transition-all duration-300"
                  )}
                >
                  <tool.icon
                    className={cn("w-8 h-8 transition-colors duration-300", tool.color)}
                  />
                </div>
                <div className="font-semibold text-lg text-white group-hover:text-gray-100 transition-colors duration-300">
                  {tool.label}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-400 group-hover:text-gray-200 relative z-10 transition-colors duration-300 mb-4">
                {tool.description}
              </p>

              {/* Learn More */}
              <div className="flex items-center justify-between w-full relative z-10">
                <span className="text-sm font-medium text-gray-400 group-hover:text-gray-200 transition-colors duration-300">
                  Learn More
                </span>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-300" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
