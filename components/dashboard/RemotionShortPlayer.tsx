"use client";

import React, { useRef, useState } from "react";
import { Download, Loader2, Play } from "lucide-react";
import { getProjectPlaybackUrl } from "@/lib/actions/project.actions";

type Caption = {
  text?: string;
  start?: number;
  end?: number;
};

type ShortClip = {
  id: string;
  projectId: string;
  title: string;
  startTime: number;
  endTime: number;
  duration: number;
  captions: unknown;
};

function captionsFromJson(captions: unknown): Caption[] {
  return Array.isArray(captions) ? captions as Caption[] : [];
}

function getActiveCaption(captions: Caption[], absoluteTime: number) {
  return captions.find((caption) => {
    const start = caption.start ?? 0;
    const end = caption.end ?? start;
    return absoluteTime >= start && absoluteTime <= end;
  });
}

export function RemotionShortPlayer({ clip }: { clip: ShortClip }) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const captions = captionsFromJson(clip.captions);
  const activeCaption = getActiveCaption(captions, clip.startTime + currentTime);

  const getDisplayWords = (text?: string) => {
    if (!text) return [];
    return text.split(/\s+/).slice(0, 3);
  };

  const displayWords = getDisplayWords(activeCaption?.text);

  const loadPreview = async () => {
    if (videoUrl || isLoading) return;
    setIsLoading(true);
    setError(null);

    try {
      const url = await getProjectPlaybackUrl(clip.projectId);
      setVideoUrl(url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not load preview");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    if (clip.startTime >= 0 && clip.startTime < videoRef.current.duration) {
      videoRef.current.currentTime = clip.startTime;
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
    if (videoRef.current.currentTime >= clip.endTime) {
      videoRef.current.pause();
    }
  };

  const handleJumpToStart = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = clip.startTime;
    videoRef.current.play().catch(() => undefined);
  };

  if (!videoUrl) {
    return (
      <div className="relative w-full aspect-[9/16] flex items-center justify-center overflow-hidden rounded-none bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(0,229,255,0.16),transparent_38%),linear-gradient(160deg,rgba(176,38,255,0.18),transparent_48%)] pointer-events-none" />
        <button
          type="button"
          onClick={loadPreview}
          disabled={isLoading}
          className="relative z-10 inline-flex items-center gap-2 rounded-lg bg-[#00E5FF] px-4 py-2 text-xs font-bold text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? <Loader2 className="animate-[spin_2s_linear_infinite]" size={14} /> : <Play size={14} />}
          {isLoading ? "Loading..." : "Load"}
        </button>
        {error && <p className="absolute bottom-2 left-2 right-2 z-10 text-center text-xs text-red-300 line-clamp-2">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-0 w-full">
      <div className="relative overflow-hidden rounded-none bg-black w-full aspect-[9/16]">
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          className="w-full aspect-[9/16] object-cover bg-black"
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
        />
        
        {displayWords.length > 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-20 pointer-events-none z-50">
            <div className="text-center">
              {displayWords.map((word, idx) => (
                <span key={idx} className={`inline-block text-4xl font-black leading-tight mx-1 ${
                  idx === 0 
                    ? 'bg-yellow-300 text-black px-3 py-1 rounded-lg' 
                    : 'text-yellow-300'
                }`}>
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
