"use client";

import React, { useState, useEffect } from "react";
import { Star, Send, Loader2 } from "lucide-react";
import { submitFeedback, getTopFeedbacks } from "@/lib/actions/feedback.actions";
import { toast } from "sonner";

export function Feedback() {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [topFeedbacks, setTopFeedbacks] = useState<any[]>([]);

  useEffect(() => {
    async function loadFeedbacks() {
      try {
        const data = await getTopFeedbacks();
        setTopFeedbacks(data);
      } catch (err) {
        console.error("Failed to load feedbacks:", err);
      }
    }
    loadFeedbacks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a rating.");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please enter a comment.");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitFeedback(rating, comment);
      toast.success("Thank you for your feedback!");
      setRating(0);
      setComment("");
      // Reload top feedbacks
      const data = await getTopFeedbacks();
      setTopFeedbacks(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit feedback.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="feedback" className="py-24 px-6 relative overflow-hidden bg-[#090909]">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-[#B026FF]/[0.03] blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left: Feedback Form */}
        <div className="relative z-10">
          <span className="inline-block mb-4 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full bg-[#B026FF]/10 text-[#B026FF] border border-[#B026FF]/30">
            Feedback
          </span>
          <h2 className="text-4xl md:text-5xl font-black mb-6 text-white leading-tight">
            Share Your <span className="bg-gradient-to-r from-[#B026FF] to-[#00E5FF] bg-clip-text text-transparent">Experience</span>
          </h2>
          <p className="text-[#6B6B6B] mb-10 max-w-md">
            Your feedback helps us make Cliptic Engine even better for creators worldwide.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6 bg-[#111111] p-8 rounded-3xl border border-[#2a2a2a] shadow-2xl relative">
             <div className="absolute -top-4 -right-4 w-12 h-12 bg-[#B026FF]/20 blur-xl rounded-full" />
            
            {/* Star Rating */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#F8F8F8]">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    className="transition-transform active:scale-90"
                  >
                    <Star
                      size={32}
                      className={`${
                        s <= rating ? "fill-[#00E5FF] text-[#00E5FF]" : "text-[#2a2a2a]"
                      } transition-colors`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <label htmlFor="comment" className="text-sm font-bold text-[#F8F8F8]">Your Feedback</label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us what you think..."
                className="w-full bg-[#090909] border border-[#2a2a2a] rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-[#B026FF]/50 transition-all min-h-[120px] resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm transition-all duration-300 bg-gradient-to-r from-[#7000FF] to-[#B026FF] text-white shadow-[0_0_20px_rgba(176,38,255,0.2)] hover:shadow-[0_0_40px_rgba(176,38,255,0.4)] disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              {isSubmitting ? "Sending..." : "Submit Feedback"}
            </button>
          </form>
        </div>

        {/* Right: Static Wall of Love */}
        <div className="relative flex flex-col justify-center">
          <div className="mb-8">
            <h3 className="text-2xl font-black text-white mb-2">Wall of <span className="text-[#00E5FF]">Love</span></h3>
            <p className="text-sm text-[#6B6B6B]">Recent feedbacks from our premium users.</p>
          </div>

          <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {topFeedbacks.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {topFeedbacks.map((fb, i) => (
                  <div 
                    key={`${fb.id}-${i}`} 
                    className="group relative bg-[#111111] border border-[#2a2a2a] p-5 rounded-2xl transition-all duration-500 hover:border-[#B026FF]/40 hover:shadow-[0_0_30px_rgba(176,38,255,0.1)] overflow-hidden"
                  >
                    {/* Shine Effect Overlay */}
                    <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-20deg] pointer-events-none" />
                    
                    <div className="flex items-center justify-between mb-3 relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#B026FF] to-[#00E5FF] p-[1px]">
                          <div className="w-full h-full bg-[#111111] rounded-xl flex items-center justify-center text-xs font-black text-white">
                            {fb.userName?.charAt(0) || "U"}
                          </div>
                        </div>
                        <span className="text-sm font-black text-white">{fb.userName}</span>
                      </div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: fb.rating }).map((_, r) => (
                          <Star key={r} size={10} className="fill-[#00E5FF] text-[#00E5FF]" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-[#a0a0a0] leading-relaxed font-medium relative z-10">&quot;{fb.comment}&quot;</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-[#1a1a1a] rounded-3xl bg-[#0d0d0d]">
                <div className="w-16 h-16 rounded-full bg-[#111111] border border-[#2a2a2a] flex items-center justify-center mb-4">
                   <Star size={24} className="text-[#3a3a3a]" />
                </div>
                <p className="text-sm text-[#3a3a3a] font-bold">Waiting for the first 5-star review...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #090909;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1a1a1a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #B026FF50;
        }
      `}</style>
    </section>
  );
}
