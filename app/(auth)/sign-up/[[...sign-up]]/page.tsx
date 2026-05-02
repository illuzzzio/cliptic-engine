"use client";
import React from "react";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#090909] px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle Background Blobs */}
      <div className="absolute inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="absolute w-[500px] h-[500px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse,rgba(0,229,255,0.15)_0%,transparent_70%)] rounded-full blur-3xl opacity-50" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <SignUp 
          appearance={{
            elements: {
              card: "bg-[#111111] border border-[#2a2a2a] shadow-2xl shadow-[#00E5FF]/20",
              headerTitle: "text-[#F8F8F8]",
              headerSubtitle: "text-[#6B6B6B]",
              socialButtonsBlockButton: "border-[#2a2a2a] hover:bg-[#1a1a1a] hover:border-[#00E5FF]/50 transition-colors",
              socialButtonsBlockButtonText: "text-[#F8F8F8]",
              dividerLine: "bg-[#2a2a2a]",
              dividerText: "text-[#6B6B6B]",
              formFieldLabel: "text-[#F8F8F8]",
              formFieldInput: "bg-[#090909] border-[#2a2a2a] text-[#F8F8F8] focus:border-[#00E5FF] focus:ring-[#00E5FF]",
              formButtonPrimary: "bg-gradient-to-r from-[#B026FF] to-[#00E5FF] hover:from-[#B026FF] hover:to-[#00E5FF] text-black font-bold shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:shadow-[0_0_30px_rgba(0,229,255,0.5)] transition-all",
              footerActionText: "text-[#6B6B6B]",
              footerActionLink: "text-[#00E5FF] hover:text-[#B026FF]",
              identityPreviewText: "text-[#F8F8F8]",
              identityPreviewEditButton: "text-[#00E5FF] hover:text-[#B026FF]",
            },
          }}
        />
      </div>
    </div>
  );
}
