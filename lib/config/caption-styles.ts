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

export const CAPTION_SIZE_OPTIONS = [4.5, 4, 3, 5, 2, 1];

export function resolveCaptionStyle(styleKey?: string | null): CaptionStyleDefinition {
  return CAPTION_STYLE_PRESETS.find((style) => style.key === styleKey) ?? CAPTION_STYLE_PRESETS[0];
}
