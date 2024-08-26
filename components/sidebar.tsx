"use client";
import Link from "next/link";
import Image from "next/image";
import { Montserrat } from "next/font/google";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  MessageSquare,
  ImageIcon,
  VideoIcon,
  Music,
  CodeIcon,
  ImagePlusIcon,
  ImagePlayIcon,
  Settings,
} from "lucide-react";
import { usePathname } from "next/navigation";

const montserrat = Montserrat({ weight: "600", subsets: ["latin"] });

const routes = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    name: "Conversation",
    icon: MessageSquare,
    href: "/conversation",
    color: "text-violet-500",
  },
  {
    name: "Text to Code",
    icon: CodeIcon,
    href: "/code",
    color: "text-green-700",
  },

  {
    name: "Text to Image",
    icon: ImageIcon,
    href: "/image",
    color: "text-pink-700",
  },
  {
    name: "Text to Audio",
    icon: Music,
    href: "/music",
    color: "text-emerald-700",
  },
  {
    name: "Text to Video",
    icon: VideoIcon,
    href: "/video",
    color: "text-orange-700",
  },
  {
    name: "Image to Image",
    icon: ImagePlusIcon,
    href: "/image2image",
    color: "text-green-700",
  },
  {
    name: "Image to Video",
    icon: ImagePlayIcon,
    href: "/image2video",
    color: "text-yellow-600",
  },
  {
    name: "Settings",
    icon: Settings,
    href: "/settings",
  },
];

export default function Sidebar() {

  const pathname = usePathname();
  return (
    <div
      className={`space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white ${montserrat.className}`}
    >
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <div className="relative w-16 h-16 mr-4">
            <Image
              fill
              src="/images/logo.png"
              alt="logo"
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link href={route.href} key={route.href}>
              <div className= {cn("flex items-center px-3 py-2 w-full justify-start font-medium rounded-md hover:bg-gray-700 text-whiteb transition", pathname === route.href ? "text-whilte bg-white/10" : "text-zinc-400")}>
                <route.icon className={cn("w-5 h-5 mr-3", route.color)} />
                <span className="text-lg">{route.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
