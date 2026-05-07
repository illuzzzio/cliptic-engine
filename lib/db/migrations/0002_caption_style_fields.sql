ALTER TABLE "generated_shorts"
ADD COLUMN IF NOT EXISTS "caption_style_key" text DEFAULT 'highlight-first-word';

ALTER TABLE "generated_shorts"
ADD COLUMN IF NOT EXISTS "caption_font_family" text DEFAULT 'Inter, sans-serif';
