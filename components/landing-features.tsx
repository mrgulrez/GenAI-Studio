import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BotIcon, ImageIcon, VideoIcon,  CodeIcon, MusicIcon, } from 'lucide-react';
interface Feature {
  name: string;
  description: string;
  icon: React.ElementType;
}

const features: Feature[] = [
  {
    name: "AI Chatbot",
    description: "Create intelligent conversational interfaces with ease.",
    icon: BotIcon,
  },
  {
    name: "Code Generation",
    description: "Generate high-quality code snippets and complete functions.",
    icon: CodeIcon,
  },
  {
    name: "Image Generation",
    description: "Create stunning visuals from textual descriptions.",
    icon: ImageIcon,
  },
  {
    name: "Music Generation",
    description: "Produce realistic voices and sound effects.",
    icon: MusicIcon,
  },
  {
    name: "Video Generation",
    description: "Create short video clips and animations from prompts.",
    icon: VideoIcon,
  },
];

export const LandingFeatures: React.FC = () => {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">Powerful AI Tools</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Everything you need to create with AI
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Unlock the power of AI with our comprehensive suite of tools. From chatbots to video generation, we have got you covered.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.name} className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <feature.icon className="h-5 w-5 text-blue-500 mr-2" />
                    {feature.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};