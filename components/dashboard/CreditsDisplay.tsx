"use client";

import React, { useEffect, useState } from "react";
import { Zap, Sparkles } from "lucide-react";
import Link from "next/link";
import { getUserCredits } from "@/lib/actions/user.actions";

export function CreditsDisplay() {
  const [credits, setCredits] = useState<number | null>(null);
  const [plan, setPlan] = useState<string>("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCredits() {
      try {
        const data = await getUserCredits();
        if (data) {
          setCredits(data.credits);
          setPlan(data.plan);
        }
      } catch (err) {
        console.error("Failed to fetch credits:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCredits();
  }, []);

  if (loading) {
    return (
      <div className="px-2 mb-6 animate-pulse">
        <div className="h-20 bg-[#111111] border border-[#2a2a2a] rounded-2xl w-full" />
      </div>
    );
  }

  const maxCredits = plan === "cliptic" ? 250 : 30;
  const percentage = plan === "cliptic_pro" ? 100 : Math.min(100, ((credits || 0) / maxCredits) * 100);
  
  return (
    <div className="px-2 mb-6">
      <div className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-4 shadow-xl hover:border-[#B026FF]/30 transition-all group">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#B026FF]/10 text-[#B026FF]">
              <Zap size={14} />
            </div>
            <span className="text-xs font-bold text-[#F8F8F8]">Cliptic Credits</span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-tighter text-[#00E5FF] bg-[#00E5FF]/10 px-1.5 py-0.5 rounded border border-[#00E5FF]/20">
            {plan === "cliptic_pro" ? "Unlimited" : plan === "cliptic" ? "Cliptic Plan" : "Free Trial"}
          </span>
        </div>

        <div className="mb-2">
          <div className="flex items-end justify-between mb-1.5">
            <span className="text-lg font-black text-[#F8F8F8]">
              {plan === "cliptic_pro" ? "∞" : credits}
              <span className="text-[10px] text-[#6B6B6B] font-medium ml-1">
                {plan === "cliptic_pro" ? "Credits" : `/ ${maxCredits} remaining`}
              </span>
            </span>
            <Sparkles size={12} className="text-[#B026FF] animate-pulse" />
          </div>
          
          <div className="w-full bg-[#1a1a1a] h-1.5 rounded-full overflow-hidden border border-[#2a2a2a]">
            <div 
              className="h-full bg-gradient-to-r from-[#7000FF] to-[#00E5FF] transition-all duration-500 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {plan === "free" && (
          <Link 
            href="/dashboard/pricing"
            className="mt-3 block w-full text-center py-2 rounded-lg text-[10px] font-black uppercase tracking-widest bg-[#B026FF]/10 text-[#B026FF] border border-[#B026FF]/20 hover:bg-[#B026FF] hover:text-white transition-all"
          >
            Get More Credits
          </Link>
        )}
      </div>
    </div>
  );
}
