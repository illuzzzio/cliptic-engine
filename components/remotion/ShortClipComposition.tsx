import React, { useMemo } from "react";
import { AbsoluteFill, Html5Video, useCurrentFrame, useVideoConfig } from "remotion";
import {
  DEFAULT_CAPTION_FONT_FAMILY,
  DEFAULT_CAPTION_SIZE,
  DEFAULT_CAPTION_STYLE_KEY,
  resolveCaptionStyle,
} from "../../lib/config/caption-styles";

type Caption = {
  text?: string;
  start?: number;
  end?: number;
};

export type RemotionShortClip = {
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

export type ShortClipCompositionProps = {
  videoUrl: string;
  clip: RemotionShortClip;
  captionStyleKey?: string | null;
  captionFontFamily?: string | null;
  captionSize?: number | null;
};

function captionsFromJson(captions: unknown): Caption[] {
  return Array.isArray(captions) ? (captions as Caption[]) : [];
}

function getActiveCaption(captions: Caption[], absoluteTime: number) {
  return captions.find((caption) => {
    const start = caption.start ?? 0;
    const end = caption.end ?? start;
    return absoluteTime >= start && absoluteTime <= end;
  });
}

export function getShortClipDurationInFrames(clip: Pick<RemotionShortClip, "startTime" | "endTime">, fps = 30) {
  return Math.max(1, Math.floor((clip.endTime - clip.startTime) * fps));
}

export function ShortClipComposition({
  videoUrl,
  clip,
  captionStyleKey,
  captionFontFamily,
  captionSize,
}: ShortClipCompositionProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const captions = useMemo(() => captionsFromJson(clip.captions), [clip.captions]);
  const timeInClip = frame / fps;
  const absoluteTime = clip.startTime + timeInClip;
  const activeCaption = getActiveCaption(captions, absoluteTime);
  const displayWords = (activeCaption?.text ?? "").split(/\s+/).filter(Boolean).slice(0, 3);
  const selectedStyleKey = captionStyleKey ?? clip.captionStyleKey ?? DEFAULT_CAPTION_STYLE_KEY;
  const selectedFontFamily = captionFontFamily ?? clip.captionFontFamily ?? DEFAULT_CAPTION_FONT_FAMILY;
  const selectedCaptionSize = captionSize ?? clip.captionSize ?? DEFAULT_CAPTION_SIZE;
  const resolvedStyle = resolveCaptionStyle(selectedStyleKey);
  const fontSize = `${selectedCaptionSize}rem`;

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Html5Video
        src={videoUrl}
        style={{ height: "100%", width: "100%", objectFit: "cover" }}
        startFrom={Math.floor(clip.startTime * fps)}
        endAt={Math.floor(clip.endTime * fps)}
        volume={1}
      />
      {displayWords.length > 0 && (
        <AbsoluteFill
          style={{
            pointerEvents: "none",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            paddingBottom: 80,
          }}
        >
          <div
            style={{
              ...resolvedStyle.remotionContainerStyle,
              fontFamily: selectedFontFamily,
              textAlign: "center",
              maxWidth: "92%",
              lineHeight: 1.05,
            }}
          >
            {displayWords.map((word, idx) => (
              <span
                key={`${word}-${idx}`}
                style={{
                  ...(idx === 0 ? resolvedStyle.remotionHighlightedWordStyle : resolvedStyle.remotionWordStyle),
                  fontSize,
                  lineHeight: 1.05,
                  display: "inline-block",
                }}
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
