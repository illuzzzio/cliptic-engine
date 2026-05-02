"use client";
import React from "react";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#090909] px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle Background Blobs */}
      <div className="absolute inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="absolute w-[500px] h-[500px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse,rgba(255,214,10,0.15)_0%,transparent_70%)] rounded-full blur-3xl opacity-50" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <SignUp 
          appearance={{
            elements: {
              card: "bg-[#111111] border border-[#2a2a2a] shadow-2xl shadow-[#FFD60A]/20",
              headerTitle: "text-[#F8F8F8]",
              headerSubtitle: "text-[#6B6B6B]",
              socialButtonsBlockButton: "border-[#2a2a2a] hover:bg-[#1a1a1a] hover:border-[#FFD60A]/50 transition-colors",
              socialButtonsBlockButtonText: "text-[#F8F8F8]",
              dividerLine: "bg-[#2a2a2a]",
              dividerText: "text-[#6B6B6B]",
              formFieldLabel: "text-[#F8F8F8]",
              formFieldInput: "bg-[#090909] border-[#2a2a2a] text-[#F8F8F8] focus:border-[#FFD60A] focus:ring-[#FFD60A]",
              formButtonPrimary: "bg-gradient-to-r from-[#FF2D78] to-[#FFD60A] hover:from-[#FF2D78] hover:to-[#FFD60A] text-black font-bold shadow-[0_0_20px_rgba(255,214,10,0.3)] hover:shadow-[0_0_30px_rgba(255,214,10,0.5)] transition-all",
              footerActionText: "text-[#6B6B6B]",
              footerActionLink: "text-[#FFD60A] hover:text-[#FF2D78]",
              identityPreviewText: "text-[#F8F8F8]",
              identityPreviewEditButton: "text-[#FFD60A] hover:text-[#FF2D78]",
            },
          }}
        />
      </div>
    </div>
  );
}
