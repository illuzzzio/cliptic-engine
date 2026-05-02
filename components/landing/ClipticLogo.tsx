"use client";

import React from "react";

interface ClipticLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showEngine?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { logo: "text-xl", engine: "text-[7px]", icon: 20 },
  md: { logo: "text-3xl", engine: "text-[9px]", icon: 28 },
  lg: { logo: "text-5xl", engine: "text-xs",    icon: 42 },
  xl: { logo: "text-7xl", engine: "text-sm",    icon: 62 },
};

export function ClipticLogo({ size = "md", showEngine = true, className = "" }: ClipticLogoProps) {
  const s = sizeMap[size];

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {/* Scissors icon */}
      <div className="relative flex-shrink-0" style={{ width: s.icon, height: s.icon }}>
        <svg width={s.icon} height={s.icon} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"
          style={{ filter: "drop-shadow(0 0 8px rgba(255,45,120,0.7)) drop-shadow(0 0 18px rgba(230,57,70,0.35))" }}>
          {/* Left handle circle */}
          <circle cx="9" cy="9" r="5" fill="#E63946" opacity="0.95" />
          <circle cx="9" cy="9" r="2.8" fill="#111111" />
          {/* Right handle circle */}
          <circle cx="9" cy="31" r="5" fill="#FF2D78" opacity="0.95" />
          <circle cx="9" cy="31" r="2.8" fill="#111111" />
          {/* Blades */}
          <line x1="13" y1="12" x2="36" y2="36" stroke="#E63946" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="13" y1="28" x2="36" y2="4"  stroke="#FF2D78" strokeWidth="3.5" strokeLinecap="round" />
          {/* Center gem */}
          <circle cx="22" cy="20" r="2.8" fill="#FFD60A" opacity="0.95" />
        </svg>
        {/* Pulse glow ring */}
        <div className="absolute inset-0 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,45,120,0.22) 0%, transparent 70%)", animation: "pulse-glow 2.5s ease-in-out infinite" }} />
      </div>

      {/* Wordmark */}
      <div className="flex flex-col leading-none">
        <span className={`font-black tracking-tight ${s.logo}`}
          style={{ fontFamily: "var(--font-sans), Inter, sans-serif", position: "relative", display: "inline-flex" }}>
          {/* 3D shadow layer */}
          <span aria-hidden="true" style={{
            position: "absolute", top: "3px", left: "3px",
            background: "linear-gradient(135deg,#7a1020 0%,#7d1a45 50%,#7d6800 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            filter: "blur(1px)", opacity: 0.55,
          }}>Cliptic</span>
          {/* Main gradient text */}
          <span style={{
            background: "linear-gradient(135deg,#E63946 0%,#FFD60A 45%,#FF2D78 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            filter: "drop-shadow(0 2px 10px rgba(255,45,120,0.45))",
          }}>Cliptic</span>
        </span>
        {showEngine && (
          <span className={`tracking-[0.35em] font-semibold uppercase ${s.engine}`}
            style={{ color: "#6B6B6B", marginTop: "1px" }}>ENGINE</span>
        )}
      </div>
    </div>
  );
}
