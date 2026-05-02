"use client";

import React from "react";

export function Background3D() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }} aria-hidden="true">
      {/* Deep dark base */}
      <div className="absolute inset-0" style={{ background: "#090909" }} />

      {/* Red top blob — hero accent */}
      <div className="absolute" style={{
        width: "900px", height: "900px", top: "-200px", left: "50%",
        transform: "translateX(-50%)",
        background: "radial-gradient(ellipse, rgba(112,0,255,0.09) 0%, transparent 68%)",
        animation: "float-blob-1 8s ease-in-out infinite alternate",
        borderRadius: "50%",
      }} />

      {/* Pink left blob */}
      <div className="absolute" style={{
        width: "600px", height: "600px", bottom: "10%", left: "-100px",
        background: "radial-gradient(ellipse, rgba(176,38,255,0.07) 0%, transparent 70%)",
        animation: "float-blob-2 10s ease-in-out infinite alternate",
        borderRadius: "50%",
      }} />

      {/* Yellow right blob */}
      <div className="absolute" style={{
        width: "500px", height: "500px", bottom: "20%", right: "-80px",
        background: "radial-gradient(ellipse, rgba(0,229,255,0.05) 0%, transparent 70%)",
        animation: "float-blob-3 7s ease-in-out infinite alternate",
        borderRadius: "50%",
      }} />

      {/* Mid pink */}
      <div className="absolute" style={{
        width: "400px", height: "400px", top: "45%", right: "18%",
        background: "radial-gradient(ellipse, rgba(176,38,255,0.05) 0%, transparent 70%)",
        animation: "float-blob-2 9s ease-in-out infinite alternate",
        borderRadius: "50%",
      }} />

      {/* Grid overlay */}
      <div className="absolute inset-0" style={{
        backgroundImage: "repeating-linear-gradient(rgba(255,255,255,0.022) 0px, rgba(255,255,255,0.022) 1px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, rgba(255,255,255,0.022) 0px, rgba(255,255,255,0.022) 1px, transparent 1px, transparent 60px)",
        backgroundSize: "60px 60px",
      }} />

      {/* Grain noise */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>

      {/* Bottom vignette */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: "300px", background: "linear-gradient(to top, #090909 0%, transparent 100%)" }} />
    </div>
  );
}
