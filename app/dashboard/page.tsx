"use client";
import React from "react";
import { UserButton } from "@clerk/nextjs";
import { ClipticLogo } from "@/components/landing/ClipticLogo";
import Link from "next/link";
import { ArrowLeft, Video, Sparkles, BarChart2, Plus } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="w-full">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-[#B026FF] to-[#00E5FF] bg-clip-text text-transparent mb-1">
              Welcome back
            </h1>
            <p className="text-[#6B6B6B] text-sm">Ready to create some viral clips?</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all duration-300 bg-gradient-to-r from-[#7000FF] to-[#B026FF] shadow-[0_0_20px_rgba(176,38,255,0.3)] hover:shadow-[0_0_35px_rgba(176,38,255,0.5)] hover:-translate-y-0.5 group">
            <Plus size={18} className="transition-transform group-hover:rotate-90" />
            Create New Project
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: "Total Shorts Generated", value: "0", color: "#7000FF", icon: Video },
            { label: "Minutes Processed", value: "0", color: "#00E5FF", icon: Sparkles },
            { label: "Hours Saved", value: "0", color: "#B026FF", icon: BarChart2 },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-6 relative overflow-hidden group transition-all duration-300 hover:border-[#B026FF]/30 hover:shadow-[0_0_30px_rgba(176,38,255,0.05)] hover:-translate-y-1">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Icon size={48} style={{ color: stat.color }} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-3 mb-3 relative z-10">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}15`, border: `1px solid ${stat.color}30` }}>
                    <Icon size={16} style={{ color: stat.color }} />
                  </div>
                  <p className="text-sm font-medium text-[#6B6B6B]">{stat.label}</p>
                </div>
                <p className="text-5xl font-black relative z-10" style={{ color: stat.color, textShadow: `0 0 20px ${stat.color}40`, letterSpacing: "-0.04em" }}>
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Empty State Area */}
        <div className="bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#2a2a2a] border-dashed rounded-3xl p-16 text-center flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] mix-blend-overlay" />
          
          <div className="w-20 h-20 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center mb-6 relative z-10 shadow-[0_0_30px_rgba(176,38,255,0.1)] group-hover:scale-110 transition-transform duration-500">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[#B026FF] to-[#00E5FF] opacity-20 blur-xl" />
            <Video size={32} className="text-[#00E5FF] relative z-10" />
          </div>
          
          <h3 className="text-2xl font-black text-[#F8F8F8] mb-3 relative z-10">No projects yet</h3>
          <p className="text-[#6B6B6B] max-w-md mx-auto mb-8 relative z-10 text-sm leading-relaxed">
            Upload your first video to start generating viral shorts automatically with AI. Our engine will find the best hooks instantly.
          </p>
          
          <button className="relative z-10 flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 border border-[#B026FF]/50 text-[#B026FF] hover:bg-[#B026FF]/10 hover:border-[#B026FF] focus:outline-none focus:ring-2 focus:ring-[#B026FF] focus:ring-offset-2 focus:ring-offset-[#090909]">
            <UploadIcon />
            Import Video
          </button>
        </div>
      </div>
    </div>
  );
}

function UploadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="17 8 12 3 7 8"></polyline>
      <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg>
  );
}
