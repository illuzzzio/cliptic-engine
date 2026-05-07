"use client";

import React, { useCallback, useMemo, useState } from "react";
import { Loader2, Play } from "lucide-react";
import { getProjectPlaybackUrl } from "@/lib/actions/project.actions";
import { Player } from "@remotion/player";
import { AbsoluteFill, Html5Video, useCurrentFrame, useVideoConfig } from "remotion";
import {
  DEFAULT_CAPTION_SIZE,
  DEFAULT_CAPTION_FONT_FAMILY,
  DEFAULT_CAPTION_STYLE_KEY,
  resolveCaptionStyle,
} from "@/lib/config/caption-styles";

type Caption = {
  text?: string;
  start?: number;
  end?: number;
};

export type ShortClip = {
  id: string;
  projectId: string;
  title: string;
  startTime: number;
  endTime: number;
  duration: number;
  captions: unknown;
  captionStyleKey?: string | null;
  captionFontFamily?: string | null;
  captionSize?: number | null;
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

function ClipComposition({
  videoUrl,
  clip,
  captionStyleKey,
  captionFontFamily,
  captionSize,
}: {
  videoUrl: string;
  clip: ShortClip;
  captionStyleKey: string;
  captionFontFamily: string;
  captionSize: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const captions = captionsFromJson(clip.captions);
  const timeInClip = frame / fps;
  const absoluteTime = clip.startTime + timeInClip;
  const activeCaption = getActiveCaption(captions, absoluteTime);
  const displayWords = (activeCaption?.text ?? "").split(/\s+/).filter(Boolean).slice(0, 3);
  const resolvedStyle = resolveCaptionStyle(captionStyleKey);

  return (
    <AbsoluteFill className="bg-black">
      <Html5Video src={videoUrl} className="h-full w-full object-cover" startFrom={Math.floor(clip.startTime * fps)} endAt={Math.floor(clip.endTime * fps)} />
      {displayWords.length > 0 && (
        <AbsoluteFill className="pointer-events-none justify-end items-center pb-20">
          <div className={`text-center ${resolvedStyle.containerClassName}`} style={{ fontFamily: captionFontFamily }}>
            {displayWords.map((word, idx) => (
              <span
                key={`${word}-${idx}`}
                className={idx === 0 ? resolvedStyle.highlightedWordClassName : resolvedStyle.wordClassName}
                style={{ fontSize: `${captionSize}rem`, lineHeight: 1.05 }}
              >
                {word}
              </span>
            ))}
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
}

type RemotionShortPlayerProps = {
  clip: ShortClip;
  captionStyleKey?: string | null;
  captionFontFamily?: string | null;
  captionSize?: number | null;
  autoPlay?: boolean;
  muted?: boolean;
  initialVideoUrl?: string | null;
};

export function RemotionShortPlayer({
  clip,
  captionStyleKey,
  captionFontFamily,
  captionSize,
  autoPlay = false,
  muted = false,
  initialVideoUrl = null,
}: RemotionShortPlayerProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(initialVideoUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectedStyleKey = captionStyleKey ?? clip.captionStyleKey ?? DEFAULT_CAPTION_STYLE_KEY;
  const selectedFontFamily = captionFontFamily ?? clip.captionFontFamily ?? DEFAULT_CAPTION_FONT_FAMILY;
  const selectedCaptionSize = captionSize ?? clip.captionSize ?? DEFAULT_CAPTION_SIZE;
  const fps = 30;
  const durationInFrames = useMemo(() => Math.max(1, Math.floor((clip.endTime - clip.startTime) * fps)), [clip.endTime, clip.startTime]);

  const loadPreview = useCallback(async () => {
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
  }, [clip.projectId, isLoading, videoUrl]);

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
    <div className="w-full h-full flex items-center justify-center">
      <Player
        component={ClipComposition}
        durationInFrames={durationInFrames}
        fps={fps}
        compositionHeight={1280}
        compositionWidth={720}
        controls
        autoPlay={autoPlay}
        loop
        initiallyMuted={muted}
        style={{ width: "100%", maxWidth: "720px", height: "100%", maxHeight: "84vh", aspectRatio: "9/16", backgroundColor: "black", borderRadius: "16px" }}
        inputProps={{
          videoUrl,
          clip,
          captionStyleKey: selectedStyleKey,
          captionFontFamily: selectedFontFamily,
          captionSize: selectedCaptionSize,
        }}
      />
    </div>
  );
}
