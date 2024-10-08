import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { ToastProvider } from "@/components/ui/toast";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GenAI Studio",
  description: "Created by Gulrez Alam",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
    >
      <html lang="en" className={inter.className}>
      
        <body>
        <ToastProvider />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
