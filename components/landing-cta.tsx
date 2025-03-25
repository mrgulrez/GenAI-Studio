"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import { motion } from "framer-motion";

export const LandingCTA = () => {
  const { isSignedIn } = useAuth();

  return (
    <div className="bg-slate-900 font-[Inter]">
      <div className="mx-auto max-w-7xl py-24 sm:px-6 sm:py-32 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative isolate overflow-hidden bg-white/10 backdrop-blur-lg shadow-xl sm:rounded-3xl sm:px-16 md:pt-24 lg:flex lg:gap-x-20 lg:px-24 lg:pt-0 border border-white/20"
        >
          <svg
            viewBox="0 0 1024 1024"
            className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] sm:left-full sm:-ml-80 lg:left-1/2 lg:ml-0 lg:-translate-x-1/2 lg:translate-y-0"
            aria-hidden="true"
          >
            <circle cx={512} cy={512} r={512} fill="url(#gradient)" fillOpacity="0.6" />
            <defs>
              <radialGradient id="gradient">
                <stop stopColor="#8B5CF6" />
                <stop offset={1} stopColor="#EC4899" />
              </radialGradient>
            </defs>
          </svg>
          
          <motion.div 
            initial={{ x: -50, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }} 
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto max-w-md text-center lg:mx-0 lg:flex-auto lg:py-32 lg:text-left"
          >
            <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Boost Your Productivity.
              <br />
              Leverage AI to the Fullest.
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Join thousands of developers and creators who are supercharging their work with AI-powered tools.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
              <Link href={isSignedIn ? "/dashboard" : "/sign-up"} passHref>
                <Button className="rounded-md bg-white px-5 py-3 text-md font-semibold text-gray-900 shadow-lg hover:bg-gray-200 transition-transform transform hover:scale-105">
                  Get Started 🚀
                </Button>
              </Link>
              <Link href="#" className="text-md font-semibold text-white hover:text-pink-400 transition-all duration-200">
                Learn More →
              </Link>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative mt-16 h-80 lg:mt-8"
          >
            <Image
              className="absolute left-0 top-0 w-[40rem] max-w-none rounded-xl bg-white/10 shadow-xl ring-1 ring-white/10"
              src="/images/ai-dashboard.png" // Update with your own image path
              alt="AI Dashboard Preview"
              width={1600}
              height={900}
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
