import React from "react";
import { Background3D } from "@/components/landing/Background3D";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { UserInstructions } from "@/components/landing/UserInstructions";
import { Pricing } from "@/components/landing/Pricing";
import { Feedback } from "@/components/landing/Feedback";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="relative min-h-screen" style={{ background: "#090909" }}>
      {/* Fixed 3D animated background */}
      <Background3D />

      {/* Page content */}
      <div className="relative" style={{ zIndex: 1 }}>
        <Header />
        <main>
          <Hero />
          <Features />
          <UserInstructions />
          <Pricing />
          <Feedback />
        </main>
        <Footer />
      </div>
    </div>
  );
}