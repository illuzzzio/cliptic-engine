"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Clock, Share2 } from "lucide-react";
import { format } from "date-fns";
import { getExportedVideos, getSocialAccounts, schedulePost } from "@/lib/actions/schedule.actions";
import type { VideoClip, SocialAccount } from "@/lib/types/schedule";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
};

export function SchedulePostDialog({ open, onOpenChange, selectedDate }: Props) {
  const [step, setStep] = useState<"video" | "account">("video");
  const [selectedVideo, setSelectedVideo] = useState<VideoClip | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<SocialAccount | null>(null);
  const [videos, setVideos] = useState<VideoClip[]>([]);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    if (open) {
      loadVideosAndAccounts();
    }
  }, [open]);

  const loadVideosAndAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const [videosData, accountsData] = await Promise.all([
        getExportedVideos(),
        getSocialAccounts(),
      ]);

      setVideos(videosData);
      setAccounts(accountsData);
    } catch (err) {
      setError("Failed to load videos and accounts");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async () => {
    if (!selectedVideo || !selectedAccount || !selectedDate) return;

    setScheduling(true);
    setError(null);

    try {
      await schedulePost({
        shortId: selectedVideo.id,
        socialAccountId: selectedAccount.id,
        scheduledDate: selectedDate,
      });

      onOpenChange(false);
      setStep("video");
      setSelectedVideo(null);
      setSelectedAccount(null);
    } catch (err) {
      setError("Failed to schedule post");
      console.error(err);
    } finally {
      setScheduling(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setStep("video");
    setSelectedVideo(null);
    setSelectedAccount(null);
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl border border-white/10 bg-[#0a0a0a] text-white shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-white">
            {step === "video" ? "Select Video to Post" : "Choose Social Account"}
          </DialogTitle>
          <DialogDescription className="text-[#8a8a8a] flex items-center gap-2 mt-2">
            <Clock size={16} />
            Scheduled for {selectedDate && format(selectedDate, "MMMM d, yyyy")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto scrollbar">
          {step === "video" ? (
            <>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="animate-spin text-[#00E5FF]" size={32} />
                </div>
              ) : videos.length > 0 ? (
                <div className="space-y-3">
                  {videos.map((video) => (
                    <button
                      key={video.id}
                      onClick={() => setSelectedVideo(video)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        selectedVideo?.id === video.id
                          ? "border-[#B026FF] bg-[#B026FF]/10 shadow-[0_0_20px_rgba(176,38,255,0.2)]"
                          : "border-[#2a2a2a] bg-[#111111]/50 hover:border-[#B026FF]/50 hover:bg-[#111111]"
                      } ${!video.exportUrl || video.renderStatus !== "completed" ? "opacity-50 cursor-not-allowed" : ""}`}
                      disabled={!video.exportUrl || video.renderStatus !== "completed"}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-white mb-1 truncate">{video.title}</h3>
                          <div className="flex gap-2 text-xs text-[#aaa]">
                            <span>{video.duration}s</span>
                            <span>•</span>
                            <span className="text-[#00E5FF]">SEO {video.seoScore}</span>
                          </div>
                          <div className="mt-2 inline-block px-2 py-1 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-xs text-[#00E5FF] font-bold">
                            {video.renderStatus === "completed" ? "✓ Ready to post" : "Processing..."}
                          </div>
                        </div>
                        {selectedVideo?.id === video.id && (
                          <div className="w-5 h-5 rounded-full bg-[#B026FF] flex items-center justify-center flex-shrink-0 mt-1">
                            <div className="w-2 h-2 rounded-full bg-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-[#777]">
                  <p>No rendered videos available</p>
                  <p className="text-xs mt-2">Render a clip first before scheduling</p>
                </div>
              )}
            </>
          ) : (
            <>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="animate-spin text-[#00E5FF]" size={32} />
                </div>
              ) : accounts.length > 0 ? (
                <div className="space-y-3">
                  {accounts.map((account) => (
                    <button
                      key={account.id}
                      onClick={() => setSelectedAccount(account)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        selectedAccount?.id === account.id
                          ? "border-[#00E5FF] bg-[#00E5FF]/10 shadow-[0_0_20px_rgba(0,229,255,0.2)]"
                          : "border-[#2a2a2a] bg-[#111111]/50 hover:border-[#00E5FF]/50 hover:bg-[#111111]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-white mb-1">{account.accountName}</h3>
                          <div className="flex gap-2 text-xs text-[#aaa]">
                            <span className="px-2 py-1 rounded-lg bg-[#B026FF]/10 border border-[#B026FF]/30 text-[#B026FF] font-bold">
                              {account.platform}
                            </span>
                            <span className="text-[#888]">{account.accountHandle}</span>
                          </div>
                        </div>
                        {selectedAccount?.id === account.id && (
                          <div className="w-5 h-5 rounded-full bg-[#00E5FF] flex items-center justify-center flex-shrink-0 mt-1">
                            <div className="w-2 h-2 rounded-full bg-[#0a0a0a]" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-[#777]">
                  <p>No connected social accounts</p>
                  <p className="text-xs mt-2">Connect a social account in settings first</p>
                </div>
              )}
            </>
          )}

          {error && (
            <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-6 border-t border-[#2a2a2a]">
          <Button
            variant="ghost"
            onClick={handleClose}
            className="flex-1 rounded-lg text-[#888] hover:text-white hover:bg-white/5"
          >
            Cancel
          </Button>

          {step === "video" ? (
            <Button
              onClick={() => setStep("account")}
              disabled={!selectedVideo}
              className="flex-1 rounded-lg bg-[#B026FF] hover:bg-[#7000FF] text-white font-bold disabled:opacity-50"
            >
              Next: Select Account
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => setStep("video")}
                className="flex-1 rounded-lg text-[#888] hover:text-white hover:bg-white/5"
              >
                Back
              </Button>
              <Button
                onClick={handleSchedule}
                disabled={!selectedAccount || scheduling}
                className="flex-1 rounded-lg bg-[#00E5FF] hover:bg-[#00C5FF] text-black font-bold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {scheduling ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Share2 size={16} />
                    Schedule Post
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
