"use client";

import React from "react";
import { Scissors, Download, MessageSquareText, Zap, Globe, Lock, BarChart3, Clock, Sparkles } from "lucide-react";

const C = { deep: "#7000FF", electric: "#B026FF", cyan: "#00E5FF" };

const features = [
  { icon: Zap,               color: C.deep,    title: "AI Scene Detection",       desc: "Our model scans every frame to find the most engaging, high-energy moments automatically." },
  { icon: Scissors,          color: C.electric,   title: "Smart Auto-Clipping",      desc: "Instantly clips detected highlights into properly trimmed short-form videos with zero effort." },
  { icon: MessageSquareText, color: C.cyan, title: "Auto Caption Generation",  desc: "Generate word-by-word animated captions with 98% accuracy across 50+ languages." },
  { icon: Download,          color: C.deep,    title: "One-Click Downloads",      desc: "Export shorts in 9:16, 1:1, or 16:9 format optimized for TikTok, Reels, and YouTube Shorts." },
  { icon: Globe,             color: C.electric,   title: "Multi-Language Support",   desc: "Translate and caption your content in 50+ languages to reach a global audience instantly." },
  { icon: BarChart3,         color: C.cyan, title: "Engagement Analytics",     desc: "See virality scores, predicted watch-time, and A/B test thumbnails before publishing." },
  { icon: Clock,             color: C.deep,    title: "Batch Processing",         desc: "Upload and process dozens of long videos simultaneously — no queue, no waiting." },
  { icon: Lock,              color: C.electric,   title: "Private & Secure",         desc: "All uploads are end-to-end encrypted and auto-deleted after 48 hours." },
  { icon: Sparkles,          color: C.cyan, title: "AI Thumbnail Generator",   desc: "Automatically generates click-worthy thumbnails from the best frames of each short." },
];

export function Features() {
  return (
    <section id="features" aria-label="Features" className="relative py-24 px-6" style={{ zIndex: 1 }}>
      <div className="text-center mb-16 max-w-2xl mx-auto">
        <span className="inline-block mb-4 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
          style={{ background: "rgba(176,38,255,0.1)", color: C.electric, border: "1px solid rgba(176,38,255,0.3)" }}>
          Features
        </span>
        <h2 className="text-4xl md:text-5xl font-black mb-4 leading-tight"
          style={{ color: "#F8F8F8", letterSpacing: "-0.02em" }}>
          Everything You Need to{" "}
          <span style={{ background: `linear-gradient(135deg,${C.electric},${C.cyan})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Go Viral
          </span>
        </h2>
        <p className="text-base" style={{ color: "#6B6B6B" }}>
          One platform to clip, caption, and distribute your content across every short-form platform.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              id={`feature-card-${i}`}
              className="group rounded-2xl p-6 transition-all duration-300 cursor-default"
              style={{ background: "#111111", border: "1px solid #2a2a2a", animation: `fadeInUp 0.5s ease-out ${i * 0.07}s both` }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.transform = "translateY(-4px)";
                el.style.borderColor = `${feature.color}55`;
                el.style.boxShadow = `0 8px 30px rgba(0,0,0,0.4), 0 0 20px ${feature.color}18`;
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.transform = "translateY(0)";
                el.style.borderColor = "#2a2a2a";
                el.style.boxShadow = "none";
              }}
            >
              <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl"
                style={{ background: `${feature.color}15`, border: `1px solid ${feature.color}30` }}>
                <Icon size={22} style={{ color: feature.color }} />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: "#F8F8F8" }}>{feature.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#6B6B6B" }}>{feature.desc}</p>
              <div className="mt-4 h-px w-0 transition-all duration-300 group-hover:w-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${feature.color}, transparent)` }} />
            </div>
          );
        })}
      </div>
    </section>
  );
}
