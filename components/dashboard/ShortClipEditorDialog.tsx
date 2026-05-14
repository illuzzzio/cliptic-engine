"use client";

import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { updateShortCaptionStyle } from "@/lib/actions/project.actions";
import {
  CAPTION_FONT_OPTIONS,
  CAPTION_SIZE_OPTIONS,
  CAPTION_STYLE_PRESETS,
  DEFAULT_CAPTION_SIZE,
  DEFAULT_CAPTION_FONT_FAMILY,
  DEFAULT_CAPTION_STYLE_KEY,
} from "@/lib/config/caption-styles";
import { RemotionShortPlayer, ShortClip } from "@/components/dashboard/RemotionShortPlayer";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clip: ShortClip | null;
  previewVideoUrl: string | null;
  onSaved: (input: { shortId: string; captionStyleKey: string; captionFontFamily: string; captionSize: number }) => void;
};

export function ShortClipEditorDialog({ open, onOpenChange, clip, previewVideoUrl, onSaved }: Props) {
  const [selectedStyleKey, setSelectedStyleKey] = useState(clip?.captionStyleKey ?? DEFAULT_CAPTION_STYLE_KEY);
  const [selectedFont, setSelectedFont] = useState(clip?.captionFontFamily ?? DEFAULT_CAPTION_FONT_FAMILY);
  const [selectedSize, setSelectedSize] = useState<number>(clip?.captionSize ?? DEFAULT_CAPTION_SIZE);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedStyle = useMemo(
    () => CAPTION_STYLE_PRESETS.find((style) => style.key === selectedStyleKey),
    [selectedStyleKey]
  );

  const handleApply = async () => {
    if (!clip) return;
    setIsSaving(true);
    setError(null);
    try {
      await updateShortCaptionStyle({
        shortId: clip.id,
        captionStyleKey: selectedStyleKey,
        captionFontFamily: selectedFont,
        captionSize: selectedSize,
      });
      onSaved({
        shortId: clip.id,
        captionStyleKey: selectedStyleKey,
        captionFontFamily: selectedFont,
        captionSize: selectedSize,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not save caption style");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[96vw] w-[96vw] max-h-[95vh] p-0 overflow-hidden border border-white/10 bg-[#0a0a0a] text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-black/40 flex-shrink-0">
          <div>
            <DialogTitle className="text-lg font-extrabold text-white leading-none">Edit Clip Style</DialogTitle>
            <DialogDescription className="text-xs text-[#888] mt-0.5">
              Pick a style, font &amp; size — then apply.
            </DialogDescription>
          </div>
          <div className="flex items-center gap-2">
            <DialogClose
              render={
                <Button type="button" variant="ghost" className="h-8 px-3 text-xs text-[#888] hover:text-white hover:bg-white/5" />
              }
            >
              Cancel
            </DialogClose>
            <Button
              onClick={handleApply}
              disabled={!clip || isSaving}
              className="h-8 px-4 text-xs font-bold rounded-lg bg-[#B026FF] text-white hover:bg-[#7000FF] disabled:opacity-40"
            >
              {isSaving ? "Saving…" : "Apply Style"}
            </Button>
          </div>
        </div>

        {/* Main body — vertical on mobile, horizontal on lg+ */}
        <div className="flex flex-col lg:flex-row h-[calc(95vh-64px)] overflow-hidden">

          {/* ── LEFT: Controls ── */}
          <div className="flex flex-col lg:w-[380px] lg:flex-shrink-0 overflow-y-auto border-b lg:border-b-0 lg:border-r border-white/10 bg-black/20 p-4 gap-5">

            {/* Font Family */}
            <div className="space-y-2">
              <p className="text-[11px] font-black uppercase tracking-widest text-[#777]">Font Family</p>
              <select
                value={selectedFont}
                onChange={(e) => setSelectedFont(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#111] px-3 py-2.5 text-sm text-white outline-none focus:border-[#B026FF]/60 cursor-pointer"
              >
                {CAPTION_FONT_OPTIONS.map((font) => (
                  <option key={font} value={font} className="bg-[#111]">
                    {font.split(",")[0]}
                  </option>
                ))}
              </select>
            </div>

            {/* Font Size */}
            <div className="space-y-2">
              <p className="text-[11px] font-black uppercase tracking-widest text-[#777]">Font Size</p>
              <div className="grid grid-cols-5 gap-2">
                {CAPTION_SIZE_OPTIONS.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`rounded-xl border py-2 text-sm font-black transition-all ${
                      selectedSize === size
                        ? "border-[#B026FF]/70 bg-[#B026FF]/20 text-[#d588ff]"
                        : "border-white/10 bg-white/[0.03] text-[#888] hover:border-white/25 hover:text-white"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Style Cards */}
            <div className="space-y-2">
              <p className="text-[11px] font-black uppercase tracking-widest text-[#777]">Caption Style</p>
              <div className="space-y-2">
                {CAPTION_STYLE_PRESETS.map((style) => (
                  <button
                    key={style.key}
                    type="button"
                    onClick={() => setSelectedStyleKey(style.key)}
                    className={`w-full rounded-2xl border p-3 text-left transition-all ${
                      selectedStyleKey === style.key
                        ? "border-[#B026FF]/50 bg-[#B026FF]/10"
                        : "border-white/8 bg-white/[0.025] hover:border-white/18 hover:bg-white/[0.05]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className={`text-sm font-bold leading-none ${selectedStyleKey === style.key ? "text-[#d588ff]" : "text-white"}`}>
                        {style.name}
                      </p>
                      {selectedStyleKey === style.key && (
                        <div className="h-2 w-2 rounded-full bg-[#B026FF] shadow-[0_0_6px_#B026FF]" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#666] mb-2">{style.description}</p>
                    <div className="rounded-lg border border-white/8 bg-black/50 px-3 py-1.5">
                      <span className={`text-sm font-black tracking-wide ${style.cardPreviewClassName}`}>PREVIEW</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400 font-semibold border border-red-500/20 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
            )}

            {/* Selected info */}
            <div className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2 text-xs text-[#666] flex items-center justify-between">
              <span>Active</span>
              <span className="font-bold text-[#aaa]">{selectedStyle?.name ?? "—"} · {selectedFont.split(",")[0]} · {selectedSize}×</span>
            </div>
          </div>

          {/* ── RIGHT: Preview ── */}
          <div className="flex-1 flex flex-col items-center justify-center bg-black/10 p-4 sm:p-6 min-h-[40vh] lg:min-h-0">
            {clip ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                <div className="inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#aaa]">
                  Real-time Preview
                </div>
                <div className="w-full flex-1 min-h-0 max-w-[340px] max-h-[70vh] rounded-3xl border border-white/10 bg-black/40 p-2 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_20px_50px_rgba(0,0,0,0.5)]">
                  <RemotionShortPlayer
                    clip={clip}
                    captionStyleKey={selectedStyleKey}
                    captionFontFamily={selectedFont}
                    captionSize={selectedSize}
                    autoPlay
                    muted
                    initialVideoUrl={previewVideoUrl}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center text-[#555] text-sm font-bold">
                Select a clip to preview.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
