"use client";

import { Montserrat } from "next/font/google";
import { useAuth } from "@clerk/nextjs";
import  Image  from "next/image";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";


const font = Montserrat({ weight: "600", subsets: ["latin"] });

export const LandingNavbar = () => {
    const { isSignedIn } = useAuth();

    return (
        <nav className="p-4 bg-transparent flex items-center justify-between">
            <Link href="/" className="flex items-center">
            <div className="relative h-8 w-8 mr-4">
                <Image 
                 fill
                 alt="logo"
                 src = "/images/logo.png"
                    />
            </div>
            <h1 className={cn(font, "text-2xl text-white", font.className)}>GenAI Studio</h1>
            </Link>
            <div className="flex items-center gap-x-2">
                <Link href= {isSignedIn ? "/dashboard" : "/sign-up" }>
                    <Button variant="outline" className="rounded-full">
                        Get Started
                    </Button>
                </Link>
                
            </div>
    </nav>
    );

}