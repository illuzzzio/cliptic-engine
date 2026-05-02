"use client";

import React from "react";
import { Upload, Cpu, Scissors, Download } from "lucide-react";

const C = { deep: "#7000FF", electric: "#B026FF", cyan: "#00E5FF" };

const steps = [
  { icon: Upload,   color: C.deep,    step: "01", title: "Upload Your Video",     desc: "Drop any long-form video — interviews, podcasts, lectures, streams. We support MP4, MOV, AVI, and more up to 4 hours." },
  { icon: Cpu,      color: C.cyan, step: "02", title: "AI Analyzes Content",   desc: "Our AI scans for peak engagement moments, detects faces, emotions, laughter, and keywords to find the best clips." },
  { icon: Scissors, color: C.electric,   step: "03", title: "Clips Are Generated",   desc: "Perfectly trimmed shorts are created with smooth cuts, captions burned in, and reframed for vertical screens." },
  { icon: Download, color: C.deep,    step: "04", title: "Download & Publish",    desc: "Export your shorts in seconds and publish directly to TikTok, Instagram Reels, or YouTube Shorts." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-label="How it works" className="relative py-24 px-6" style={{ zIndex: 1 }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(176,38,255,0.04) 0%, transparent 70%)" }} />

      <div className="text-center mb-16 max-w-2xl mx-auto">
        <span className="inline-block mb-4 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
          style={{ background: "rgba(0,229,255,0.1)", color: C.cyan, border: "1px solid rgba(0,229,255,0.3)" }}>
          How It Works
        </span>
        <h2 className="text-4xl md:text-5xl font-black mb-4 leading-tight"
          style={{ color: "#F8F8F8", letterSpacing: "-0.02em" }}>
          From Upload to{" "}
          <span style={{ background: `linear-gradient(135deg,${C.cyan},${C.deep})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Published
          </span>{" "}
          in Minutes
        </h2>
        <p className="text-base" style={{ color: "#6B6B6B" }}>
          No editing skills required. Cliptic handles the entire workflow automatically.
        </p>
      </div>

      <div className="max-w-4xl mx-auto relative">
        {/* Gradient connector line */}
        <div className="absolute left-6 top-8 bottom-8 w-px hidden md:block"
          style={{ background: `linear-gradient(to bottom, ${C.deep}, ${C.cyan}, ${C.electric}, ${C.deep})` }} />

        <div className="space-y-8">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.step} id={`step-${step.step}`} className="flex gap-6 group"
                style={{ animation: `fadeInUp 0.6s ease-out ${i * 0.15}s both` }}>

                {/* Icon bubble */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{ background: `${step.color}15`, border: `2px solid ${step.color}40`, boxShadow: `0 0 20px ${step.color}20` }}>
                    <Icon size={22} style={{ color: step.color }} />
                  </div>
                  <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black"
                    style={{ background: step.color, color: "#090909" }}>{i + 1}</div>
                </div>

                {/* Content card */}
                <div className="flex-1 rounded-2xl p-6 transition-all duration-300"
                  style={{ background: "#111111", border: "1px solid #2a2a2a" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = `${step.color}40`; el.style.transform = "translateX(4px)"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = "#2a2a2a"; el.style.transform = "translateX(0)"; }}>
                  <span className="text-xs font-black uppercase tracking-widest" style={{ color: step.color }}>Step {step.step}</span>
                  <h3 className="text-xl font-bold mb-2 mt-1" style={{ color: "#F8F8F8" }}>{step.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#6B6B6B" }}>{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
