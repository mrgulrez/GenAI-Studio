"use client";

import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  MessageSquare,
  ImageIcon,
  VideoIcon,
  Music,
  CodeIcon,
  Settings,
  ImagePlusIcon,
  ImagePlayIcon,
} from "lucide-react";


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
    name: "Text to Music",
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
    color: "text-green-500",
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
    color: "text-white",
  },
];

const Sidebar = () => {
  const [pathname, setPathname] = useState("");

  useEffect(() => {
    setPathname(window.location.pathname);
  }, []);

  const getClassName = (currentPath: string) => {
    const isActive = pathname === currentPath;
    const baseClasses = "flex items-center px-4 py-3 w-full font-medium rounded-lg transition-colors duration-200";
    const activeClasses = isActive ? "text-white bg-white/10" : "text-zinc-400 hover:bg-white/10";
    return `${baseClasses} ${activeClasses}`;
  };

  return (
    <div className={`space-y-6 py-6 flex flex-col min-h-screen bg-[#020617] text-white border-r border-gray-800`}>
      <div className="px-6 flex-1">
        <a href="/dashboard" className="flex items-center space-x-3 mb-12">
          <div className="relative w-12 h-12">
            <img
              src="/images/logo.png"
              alt="logo"
              className="object-contain w-full h-full"
            />
          </div>
          <h1 className="text-2xl font-extrabold">GenAI Studio</h1>
        </a>
        <div className="space-y-2">
          {routes.map((route) => (
            <a href={route.href} key={route.href}>
              <div className={getClassName(route.href)}>
                <route.icon className={`w-5 h-5 mr-4 ${route.color}`} />
                <span className="text-lg">{route.name}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
