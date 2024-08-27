import { Button } from "@/components/ui/button";
import Link from "next/link";
import Head from "next/head";
import {
  MessageSquare,
  Code,
  Image,
  Music,
  Video,
  ImagePlus,
  Film,
  ArrowRightCircle,
} from "lucide-react";

export default function LandingPage() {
  return (
    <>
      <Head>
        {/* General Meta Tags */}
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Create AI-generated images with ease at Gen AI Studio." />
        <meta name="keywords" content="AI, Image Generation, Gen AI Studio" />
        <meta name="author" content="Gulrez Alam" />

        {/* Open Graph Meta Tags */}
        <meta property="og:title" content="Gen AI Studio" />
        <meta property="og:description" content="Create AI-generated images with ease at Gen AI Studio." />
        <meta property="og:image" content="https://your-image-url" />
        <meta property="og:url" content="https://gen-ai-studio-eight.vercel.app/" />
        <meta property="og:type" content="website" />

        {/* LinkedIn Specific Meta Tags */}
        <meta property="og:site_name" content="Gen AI Studio" />
        <meta property="og:locale" content="en_US" />
        <meta property="article:author" content="https://www.linkedin.com/in/mrgulrez" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />

        {/* Additional Tags */}
        <link rel="canonical" href="https://gen-ai-studio-eight.vercel.app/" />
        <meta name="robots" content="index, follow" />
      </Head>

      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 relative">
        {/* Background Video */}
        <div className="absolute inset-0 overflow-hidden z-0">
          {typeof window !== "undefined" && (
            <video
              autoPlay
              loop
              muted
              className="min-w-full min-h-full object-cover opacity-20"
            >
              <source src="/videos/background.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>

        {/* Hero Section */}
        <div className="relative z-10 bg-white shadow-lg rounded-lg p-8 max-w-3xl text-center transform transition duration-500 hover:scale-105">
          <h1 className="text-4xl font-bold text-gray-800 mb-6 transition-colors duration-300 hover:text-blue-600">
            Welcome to GenAI Studio
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Transform your creative ideas into reality with our cutting-edge AI tools. Sign up today and start exploring the power of generative AI.
          </p>

          {/* Call to Action Buttons */}
          <div className="flex justify-center space-x-4">
            <Link href="/sign-in">
              <Button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg shadow-md transition-transform duration-300 transform hover:scale-110 hover:shadow-xl">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button className="bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded-lg shadow-md transition-transform duration-300 transform hover:scale-110 hover:shadow-xl">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-12 max-w-4xl text-center relative z-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 transition-colors duration-300 hover:text-blue-600">
            How It Works
          </h2>
          <p className="text-gray-600 mb-8">
            Discover the simplicity of our platform with just three easy steps:
          </p>
          <div className="flex flex-col md:flex-row justify-center items-center space-y-6 md:space-y-0 md:space-x-8">
            {[
              {
                step: "Sign Up",
                description: "Create an account to access all our AI-powered tools.",
                icon: <ArrowRightCircle size={40} className="text-blue-500" />,
              },
              {
                step: "Choose a Tool",
                description: "Select from a variety of generative AI tools to suit your needs.",
                icon: <ArrowRightCircle size={40} className="text-blue-500" />,
              },
              {
                step: "Generate & Customize",
                description: "Generate content, customize it, and bring your ideas to life.",
                icon: <ArrowRightCircle size={40} className="text-blue-500" />,
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white shadow-md rounded-lg p-6 w-full md:w-1/3 transform transition-transform duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className="flex justify-center mb-4">{item.icon}</div>
                <h3 className="text-xl font-medium text-gray-700 mb-2">
                  {item.step}
                </h3>
                <p className="text-gray-500">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12 max-w-4xl text-center relative z-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 transition-colors duration-300 hover:text-blue-600">
            Why Choose GenAI Studio?
          </h2>
          <p className="text-gray-600 mb-6">
            Explore our comprehensive suite of AI tools that cater to all your creative needs. From text to multimedia, we&apos;ve got you covered.
          </p>

          {/* Features List with Lucide Icons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "Conversation",
                description:
                  "Engage in dynamic conversations powered by our advanced AI chat systems.",
                icon: <MessageSquare size={40} className="text-blue-500" />,
              },
              {
                title: "Text to Code Generation",
                description:
                  "Effortlessly convert text descriptions into working code with our AI coding assistant.",
                icon: <Code size={40} className="text-green-500" />,
              },
              {
                title: "Text to Image Generation",
                description:
                  "Transform your text prompts into stunning visuals with our text-to-image generation tool.",
                icon: <Image size={40} className="text-purple-500" />,
              },
              {
                title: "Text to Audio Generation",
                description:
                  "Convert text into lifelike audio, perfect for podcasts, audiobooks, and more.",
                icon: <Music size={40} className="text-red-500" />,
              },
              {
                title: "Text to Video Generation",
                description:
                  "Create engaging videos directly from textual descriptions with our innovative AI tool.",
                icon: <Video size={40} className="text-orange-500" />,
              },
              {
                title: "Image to Image Generation",
                description:
                  "Enhance or modify existing images with our AI-driven image-to-image generation technology.",
                icon: <ImagePlus size={40} className="text-yellow-500" />,
              },
              {
                title: "Image to Video Generation",
                description:
                  "Seamlessly convert images into videos, bringing your static visuals to life.",
                icon: <Film size={40} className="text-teal-500" />,
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white shadow-md rounded-lg p-6 transform transition-transform duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-xl font-medium text-gray-700 mb-2 transition-colors duration-300 hover:text-blue-500">
                  {feature.title}
                </h3>
                <p className="text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* "More to Come" Tab */}
          <div className="mt-8 bg-blue-100 p-4 rounded-lg text-blue-600 shadow-md transform transition-transform duration-300 hover:scale-105">
            <h3 className="text-lg font-medium">
              And much more to come! Stay tuned for future updates.
            </h3>
          </div>
        </div>
      </div>
    </>
  );
}
