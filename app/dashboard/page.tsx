"use client";
import React from "react";
import { UserButton } from "@clerk/nextjs";
import { ClipticLogo } from "@/components/landing/ClipticLogo";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#090909] text-[#F8F8F8]">
      {/* Dashboard Header */}
      <header className="border-b border-[#1a1a1a] bg-[#090909] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ClipticLogo size="sm" showEngine={false} />
            <div className="h-6 w-px bg-[#2a2a2a] mx-2" />
            <span className="text-sm font-semibold text-[#6B6B6B]">Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8 rounded-lg border border-[#2a2a2a]",
                }
              }}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#FF2D78] to-[#FFD60A] bg-clip-text text-transparent">
              Welcome back
            </h1>
            <p className="text-[#6B6B6B] mt-1">Ready to create some viral clips?</p>
          </div>
          <button className="px-6 py-3 rounded-xl font-bold text-white transition-all duration-300 bg-gradient-to-r from-[#E63946] to-[#FF2D78] shadow-[0_0_20px_rgba(255,45,120,0.3)] hover:shadow-[0_0_30px_rgba(255,45,120,0.5)] hover:-translate-y-0.5">
            Create New Project
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: "Total Shorts Generated", value: "0", color: "#E63946" },
            { label: "Minutes Processed", value: "0", color: "#FFD60A" },
            { label: "Hours Saved", value: "0", color: "#FF2D78" },
          ].map((stat, i) => (
            <div key={i} className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="text-sm font-medium text-[#6B6B6B] mb-2">{stat.label}</p>
              <p className="text-4xl font-black" style={{ color: stat.color, textShadow: `0 0 20px ${stat.color}40` }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Empty State Area */}
        <div className="bg-[#111111] border border-[#2a2a2a] border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-16 h-16 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF2D78" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-[#F8F8F8] mb-2">No projects yet</h3>
          <p className="text-[#6B6B6B] max-w-md mx-auto mb-6">
            Upload your first video to start generating viral shorts automatically with AI.
          </p>
        </div>
      </main>
    </div>
  );
}
