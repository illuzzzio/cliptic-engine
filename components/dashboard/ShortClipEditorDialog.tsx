"use client";

import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { updateShortCaptionStyle } from "@/lib/actions/project.actions";
import {
  CAPTION_FONT_OPTIONS,
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
  const selectedCaptionSize = clip?.captionSize ?? DEFAULT_CAPTION_SIZE;
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
        captionSize: selectedCaptionSize,
      });
      onSaved({
        shortId: clip.id,
        captionStyleKey: selectedStyleKey,
        captionFontFamily: selectedFont,
        captionSize: selectedCaptionSize,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not save caption style");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[96vw] w-[96vw] h-[92vh] p-0 overflow-y-auto lg:overflow-hidden border border-white/12 bg-[#0b0b0b]/92 text-white shadow-2xl backdrop-blur-xl">
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent_35%)]" />
        <div className="relative grid h-full grid-cols-1 lg:grid-cols-2">
          <div className="border-b lg:border-b-0 lg:border-r border-white/10 p-4 sm:p-5 lg:p-6 bg-black/25 overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl font-extrabold text-white">
                Edit Clip Style
              </DialogTitle>
              <DialogDescription className="text-sm sm:text-base text-[#b7b7b7]">
                Select a design and font, then apply to save this clip&apos;s caption style.
              </DialogDescription>
            </DialogHeader>

            <div className="cliptic-scrollbar min-h-0 flex-1 overflow-y-auto pr-1.5 space-y-3 mt-4 sm:mt-5">
              {CAPTION_STYLE_PRESETS.map((style) => (
                <button
                  key={style.key}
                  type="button"
                  onClick={() => setSelectedStyleKey(style.key)}
                  className={`w-full rounded-2xl border p-3 text-left transition ${
                    selectedStyleKey === style.key
                      ? "border-white/35 bg-[#171717]"
                      : "border-white/10 bg-[#0f0f0f] hover:border-white/20"
                  }`}
                >
                  <p className="font-bold text-white">{style.name}</p>
                  <p className="text-xs text-[#b5b5b5]">{style.description}</p>
                  <div className="mt-3 rounded-lg border border-white/10 bg-black/40 px-3 py-2">
                    <span className={`text-lg font-black tracking-wide ${style.cardPreviewClassName}`}>LIVE PREVIEW</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4 border-t border-white/10 pt-4 space-y-3 bg-[#080808]/90 sticky bottom-0">
              <div className="space-y-2">
                <label htmlFor="caption-font" className="text-sm font-bold">
                  Font Family
                </label>
                <select
                  id="caption-font"
                  value={selectedFont}
                  onChange={(event) => setSelectedFont(event.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-black/70 px-3 py-2 text-sm outline-none focus:border-white/40"
                >
                  {CAPTION_FONT_OPTIONS.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-lg border border-[#2a2a2a] bg-black/40 p-3 text-xs text-[#b8b8b8]">
                <p>Selected: {selectedStyle?.name ?? "Unknown style"}</p>
              </div>

              {error && <p className="text-sm text-red-300">{error}</p>}
            </div>
          </div>

          <div className="p-4 sm:p-5 lg:p-6 flex flex-col bg-black/15">
            {clip ? (
              <>
                <div className="mb-3 inline-flex w-fit rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#dfdfdf]">
                  Real-time Preview
                </div>
                <div className="rounded-3xl border border-white/15 bg-black/40 p-2 sm:p-3 h-[52vh] sm:h-[60vh] lg:h-[72vh] flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_18px_40px_rgba(0,0,0,0.4)]">
                  <RemotionShortPlayer
                    clip={clip}
                    captionStyleKey={selectedStyleKey}
                    captionFontFamily={selectedFont}
                    captionSize={selectedCaptionSize}
                    autoPlay
                    muted
                    initialVideoUrl={previewVideoUrl}
                  />
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-[#9a9a9a]">
                Select a clip to edit.
              </div>
            )}
            <div className="mt-auto pt-4 pb-2 flex items-center justify-end gap-3">
              <DialogClose
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-[#cfcfcf] hover:bg-white/5 hover:text-white"
                  />
                }
              >
                Cancel
              </DialogClose>
              <Button
                onClick={handleApply}
                disabled={!clip || isSaving}
                className="min-w-36 rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20"
              >
                {isSaving ? "Applying..." : "Apply Style"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
