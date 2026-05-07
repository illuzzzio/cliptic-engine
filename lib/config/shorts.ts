function readPositiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value || "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const SHORTS_GENERATION_CONFIG = {
  count: readPositiveInteger(process.env.SHORTS_GENERATION_COUNT, 6),
  minimumCount: readPositiveInteger(process.env.SHORTS_GENERATION_MIN_COUNT, 5),
  minDurationSeconds: 30,
  maxDurationSeconds: 90,
  geminiModel: process.env.GEMINI_MODEL || "gemini-3-flash-preview",
  geminiTimeoutMs: readPositiveInteger(process.env.GEMINI_TIMEOUT_MS, 90000),
  maxCaptionLinesForPrompt: readPositiveInteger(process.env.SHORTS_PROMPT_CAPTION_LINES, 900),
};
