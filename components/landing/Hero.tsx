"use client";

import React, { useEffect, useRef } from "react";
import { Play, Scissors, Download, ArrowRight, ChevronDown, Zap } from "lucide-react";

// ── Theme tokens ──────────────────────────────────────────────
const C = {
  red:    "#E63946",
  pink:   "#FF2D78",
  yellow: "#FFD60A",
  white:  "#F8F8F8",
  muted:  "#6B6B6B",
  dark:   "#111111",
  border: "#2a2a2a",
};

export function Hero() {
  const videoCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = videoCardRef.current;
    if (!card) return;
    const onMove = (e: MouseEvent) => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      card.style.transform = `perspective(1000px) rotateX(${(-y / r.height) * 12}deg) rotateY(${(x / r.width) * 12}deg) scale(1.02)`;
    };
    const onLeave = () => { card.style.transform = "perspective(1000px) rotateX(0) rotateY(0) scale(1)"; };
    card.addEventListener("mousemove", onMove);
    card.addEventListener("mouseleave", onLeave);
    return () => { card.removeEventListener("mousemove", onMove); card.removeEventListener("mouseleave", onLeave); };
  }, []);

  return (
    <section id="hero" aria-label="Hero section"
      className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16"
      style={{ zIndex: 1 }}>

      {/* Announcement badge */}
      <div className="mb-8 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest"
        style={{ background: "rgba(255,45,120,0.12)", border: "1px solid rgba(255,45,120,0.35)", color: C.pink, animation: "fadeInDown 0.6s ease-out both" }}>
        <Zap size={12} fill={C.pink} />
        <span>AI-Powered Video Clipping Engine</span>
        <Zap size={12} fill={C.pink} />
      </div>

      {/* Main headline */}
      <h1 className="text-center font-black leading-none mb-6 max-w-4xl"
        style={{ fontSize: "clamp(3rem,8vw,6rem)", color: C.white, animation: "fadeInUp 0.7s ease-out 0.1s both", letterSpacing: "-0.03em" }}>
        Turn Long Videos Into{" "}
        <span style={{ background: `linear-gradient(135deg, ${C.red} 0%, ${C.yellow} 50%, ${C.pink} 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", filter: `drop-shadow(0 0 30px rgba(255,45,120,0.45))`, display: "inline-block" }}>
          Viral Shorts
        </span>
      </h1>

      {/* Sub-headline */}
      <p className="text-center max-w-2xl mb-10 leading-relaxed"
        style={{ color: C.muted, fontSize: "clamp(1rem,2.5vw,1.25rem)", animation: "fadeInUp 0.7s ease-out 0.2s both" }}>
        Cliptic Engine uses AI to automatically detect the best moments, generate captions, and export ready-to-upload shorts — in minutes, not hours.
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-16"
        style={{ animation: "fadeInUp 0.7s ease-out 0.3s both" }}>
        <button id="hero-primary-cta"
          className="group flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white transition-all duration-300 focus:outline-none"
          style={{ background: `linear-gradient(135deg, ${C.red}, ${C.pink})`, boxShadow: "0 0 30px rgba(255,45,120,0.4), 0 8px 25px rgba(0,0,0,0.4)", fontSize: "1.05rem" }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.boxShadow = "0 0 55px rgba(255,45,120,0.65), 0 12px 30px rgba(0,0,0,0.5)"; el.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.boxShadow = "0 0 30px rgba(255,45,120,0.4), 0 8px 25px rgba(0,0,0,0.4)"; el.style.transform = "translateY(0)"; }}>
          <Scissors size={18} />Start Clipping Free
          <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
        </button>

        <button id="hero-demo-btn"
          className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all duration-300 focus:outline-none"
          style={{ background: "transparent", border: `1px solid rgba(255,214,10,0.5)`, color: C.yellow, fontSize: "1.05rem" }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = "rgba(255,214,10,0.08)"; el.style.boxShadow = "0 0 20px rgba(255,214,10,0.2)"; el.style.borderColor = "rgba(255,214,10,0.9)"; }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.background = "transparent"; el.style.boxShadow = "none"; el.style.borderColor = "rgba(255,214,10,0.5)"; }}>
          <Play size={18} fill={C.yellow} />Watch Demo
        </button>
      </div>

      {/* 3D preview card */}
      <div ref={videoCardRef}
        className="relative w-full max-w-3xl rounded-2xl overflow-hidden"
        style={{ transition: "transform 0.1s ease", border: "1px solid rgba(42,42,42,0.8)", background: C.dark, boxShadow: `0 0 0 1px rgba(255,45,120,0.1), 0 40px 80px rgba(0,0,0,0.8), 0 0 60px rgba(255,45,120,0.07)`, animation: "fadeInUp 0.8s ease-out 0.4s both" }}>

        {/* Window chrome */}
        <div className="flex items-center gap-2 px-4 py-3" style={{ background: "#0e0e0e", borderBottom: "1px solid #1a1a1a" }}>
          <span className="w-3 h-3 rounded-full" style={{ background: C.red }} />
          <span className="w-3 h-3 rounded-full" style={{ background: C.yellow }} />
          <span className="w-3 h-3 rounded-full" style={{ background: C.pink }} />
          <span className="flex-1 text-center text-xs" style={{ color: "#3a3a3a" }}>cliptic-engine.app — Processing video.mp4</span>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Timeline column */}
          <div className="md:col-span-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold" style={{ color: C.muted }}>SOURCE TIMELINE</span>
              <span className="text-xs px-2 py-0.5 rounded" style={{ background: `${C.red}20`, color: C.red }}>45:32 min</span>
            </div>
            {/* Waveform */}
            <div className="h-12 rounded-lg flex items-center gap-0.5 px-2 overflow-hidden" style={{ background: "#0d0d0d", border: "1px solid #1a1a1a" }}>
              {Array.from({ length: 60 }).map((_, i) => (
                <div key={i} className="flex-1 rounded-full" style={{ height: `${(20 + Math.sin(i * 0.5) * 15).toFixed(1)}px`, background: i > 20 && i < 35 ? `linear-gradient(to top,${C.red},${C.yellow})` : i > 42 && i < 52 ? `linear-gradient(to top,${C.pink},${C.pink}80)` : "#2a2a2a", minWidth: "2px" }} />
              ))}
            </div>
            {/* Detected clips */}
            <div className="space-y-2">
              {[
                { label: "Best Moment #1", time: "08:24 – 11:30", color: C.red,    score: 97 },
                { label: "Best Moment #2", time: "22:10 – 24:45", color: C.pink,   score: 89 },
                { label: "Best Moment #3", time: "38:02 – 40:15", color: C.yellow, score: 82 },
              ].map(clip => (
                <div key={clip.label} className="flex items-center justify-between p-2 rounded-lg"
                  style={{ background: `${clip.color}10`, border: `1px solid ${clip.color}30` }}>
                  <div className="flex items-center gap-2">
                    <Scissors size={12} style={{ color: clip.color }} />
                    <span className="text-xs font-medium" style={{ color: C.white }}>{clip.label}</span>
                    <span className="text-xs" style={{ color: C.muted }}>{clip.time}</span>
                  </div>
                  <span className="text-xs font-bold" style={{ color: clip.color }}>{clip.score}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Shorts column */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold" style={{ color: C.muted }}>GENERATED SHORTS</span>
              <span className="text-xs" style={{ color: C.pink }}><Download size={10} className="inline mr-1" />3 ready</span>
            </div>
            {[
              { gradient: `linear-gradient(135deg,${C.red}20,${C.yellow}10)`, border: `${C.red}40` },
              { gradient: `linear-gradient(135deg,${C.pink}20,${C.pink}10)`, border: `${C.pink}40` },
              { gradient: `linear-gradient(135deg,${C.yellow}20,${C.red}10)`, border: `${C.yellow}30` },
            ].map((card, i) => (
              <div key={i} className="rounded-xl p-3 flex items-center gap-3"
                style={{ background: card.gradient, border: `1px solid ${card.border}` }}>
                <div className="w-10 h-14 rounded-md flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
                  <Play size={14} style={{ color: C.white }} fill={C.white} />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold mb-1" style={{ color: C.white }}>Short #{i + 1}</div>
                  <div className="text-xs mb-2" style={{ color: C.muted }}>0:{["3:06", "2:35", "2:13"][i]}</div>
                </div>
                <Download size={14} style={{ color: C.muted }} />
              </div>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-6 pb-4" style={{ borderTop: "1px solid #1a1a1a", paddingTop: "12px" }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs" style={{ color: C.muted }}>AI Processing...</span>
            <span className="text-xs font-semibold" style={{ color: C.pink }}>78%</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: "#1a1a1a" }}>
            <div className="h-full rounded-full" style={{ width: "78%", background: `linear-gradient(90deg,${C.red},${C.yellow},${C.pink})` }} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-12 flex flex-wrap items-center justify-center gap-8"
        style={{ animation: "fadeInUp 0.8s ease-out 0.6s both" }}>
        {[
          { value: "500K+", label: "Shorts Created", color: C.red    },
          { value: "10x",   label: "Faster Editing", color: C.pink   },
          { value: "98%",   label: "AI Accuracy",    color: C.yellow },
          { value: "50+",   label: "Languages",      color: C.red    },
        ].map(stat => (
          <div key={stat.label} className="text-center">
            <div className="text-2xl font-black" style={{ color: stat.color, textShadow: `0 0 20px ${stat.color}50` }}>{stat.value}</div>
            <div className="text-xs" style={{ color: C.muted }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Scroll hint */}
      <button className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40 hover:opacity-70 transition-opacity"
        onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
        aria-label="Scroll to features" style={{ color: C.muted }}>
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <ChevronDown size={16} style={{ animation: "bounce 1.5s ease-in-out infinite" }} />
      </button>
    </section>
  );
}
