import { Geist, Geist_Mono, Inter } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ClerkProvider } from '@clerk/nextjs';
import { SyncUser } from "@/components/auth/SyncUser";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
  preload: false, // Only preload if needed, load lazily otherwise
});

export const metadata: Metadata = {
  title: "Cliptic Engine — Turn Long Videos Into Viral Shorts with AI",
  description: "Cliptic Engine is the AI-powered platform that automatically converts long videos into short-form clips with captions, ready to publish on TikTok, Reels, and YouTube Shorts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
      >
        <body className="min-h-full flex flex-col">
          <SyncUser />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
