import type { CSSProperties } from "react";

export const DEFAULT_CAPTION_STYLE_KEY = "highlight-first-word";
export const DEFAULT_CAPTION_FONT_FAMILY = "Inter, sans-serif";
export const DEFAULT_CAPTION_SIZE = 4.5;

export type CaptionStyleDefinition = {
  key: string;
  name: string;
  description: string;
  accentClassName: string;
  cardPreviewClassName: string;
  containerClassName: string;
  wordClassName: string;
  highlightedWordClassName: string;
  remotionContainerStyle: CSSProperties;
  remotionWordStyle: CSSProperties;
  remotionHighlightedWordStyle: CSSProperties;
};

export const CAPTION_STYLE_PRESETS: CaptionStyleDefinition[] = [
  {
    key: "highlight-first-word",
    name: "Viral Highlight",
    description: "Bright first word, bold remaining text",
    accentClassName: "from-[#8a5b00]/80 via-[#f4b400]/70 to-[#ffe08a]/70 border-[#f4b400]/60",
    cardPreviewClassName: "text-yellow-300",
    containerClassName: "rounded-xl bg-black/45 px-3 py-2",
    wordClassName: "text-4xl font-black text-yellow-300 leading-tight mx-1",
    highlightedWordClassName: "rounded-lg bg-yellow-300 px-3 py-1 text-4xl font-black text-black leading-tight mx-1",
    remotionContainerStyle: { borderRadius: 14, backgroundColor: "rgba(0,0,0,0.45)", padding: "10px 14px" },
    remotionWordStyle: { color: "#fde047", fontWeight: 900, margin: "0 5px" },
    remotionHighlightedWordStyle: { color: "#000000", backgroundColor: "#fde047", borderRadius: 10, fontWeight: 900, padding: "4px 12px", margin: "0 5px" },
  },
  {
    key: "neon-outline",
    name: "Neon Outline",
    description: "Cyan glow with white outlined words",
    accentClassName: "from-[#004d59]/80 via-[#00b8cc]/70 to-[#62efff]/70 border-[#00E5FF]/60",
    cardPreviewClassName: "text-[#00E5FF] [text-shadow:_0_0_10px_rgba(0,229,255,0.95)]",
    containerClassName: "rounded-xl bg-black/35 px-3 py-2 shadow-[0_0_24px_rgba(0,229,255,0.25)]",
    wordClassName: "text-4xl font-black text-white [text-shadow:_0_0_10px_rgba(0,229,255,0.9)] leading-tight mx-1",
    highlightedWordClassName: "rounded-lg border border-[#00E5FF] bg-[#00E5FF]/15 px-3 py-1 text-4xl font-black text-white [text-shadow:_0_0_10px_rgba(0,229,255,0.9)] leading-tight mx-1",
    remotionContainerStyle: { borderRadius: 14, backgroundColor: "rgba(0,0,0,0.35)", padding: "10px 14px", boxShadow: "0 0 24px rgba(0,229,255,0.25)" },
    remotionWordStyle: { color: "#ffffff", fontWeight: 900, margin: "0 5px", textShadow: "0 0 10px rgba(0,229,255,0.9)" },
    remotionHighlightedWordStyle: { color: "#ffffff", backgroundColor: "rgba(0,229,255,0.15)", border: "2px solid #00E5FF", borderRadius: 10, fontWeight: 900, padding: "4px 12px", margin: "0 5px", textShadow: "0 0 10px rgba(0,229,255,0.9)" },
  },
  {
    key: "minimal-white",
    name: "Minimal White",
    description: "Simple clean subtitle style",
    accentClassName: "from-[#2d2d2d]/80 via-[#535353]/70 to-[#a0a0a0]/70 border-[#d8d8d8]/60",
    cardPreviewClassName: "text-white",
    containerClassName: "rounded-md bg-black/55 px-3 py-2",
    wordClassName: "text-3xl font-bold text-white leading-tight mx-1",
    highlightedWordClassName: "text-3xl font-bold text-white underline underline-offset-4 leading-tight mx-1",
    remotionContainerStyle: { borderRadius: 8, backgroundColor: "rgba(0,0,0,0.55)", padding: "10px 14px" },
    remotionWordStyle: { color: "#ffffff", fontWeight: 700, margin: "0 5px" },
    remotionHighlightedWordStyle: { color: "#ffffff", fontWeight: 700, margin: "0 5px", textDecoration: "underline", textUnderlineOffset: 8 },
  },
  {
    key: "sunset-pop",
    name: "Sunset Pop",
    description: "Warm gradient pop with contrast badge",
    accentClassName: "from-[#4d1a00]/80 via-[#ff6a00]/70 to-[#ffb347]/70 border-[#ff8a3d]/60",
    cardPreviewClassName: "text-[#ffb347]",
    containerClassName: "rounded-xl bg-black/40 px-3 py-2 shadow-[0_0_24px_rgba(255,106,0,0.25)]",
    wordClassName: "font-black text-[#FFD7A3] leading-tight mx-1",
    highlightedWordClassName: "rounded-lg bg-[#ff6a00] px-3 py-1 font-black text-white leading-tight mx-1",
    remotionContainerStyle: { borderRadius: 14, backgroundColor: "rgba(0,0,0,0.4)", padding: "10px 14px", boxShadow: "0 0 24px rgba(255,106,0,0.25)" },
    remotionWordStyle: { color: "#FFD7A3", fontWeight: 900, margin: "0 5px" },
    remotionHighlightedWordStyle: { color: "#ffffff", backgroundColor: "#ff6a00", borderRadius: 10, fontWeight: 900, padding: "4px 12px", margin: "0 5px" },
  },
  {
    key: "purple-glow",
    name: "Purple Glow",
    description: "Electric violet with glow highlight",
    accentClassName: "from-[#2d0059]/80 via-[#7000FF]/70 to-[#c084fc]/70 border-[#B026FF]/60",
    cardPreviewClassName: "text-[#c084fc] [text-shadow:_0_0_10px_rgba(176,38,255,0.95)]",
    containerClassName: "rounded-xl bg-black/40 px-3 py-2 shadow-[0_0_24px_rgba(176,38,255,0.25)]",
    wordClassName: "text-4xl font-black text-[#e9d5ff] [text-shadow:_0_0_8px_rgba(176,38,255,0.8)] leading-tight mx-1",
    highlightedWordClassName: "rounded-lg bg-[#7000FF] px-3 py-1 text-4xl font-black text-white [text-shadow:_0_0_8px_rgba(176,38,255,0.8)] leading-tight mx-1",
    remotionContainerStyle: { borderRadius: 14, backgroundColor: "rgba(0,0,0,0.4)", padding: "10px 14px", boxShadow: "0 0 24px rgba(176,38,255,0.25)" },
    remotionWordStyle: { color: "#e9d5ff", fontWeight: 900, margin: "0 5px", textShadow: "0 0 8px rgba(176,38,255,0.8)" },
    remotionHighlightedWordStyle: { color: "#ffffff", backgroundColor: "#7000FF", borderRadius: 10, fontWeight: 900, padding: "4px 12px", margin: "0 5px", textShadow: "0 0 8px rgba(176,38,255,0.8)" },
  },
  {
    key: "fire-red",
    name: "Fire Red",
    description: "Bold red energy for high-impact clips",
    accentClassName: "from-[#4d0000]/80 via-[#cc0000]/70 to-[#ff6b6b]/70 border-[#ff3333]/60",
    cardPreviewClassName: "text-[#ff6b6b]",
    containerClassName: "rounded-xl bg-black/50 px-3 py-2 shadow-[0_0_24px_rgba(255,50,50,0.2)]",
    wordClassName: "text-4xl font-black text-[#ffb3b3] leading-tight mx-1",
    highlightedWordClassName: "rounded-lg bg-[#cc0000] px-3 py-1 text-4xl font-black text-white leading-tight mx-1",
    remotionContainerStyle: { borderRadius: 14, backgroundColor: "rgba(0,0,0,0.5)", padding: "10px 14px", boxShadow: "0 0 24px rgba(255,50,50,0.2)" },
    remotionWordStyle: { color: "#ffb3b3", fontWeight: 900, margin: "0 5px" },
    remotionHighlightedWordStyle: { color: "#ffffff", backgroundColor: "#cc0000", borderRadius: 10, fontWeight: 900, padding: "4px 12px", margin: "0 5px" },
  },
  {
    key: "green-matrix",
    name: "Green Matrix",
    description: "Hacker-style lime green on dark",
    accentClassName: "from-[#001a00]/80 via-[#00aa44]/70 to-[#39ff14]/70 border-[#00ff66]/60",
    cardPreviewClassName: "text-[#39ff14] [text-shadow:_0_0_10px_rgba(57,255,20,0.9)]",
    containerClassName: "rounded-xl bg-black/60 px-3 py-2 shadow-[0_0_24px_rgba(57,255,20,0.2)]",
    wordClassName: "text-4xl font-black text-[#a3ffb0] [text-shadow:_0_0_8px_rgba(57,255,20,0.7)] leading-tight mx-1",
    highlightedWordClassName: "rounded-lg border border-[#39ff14] bg-[#39ff14]/15 px-3 py-1 text-4xl font-black text-[#39ff14] [text-shadow:_0_0_10px_rgba(57,255,20,0.9)] leading-tight mx-1",
    remotionContainerStyle: { borderRadius: 14, backgroundColor: "rgba(0,0,0,0.6)", padding: "10px 14px", boxShadow: "0 0 24px rgba(57,255,20,0.2)" },
    remotionWordStyle: { color: "#a3ffb0", fontWeight: 900, margin: "0 5px", textShadow: "0 0 8px rgba(57,255,20,0.7)" },
    remotionHighlightedWordStyle: { color: "#39ff14", backgroundColor: "rgba(57,255,20,0.15)", border: "2px solid #39ff14", borderRadius: 10, fontWeight: 900, padding: "4px 12px", margin: "0 5px", textShadow: "0 0 10px rgba(57,255,20,0.9)" },
  },
  {
    key: "gold-luxury",
    name: "Gold Luxury",
    description: "Premium gold badge on dark background",
    accentClassName: "from-[#3d2d00]/80 via-[#c9a227]/70 to-[#ffd700]/70 border-[#ffd700]/60",
    cardPreviewClassName: "text-[#ffd700] [text-shadow:_0_0_8px_rgba(255,215,0,0.7)]",
    containerClassName: "rounded-xl bg-[#1a1200]/80 px-3 py-2 border border-[#ffd700]/20",
    wordClassName: "text-4xl font-black text-[#ffe566] leading-tight mx-1",
    highlightedWordClassName: "rounded-lg bg-[#c9a227] px-3 py-1 text-4xl font-black text-black leading-tight mx-1",
    remotionContainerStyle: { borderRadius: 14, backgroundColor: "rgba(26,18,0,0.8)", border: "2px solid rgba(255,215,0,0.2)", padding: "10px 14px" },
    remotionWordStyle: { color: "#ffe566", fontWeight: 900, margin: "0 5px" },
    remotionHighlightedWordStyle: { color: "#000000", backgroundColor: "#c9a227", borderRadius: 10, fontWeight: 900, padding: "4px 12px", margin: "0 5px" },
  },
  {
    key: "pink-pop",
    name: "Pink Pop",
    description: "Bubbly hot pink for trendy content",
    accentClassName: "from-[#4d0026]/80 via-[#e91e8c]/70 to-[#ff80c0]/70 border-[#ff4db8]/60",
    cardPreviewClassName: "text-[#ff80c0]",
    containerClassName: "rounded-xl bg-black/45 px-3 py-2 shadow-[0_0_24px_rgba(233,30,140,0.2)]",
    wordClassName: "text-4xl font-black text-[#ffb3d9] leading-tight mx-1",
    highlightedWordClassName: "rounded-lg bg-[#e91e8c] px-3 py-1 text-4xl font-black text-white leading-tight mx-1",
    remotionContainerStyle: { borderRadius: 14, backgroundColor: "rgba(0,0,0,0.45)", padding: "10px 14px", boxShadow: "0 0 24px rgba(233,30,140,0.2)" },
    remotionWordStyle: { color: "#ffb3d9", fontWeight: 900, margin: "0 5px" },
    remotionHighlightedWordStyle: { color: "#ffffff", backgroundColor: "#e91e8c", borderRadius: 10, fontWeight: 900, padding: "4px 12px", margin: "0 5px" },
  },
  {
    key: "ice-blue",
    name: "Ice Blue",
    description: "Cool frosted glass look",
    accentClassName: "from-[#001833]/80 via-[#0066cc]/70 to-[#99ccff]/70 border-[#66b3ff]/60",
    cardPreviewClassName: "text-[#99ccff]",
    containerClassName: "rounded-xl bg-[#001020]/70 px-3 py-2 border border-[#0066cc]/30 backdrop-blur",
    wordClassName: "text-4xl font-black text-[#cce5ff] leading-tight mx-1",
    highlightedWordClassName: "rounded-lg bg-[#0066cc] px-3 py-1 text-4xl font-black text-white leading-tight mx-1",
    remotionContainerStyle: { borderRadius: 14, backgroundColor: "rgba(0,16,32,0.7)", border: "2px solid rgba(0,102,204,0.3)", padding: "10px 14px" },
    remotionWordStyle: { color: "#cce5ff", fontWeight: 900, margin: "0 5px" },
    remotionHighlightedWordStyle: { color: "#ffffff", backgroundColor: "#0066cc", borderRadius: 10, fontWeight: 900, padding: "4px 12px", margin: "0 5px" },
  },
];

export const CAPTION_FONT_OPTIONS = [
  "Inter, sans-serif",
  "Arial, sans-serif",
  "Poppins, sans-serif",
  "Montserrat, sans-serif",
  "Impact, sans-serif",
  "Bebas Neue, sans-serif",
  "Oswald, sans-serif",
  "Roboto Condensed, sans-serif",
  "Anton, sans-serif",
  "Playfair Display, serif",
];

export const CAPTION_SIZE_OPTIONS = [1, 2, 3, 4, 5];

export function resolveCaptionStyle(styleKey?: string | null): CaptionStyleDefinition {
  return CAPTION_STYLE_PRESETS.find((style) => style.key === styleKey) ?? CAPTION_STYLE_PRESETS[0];
}
