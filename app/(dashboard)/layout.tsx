"use client";

import React, { useState } from "react";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";


const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  return (
    <div className="min-h-screen relative">
      
      {/* Wider hover area to trigger sidebar */}
      <div
        className="fixed inset-y-0 left-0 w-6 z-20"
        onMouseEnter={() => setIsSidebarVisible(true)}
        onMouseLeave={() => {
          if (!isSidebarVisible) setIsSidebarVisible(false);
        }}
      ></div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 transform transition-transform duration-600 ease-in-out ${
          isSidebarVisible ? "translate-x-0" : "-translate-x-full"
        } w-72`}
        onMouseLeave={() => setIsSidebarVisible(false)}
      >
        <Sidebar />
      </div>

      {/* Main content wrapper */}
      <div 
        className={`transition-all duration-600 ease-in-out ${
          isSidebarVisible ? "ml-72" : "ml-0"
        } min-h-screen`}
      >
        {/* Main content */}
        <main className="w-full min-h-screen overflow-auto">
          <Navbar />
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
