"use client";

import React from "react";
import { Upload, Cpu, Scissors, Download, Info, CreditCard, ShieldCheck, Globe } from "lucide-react";

const C = { deep: "#7000FF", electric: "#B026FF", cyan: "#00E5FF" };

const steps = [
  { icon: Upload,   color: C.deep,    step: "01", title: "Upload Your Video",     desc: "Drop any long-form video — interviews, podcasts, lectures, streams. We support MP4, MOV, AVI, and more up to 4 hours." },
  { icon: Cpu,      color: C.cyan, step: "02", title: "AI Analyzes Content",   desc: "Our AI scans for peak engagement moments, detects faces, emotions, laughter, and keywords to find the best clips." },
  { icon: Scissors, color: C.electric,   step: "03", title: "Clips Are Generated",   desc: "Perfectly trimmed shorts are created with smooth cuts, captions burned in, and reframed for vertical screens." },
  { icon: Download, color: C.deep,    step: "04", title: "Download & Publish",    desc: "Export your shorts in seconds and publish directly to TikTok, Instagram Reels, or YouTube Shorts." },
];

const guidelines = [
  { icon: CreditCard, title: "Credits & Pricing", desc: "Each viral short generation costs 10 Cliptic Credits. Free users start with 30 credits (3 trials)." },
  { icon: Info, title: "Monthly Renewal", desc: "Your credits renew automatically every 30 days. Free: 30, Cliptic Plan: 250, Pro: Unlimited." },
  { icon: ShieldCheck, title: "Platform Restrictions", desc: "Free tier users can connect to Instagram and YouTube. Upgrade to unlock TikTok, Discord, and others." },
  { icon: Globe, title: "Secure Cloud", desc: "All videos are processed in the Secure Cliptic Cloud. We never share your data with 3rd parties." },
];

export function UserInstructions() {
  return (
    <section id="how-it-works" aria-label="User Instructions" className="relative py-24 px-6" style={{ zIndex: 1 }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(176,38,255,0.04) 0%, transparent 70%)" }} />

      <div className="text-center mb-16 max-w-2xl mx-auto">
        <span className="inline-block mb-4 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
          style={{ background: "rgba(0,229,255,0.1)", color: C.cyan, border: "1px solid rgba(0,229,255,0.3)" }}>
          User Instructions
        </span>
        <h2 className="text-4xl md:text-5xl font-black mb-4 leading-tight"
          style={{ color: "#F8F8F8", letterSpacing: "-0.02em" }}>
          How to Master{" "}
          <span style={{ background: `linear-gradient(135deg,${C.cyan},${C.deep})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Cliptic Engine
          </span>
        </h2>
        <p className="text-base" style={{ color: "#6B6B6B" }}>
          Everything you need to know about our workflow and credit system.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Workflow Steps */}
        <div className="space-y-6">
          <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-[#B026FF] rounded-full" />
            The Workflow
          </h3>
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.step} className="flex gap-4 p-4 rounded-2xl bg-[#111111] border border-[#2a2a2a] group hover:border-[#B026FF]/30 transition-all">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center border shrink-0"
                  style={{ background: `${step.color}15`, borderColor: `${step.color}30`, color: step.color }}>
                  <Icon size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-[#F8F8F8] mb-1">{step.title}</h4>
                  <p className="text-xs leading-relaxed text-[#6B6B6B]">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pricing & Limits */}
        <div className="space-y-6">
          <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-[#00E5FF] rounded-full" />
            Usage Guidelines
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {guidelines.map((g) => {
              const Icon = g.icon;
              return (
                <div key={g.title} className="p-5 rounded-2xl bg-[#090909] border border-[#1a1a1a] hover:border-[#00E5FF]/20 transition-all">
                  <Icon size={24} className="text-[#00E5FF] mb-4" />
                  <h4 className="font-bold text-[#F8F8F8] mb-2">{g.title}</h4>
                  <p className="text-xs leading-relaxed text-[#6B6B6B]">{g.desc}</p>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-[#B026FF]/10 to-transparent border border-[#B026FF]/20">
            <p className="text-[10px] font-medium text-[#B026FF] uppercase tracking-widest mb-1">Pro Tip</p>
            <p className="text-xs text-[#a0a0a0]">Upgrade to the <span className="text-white font-bold">Cliptic Plan</span> (₹499) to get 250 credits and unlock TikTok scheduling!</p>
          </div>
        </div>
      </div>
    </section>
  );
}
