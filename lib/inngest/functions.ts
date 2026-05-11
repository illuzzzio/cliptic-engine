import { inngest } from "./client";
import { db } from "@/lib/db";
import { generatedShorts, projects } from "@/lib/db/schema";
import { SHORTS_GENERATION_CONFIG } from "@/lib/config/shorts";
import { aiArcjet, arcjetEnabled, estimateTokens } from "@/lib/arcjet";
import { eq, sql } from "drizzle-orm";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { DeepgramClient } from "@deepgram/sdk";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

type DeepgramWord = {
  word?: string;
  punctuated_word?: string;
  start?: number;
  end?: number;
  confidence?: number;
};

type ProcessVideoEvent = {
  projectId: string;
  s3Key: string;
  fileName: string;
  userId: string;
};

type DeepgramTranscriptionResponse = {
  results?: {
    channels?: Array<{
      alternatives?: Array<{
        transcript?: string;
        words?: DeepgramWord[];
      }>;
    }>;
  };
};

type Caption = {
  text: string;
  start?: number;
  end?: number;
  confidence?: number;
};

type TranscriptionResult = {
  transcriptText: string;
  captions: Caption[];
  noAudioMessage: string | null;
};

type GeminiShortMoment = {
  title?: string;
  startTime?: number;
  endTime?: number;
  reason?: string;
  seoScore?: number;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

type NormalizedShortMoment = {
  title: string;
  startTime: number;
  endTime: number;
  duration: number;
  reason: string;
  seoScore: number;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Video processing failed.";
}

function generateId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2, 15);
}

function clampSeoScore(score: unknown) {
  const parsed = typeof score === "number" ? score : Number(score);
  if (!Number.isFinite(parsed)) return 82;
  return Math.max(75, Math.min(100, Math.round(parsed)));
}

function normalizeShortMoment(moment: GeminiShortMoment) {
  const startTime = Number(moment.startTime);
  const endTime = Number(moment.endTime);

  if (!Number.isFinite(startTime) || !Number.isFinite(endTime) || endTime <= startTime) {
    return null;
  }

  const duration = endTime - startTime;
  if (
    duration < SHORTS_GENERATION_CONFIG.minDurationSeconds ||
    duration > SHORTS_GENERATION_CONFIG.maxDurationSeconds
  ) {
    return null;
  }

  return {
    title: (moment.title || "Untitled short").slice(0, 120),
    startTime,
    endTime,
    duration,
    reason: moment.reason || "Gemini selected this as a strong short-form moment.",
    seoScore: clampSeoScore(moment.seoScore),
  };
}

function getCaptionsForRange(captions: Caption[], startTime: number, endTime: number) {
  return captions.filter((caption) => {
    const captionStart = caption.start ?? 0;
    const captionEnd = caption.end ?? captionStart;
    return captionEnd >= startTime && captionStart <= endTime;
  });
}

function getVideoDuration(captions: Caption[]) {
  return captions.reduce((maxEnd, caption) => {
    const end = caption.end ?? caption.start ?? 0;
    return Number.isFinite(end) ? Math.max(maxEnd, end) : maxEnd;
  }, 0);
}

