"use client";

import { useAuth } from "@clerk/nextjs";
import TypewriterComponent from "typewriter-effect";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export const LandingHero = () => {
  const { isSignedIn } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
              <span className="block">GenAI Studio:</span>{" "}
              <span className="block text-blue-500">The best AI tool for</span>
            </h1>
            <div className="mt-3 text-base text-gray-300 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
              <TypewriterComponent
                options={{
                  strings: [
                    "Chatbot Conversation.",
                    "Code Generation.",
                    "Image Generation.",
                    "Music Generation.",
                    "Video Generation.",
                    "Image to Image Generation.",
                    "Image to Video Generation.",
                  ],
                  autoStart: true,
                  loop: true,
                }}
              />
            </div>
            <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
              <div className="rounded-md shadow">
                <Link href={isSignedIn ? "/dashboard" : "/sign-up"} passHref>
                  <Button className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10">
                    Get started
                  </Button>
                </Link>
              </div>
              <div className="mt-3 sm:mt-0 sm:ml-3">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                >
                  Learn more
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <div className="relative w-full lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        {isMounted && (
          <div className="relative h-56 sm:h-72 md:h-96 lg:h-full">
            <video
              className="h-full w-full rounded-md shadow-none object-cover lg:rounded-md lg:shadow-lg"
              autoPlay
              loop
              muted
              playsInline
     
            >
              <source src="/videos/video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        )}
      </div>
    </div>
  );
};