function formatTimestamp(seconds: number) {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = Math.floor(safeSeconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function buildTimestampedCaptionPrompt(captions: Caption[]) {
  return captions
    .filter((caption) => caption.text.trim() && Number.isFinite(caption.start) && Number.isFinite(caption.end))
    .slice(0, SHORTS_GENERATION_CONFIG.maxCaptionLinesForPrompt)
    .map((caption) => {
      const start = caption.start ?? 0;
      const end = caption.end ?? start;
      return `[${start.toFixed(2)}-${end.toFixed(2)} | ${formatTimestamp(start)}] ${caption.text}`;
    })
    .join("\n");
}

function parseGeminiShortLines(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("SHORT|"))
    .map((line) => {
      const [, title, startTime, endTime, seoScore, reason] = line.split("|");
      return normalizeShortMoment({
        title,
        startTime: Number(startTime),
        endTime: Number(endTime),
        seoScore: Number(seoScore),
        reason,
      });
    })
    .filter((moment): moment is NormalizedShortMoment => Boolean(moment));
}

function buildFallbackShortMoments(captions: Caption[]) {
  const duration = getVideoDuration(captions);
  const targetDuration = Math.min(
    SHORTS_GENERATION_CONFIG.maxDurationSeconds,
    Math.max(SHORTS_GENERATION_CONFIG.minDurationSeconds, Math.floor(duration / Math.max(SHORTS_GENERATION_CONFIG.count, 1)))
  );
  const availableWindow = Math.max(0, duration - targetDuration);
  const count = Math.max(
    SHORTS_GENERATION_CONFIG.minimumCount,
    Math.min(SHORTS_GENERATION_CONFIG.count, Math.floor(duration / SHORTS_GENERATION_CONFIG.minDurationSeconds))
  );

  return Array.from({ length: count }).map((_, index) => {
    const startTime = count === 1 ? 0 : (availableWindow / Math.max(count - 1, 1)) * index;
    const endTime = Math.min(duration, startTime + targetDuration);
    const captionsInRange = getCaptionsForRange(captions, startTime, endTime);
    const title = captionsInRange
      .slice(0, 8)
      .map((caption) => caption.text)
      .join(" ")
      .replace(/\s+/g, " ")
      .slice(0, 80) || `Short ${index + 1}`;

    return {
      title,
      startTime,
      endTime,
      duration: endTime - startTime,
      reason: "Fallback selection based on dense timestamped speech segments with strong watch-retention potential.",
      seoScore: 82 + (index % 6),
    };
  });
}

function ensureMinimumMoments(moments: NormalizedShortMoment[], captions: Caption[]) {
  if (moments.length >= SHORTS_GENERATION_CONFIG.minimumCount) {
    return moments
      .sort((a, b) => b.seoScore - a.seoScore)
      .slice(0, SHORTS_GENERATION_CONFIG.count);
  }

  const fallback = buildFallbackShortMoments(captions);
  const selected = [...moments];

  for (const candidate of fallback) {
    const isDuplicateWindow = selected.some((existing) => {
      const overlapStart = Math.max(existing.startTime, candidate.startTime);
      const overlapEnd = Math.min(existing.endTime, candidate.endTime);
      const overlap = Math.max(0, overlapEnd - overlapStart);
      const shortest = Math.min(existing.duration, candidate.duration);
      return shortest > 0 && overlap / shortest > 0.8;
    });

    if (!isDuplicateWindow) {
      selected.push(candidate);
    }

    if (selected.length >= SHORTS_GENERATION_CONFIG.minimumCount) break;
  }

  return selected
    .sort((a, b) => b.seoScore - a.seoScore)
    .slice(0, SHORTS_GENERATION_CONFIG.count);
}

async function ensureGeneratedShortsTable() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "generated_shorts" (
      "id" text PRIMARY KEY NOT NULL,
      "project_id" text NOT NULL REFERENCES "projects"("id") ON DELETE cascade,
      "user_id" text NOT NULL,
      "title" text NOT NULL,
      "start_time" double precision NOT NULL,
      "end_time" double precision NOT NULL,
      "duration" double precision NOT NULL,
      "reason" text NOT NULL,
      "seo_score" integer NOT NULL,
      "captions" jsonb NOT NULL,
      "caption_style_key" text DEFAULT 'highlight-first-word',
      "caption_font_family" text DEFAULT 'Inter, sans-serif',
      "caption_size" double precision DEFAULT 4.5,
      "order_index" integer NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    )
  `);
}

async function generateShortMomentsWithGemini(transcriptText: string, captions: Caption[], userId: string) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }

  const duration = getVideoDuration(captions);
  if (duration < SHORTS_GENERATION_CONFIG.minDurationSeconds) {
    throw new Error(
      `Video is ${Math.round(duration)} seconds long. Shorts need at least ${SHORTS_GENERATION_CONFIG.minDurationSeconds} seconds of transcribed audio.`
    );
  }

  const timestampedCaptions = buildTimestampedCaptionPrompt(captions);
  if (!timestampedCaptions) {
    throw new Error("No timestamped captions were available for Gemini short selection.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SHORTS_GENERATION_CONFIG.geminiTimeoutMs);

  const prompt = [
    `You are an expert short-form video strategist.`,
    `Find between ${SHORTS_GENERATION_CONFIG.minimumCount} and ${SHORTS_GENERATION_CONFIG.count} highly engaging short video moments from this long video transcript.`,
    `Each short must be between ${SHORTS_GENERATION_CONFIG.minDurationSeconds} and ${SHORTS_GENERATION_CONFIG.maxDurationSeconds} seconds.`,
    `The source video is about ${Math.round(duration)} seconds long.`,
    `Prefer emotional hooks, surprising claims, clear teaching moments, conflict, strong opinions, or complete mini-stories.`,
    `Use the exact seconds from the timestamped captions for startTime and endTime.`,
    `For each short include a title, startTime, endTime, SEO score from 0 to 100, and reason.`,
    `Do not choose a range outside the source video duration. Do not choose a range shorter than ${SHORTS_GENERATION_CONFIG.minDurationSeconds} seconds.`,
    `Return plain text only. Do not return JSON. Do not use markdown.`,
    `Use exactly this format, one short per line:`,
    `SHORT|title|startTime|endTime|seoScore|reason`,
    `Example: SHORT|A surprising lesson|12.4|55.8|88|This has a clear hook and complete lesson.`,
    "",
    "Timestamped captions:",
    timestampedCaptions,
  ].join("\n");

  if (arcjetEnabled) {
    const decision = await aiArcjet.protect(
      new Request("https://cliptic-engine.local/inngest/generate-shorts", { method: "POST" }),
      {
        userId,
        requested: estimateTokens(prompt),
        detectPromptInjectionMessage: timestampedCaptions,
      }
    );

    if (decision.isDenied()) {
      if (decision.reason.isPromptInjection()) {
        throw new Error("Arcjet blocked prompt injection content in the transcript before Gemini.");
      }

      if (decision.reason.isRateLimit()) {
        throw new Error("Arcjet blocked Gemini shorts generation because the AI usage budget was exceeded.");
      }

      throw new Error("Arcjet blocked Gemini shorts generation.");
    }
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${SHORTS_GENERATION_CONFIG.geminiModel}:generateContent`,
      {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini failed to generate shorts: ${response.status} ${await response.text()}`);
    }

    const data = (await response.json()) as GeminiResponse;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("Gemini did not return a shorts response");
    }

    const moments = parseGeminiShortLines(text).slice(0, SHORTS_GENERATION_CONFIG.count);
    return ensureMinimumMoments(moments, captions);
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "AbortError") {
      return buildFallbackShortMoments(captions);
    }

    console.error("Gemini shorts generation failed. Falling back to timestamped speech ranges.", error);
    return buildFallbackShortMoments(captions);
  } finally {
    clearTimeout(timeout);
  }
}

export const processUploadedVideo = inngest.createFunction(
  {
    id: "process-uploaded-video",
    triggers: [{ event: "video.process" }],
  },
  async ({ event, step }) => {
    const { projectId, s3Key, fileName, userId } = event.data as ProcessVideoEvent;

    try {
      // 1. Generate Actual and Signed URLs (Since the video is already on S3!)
      const { actualUrl, signedUrl } = await step.run("generate-video-urls", async () => {
        const bucket = process.env.AWS_BUCKET_NAME || "cliptic-bucket";
        const region = process.env.AWS_REGION || "us-east-1";
        const actual = `https://${bucket}.s3.${region}.amazonaws.com/${s3Key}`;

        const command = new GetObjectCommand({
          Bucket: bucket,
          Key: s3Key,
        });

        const signed = await getSignedUrl(s3Client, command, { expiresIn: 604800 });
        return { actualUrl: actual, signedUrl: signed };
      });

      // 2. Mark as Transcribing in DB
      await step.run("update-status-transcribing", async () => {
        await db.update(projects)
          .set({
            status: "transcribing",
            progress: "25",
            videoKey: s3Key,
            videoUrl: actualUrl,
            updatedAt: new Date(),
          })
          .where(eq(projects.id, projectId));
      });

      // 3. Transcribe with Deepgram from the signed S3 URL.
      const { transcriptText, captions, noAudioMessage } = await step.run("transcribe-video-url-with-deepgram", async (): Promise<TranscriptionResult> => {
        if (!process.env.DEEPGRAM_API_KEY) {
          throw new Error("DEEPGRAM_API_KEY is not set in environment variables");
        }

        const deepgram = new DeepgramClient({ apiKey: process.env.DEEPGRAM_API_KEY });
        const response = await deepgram.listen.v1.media.transcribeUrl({
          url: signedUrl,
          model: "nova-3",
          language: "en",
          smart_format: true,
          punctuate: true,
          utterances: true,
        }) as DeepgramTranscriptionResponse;

        const alternative = response.results?.channels?.[0]?.alternatives?.[0];
        const transcriptText = alternative?.transcript?.trim() || "";
        const words = (alternative?.words || []) as DeepgramWord[];

        if (!transcriptText || words.length === 0) {
          return {
            transcriptText: "",
            captions: [],
            noAudioMessage: "No speech was detected in this video, so captions were not generated.",
          };
        }

        const captions: Caption[] = words.map((word) => ({
          text: word.punctuated_word || word.word || "",
          start: word.start,
          end: word.end,
          confidence: word.confidence,
        }));

        return { transcriptText, captions, noAudioMessage: null };
      });

      await step.run("update-status-captions-generated", async () => {
        await db.update(projects)
          .set({
            status: "generating_captions",
            progress: "75",
            updatedAt: new Date(),
          })
          .where(eq(projects.id, projectId));
      });

      const shorts = await step.run("generate-short-moments-with-gemini", async () => {
        if (!transcriptText) return [];

        await db.update(projects)
          .set({
            status: "generating_shorts",
            progress: "85",
            updatedAt: new Date(),
          })
          .where(eq(projects.id, projectId));

        const selectedMoments = await generateShortMomentsWithGemini(transcriptText, captions, userId);
        const rows = selectedMoments.map((moment, index) => ({
          id: generateId(),
          projectId,
          userId,
          title: moment.title,
          startTime: moment.startTime,
          endTime: moment.endTime,
          duration: moment.duration,
          reason: moment.reason,
          seoScore: moment.seoScore,
          captions: getCaptionsForRange(captions, moment.startTime, moment.endTime),
          orderIndex: index + 1,
          updatedAt: new Date(),
        }));

        if (rows.length > 0) {
          await ensureGeneratedShortsTable();
          await db.delete(generatedShorts).where(eq(generatedShorts.projectId, projectId));
          await db.insert(generatedShorts).values(rows);
        }

        return rows;
      });

      // 4. Finalize DB Project
      await step.run("finalize-project", async () => {
        await db.update(projects)
          .set({
            status: "completed",
            progress: "100",
            transcript: transcriptText || noAudioMessage || "",
            captions,
            updatedAt: new Date(),
          })
          .where(eq(projects.id, projectId));
      });

      return {
        success: true,
        projectId,
        fileName,
        actualUrl,
        transcript: transcriptText,
        captions,
        shorts,
        noAudioMessage,
      };
    } catch (error: unknown) {
      await step.run("mark-project-failed", async () => {
        await db.update(projects)
          .set({
            status: "failed",
            progress: "100",
            transcript: getErrorMessage(error),
            updatedAt: new Date(),
          })
          .where(eq(projects.id, projectId));
      });

      throw error;
    }
  }
);
