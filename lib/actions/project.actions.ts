"use server";

import { db } from "@/lib/db";
import { generatedShorts, projects } from "@/lib/db/schema";
import { GetObjectCommand, getSignedUrl, s3Client } from "@/lib/s3";
import { inngest } from "@/lib/inngest/client";
import { asc, eq, sql } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { deleteRender, getRenderProgress, renderMediaOnLambda, type AwsRegion } from "@remotion/lambda-client";
import {
  DEFAULT_CAPTION_FONT_FAMILY,
  DEFAULT_CAPTION_SIZE,
  DEFAULT_CAPTION_STYLE_KEY,
} from "@/lib/config/caption-styles";

let ensuredCaptionColumnsPromise: Promise<void> | null = null;

async function ensureGeneratedShortsCaptionColumns() {
  if (!ensuredCaptionColumnsPromise) {
    ensuredCaptionColumnsPromise = (async () => {
      await db.execute(
        sql`ALTER TABLE "generated_shorts" ADD COLUMN IF NOT EXISTS "caption_style_key" text DEFAULT 'highlight-first-word'`
      );
      await db.execute(
        sql`ALTER TABLE "generated_shorts" ADD COLUMN IF NOT EXISTS "caption_font_family" text DEFAULT 'Inter, sans-serif'`
      );
      await db.execute(
        sql`ALTER TABLE "generated_shorts" ADD COLUMN IF NOT EXISTS "caption_size" double precision DEFAULT 4.5`
      );
      await db.execute(sql`ALTER TABLE "generated_shorts" ADD COLUMN IF NOT EXISTS "export_url" text`);
      await db.execute(sql`ALTER TABLE "generated_shorts" ADD COLUMN IF NOT EXISTS "render_id" text`);
      await db.execute(sql`ALTER TABLE "generated_shorts" ADD COLUMN IF NOT EXISTS "render_bucket_name" text`);
      await db.execute(sql`ALTER TABLE "generated_shorts" ADD COLUMN IF NOT EXISTS "render_status" text DEFAULT 'idle'`);
      await db.execute(sql`ALTER TABLE "generated_shorts" ADD COLUMN IF NOT EXISTS "render_progress" double precision DEFAULT 0`);
    })();
  }
  await ensuredCaptionColumnsPromise;
}

function getRenderStatusLabel(status?: string | null) {
  switch (status) {
    case "queued":
      return "Queued for rendering";
    case "rendering":
      return "Rendering video";
    case "completed":
      return "Render complete";
    case "failed":
      return "Render failed";
    case "canceled":
      return "Render canceled";
    default:
      return "Ready to render";
  }
}

function getRemotionRegion() {
  return (process.env.REMOTION_AWS_REGION || process.env.AWS_REGION || "us-east-1") as AwsRegion;
}

function getRemotionLambdaConfig() {
  const region = getRemotionRegion();
  const functionName = process.env.REMOTION_LAMBDA_FUNCTION_NAME;
  const serveUrl = process.env.REMOTION_SERVE_URL || process.env.REMOTION_SITE_URL;
  const bucketName = process.env.REMOTION_BUCKET_NAME;

  if (!functionName) {
    throw new Error("REMOTION_LAMBDA_FUNCTION_NAME is not set in environment variables");
  }

  if (!serveUrl) {
    throw new Error("REMOTION_SERVE_URL or REMOTION_SITE_URL is not set in environment variables");
  }

  return { region, functionName, serveUrl, bucketName };
}

function getShortClipDurationInFrames(clip: { startTime: number; endTime: number }, fps = 30) {
  return Math.max(1, Math.floor((clip.endTime - clip.startTime) * fps));
}

export async function getProjectStatus(projectId: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");
  await ensureGeneratedShortsCaptionColumns();

  const result = await db.select().from(projects).where(eq(projects.id, projectId));
  
  if (!result.length) {
    throw new Error("Project not found");
  }

  const project = result[0];
  
  // Ensure user owns this project
  if (project.userId !== user.id) {
    throw new Error("Unauthorized");
  }

  const shorts = await db.select()
    .from(generatedShorts)
    .where(eq(generatedShorts.projectId, projectId))
    .orderBy(asc(generatedShorts.orderIndex));

  return {
    id: project.id,
    title: project.title,
    status: project.status,
    progress: parseInt(project.progress),
    videoUrl: project.videoUrl,
    transcript: project.transcript,
    captions: project.captions,
    shorts,
  };
}

export async function getProjectPlaybackUrl(projectId: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
  if (!project) throw new Error("Project not found");
  if (project.userId !== user.id) throw new Error("Unauthorized");
  if (!project.videoKey) throw new Error("Video is not ready for playback");

  return getSignedUrl(
    s3Client,
    new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME || "cliptic-bucket",
      Key: project.videoKey,
    }),
    { expiresIn: 1800 }
  );
}

export async function updateShortCaptionStyle(input: {
  shortId: string;
  captionStyleKey: string;
  captionFontFamily: string;
  captionSize: number;
}) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");
  await ensureGeneratedShortsCaptionColumns();

  const [short] = await db.select().from(generatedShorts).where(eq(generatedShorts.id, input.shortId));
  if (!short) throw new Error("Short clip not found");
  if (short.userId !== user.id) throw new Error("Unauthorized");

  await db
    .update(generatedShorts)
    .set({
      captionStyleKey: input.captionStyleKey,
      captionFontFamily: input.captionFontFamily,
      captionSize: input.captionSize,
      ...(short.captionStyleKey !== input.captionStyleKey ||
      short.captionFontFamily !== input.captionFontFamily ||
      Number(short.captionSize ?? 0) !== input.captionSize
        ? {
            exportUrl: null,
            renderId: null,
            renderBucketName: null,
            renderStatus: "idle",
            renderProgress: 0,
          }
        : {}),
      updatedAt: new Date(),
    })
    .where(eq(generatedShorts.id, input.shortId));

  return {
    shortId: input.shortId,
    captionStyleKey: input.captionStyleKey,
    captionFontFamily: input.captionFontFamily,
    captionSize: input.captionSize,
  };
}

export async function startShortClipDownload(shortId: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");
  await ensureGeneratedShortsCaptionColumns();

  const [short] = await db.select().from(generatedShorts).where(eq(generatedShorts.id, shortId));
  if (!short) throw new Error("Short clip not found");
  if (short.userId !== user.id) throw new Error("Unauthorized");

  if (short.exportUrl && short.renderStatus === "completed") {
    return {
      status: "completed",
      progress: 100,
      exportUrl: short.exportUrl,
      message: "Download is ready",
    };
  }

  if (short.renderStatus === "queued" || short.renderStatus === "rendering") {
    return {
      status: short.renderStatus,
      progress: Math.round(Number(short.renderProgress ?? 0)),
      exportUrl: null,
      message: getRenderStatusLabel(short.renderStatus),
    };
  }

  const [project] = await db.select().from(projects).where(eq(projects.id, short.projectId));
  if (!project) throw new Error("Project not found");
  if (project.userId !== user.id) throw new Error("Unauthorized");
  if (!project.videoKey) throw new Error("Source video is not ready for rendering");

  await db
    .update(generatedShorts)
    .set({
      exportUrl: null,
      renderId: null,
      renderBucketName: null,
      renderStatus: "rendering",
      renderProgress: 3,
      updatedAt: new Date(),
    })
    .where(eq(generatedShorts.id, shortId));

  const { region, functionName, serveUrl, bucketName } = getRemotionLambdaConfig();
  const signedVideoUrl = await getSignedUrl(
    s3Client,
    new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME || "cliptic-bucket",
      Key: project.videoKey,
    }),
    { expiresIn: 604800 }
  );
  const output = await renderMediaOnLambda({
    region,
    functionName,
    serveUrl,
    composition: "ShortClip",
    codec: "h264",
    imageFormat: "jpeg",
    forceBucketName: bucketName,
    privacy: "public",
    framesPerLambda: 60,
    forceDurationInFrames: getShortClipDurationInFrames(short, 30),
    audioCodec: "aac",
    muted: false,
    outName: `short-renders/${short.id}-${Date.now()}.mp4`,
    inputProps: {
      videoUrl: signedVideoUrl,
      clip: {
        id: short.id,
        projectId: short.projectId,
        title: short.title,
        startTime: short.startTime,
        endTime: short.endTime,
        duration: short.duration,
        captions: short.captions,
        captionStyleKey: short.captionStyleKey ?? DEFAULT_CAPTION_STYLE_KEY,
        captionFontFamily: short.captionFontFamily ?? DEFAULT_CAPTION_FONT_FAMILY,
        captionSize: short.captionSize ?? DEFAULT_CAPTION_SIZE,
      },
      captionStyleKey: short.captionStyleKey ?? DEFAULT_CAPTION_STYLE_KEY,
      captionFontFamily: short.captionFontFamily ?? DEFAULT_CAPTION_FONT_FAMILY,
      captionSize: short.captionSize ?? DEFAULT_CAPTION_SIZE,
    },
  });

  await db
    .update(generatedShorts)
    .set({
      renderId: output.renderId,
      renderBucketName: output.bucketName,
      renderStatus: "rendering",
      renderProgress: 8,
      updatedAt: new Date(),
    })
    .where(eq(generatedShorts.id, shortId));

  await inngest.send({
    name: "short.render",
    data: {
      shortId,
      userId: user.id,
    },
  });

  return {
    status: "rendering",
    progress: 8,
    exportUrl: null,
    message: "Rendering video",
  };
}

export async function getShortClipRenderStatus(shortId: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");
  await ensureGeneratedShortsCaptionColumns();

  const [short] = await db.select().from(generatedShorts).where(eq(generatedShorts.id, shortId));
  if (!short) throw new Error("Short clip not found");
  if (short.userId !== user.id) throw new Error("Unauthorized");

  if (short.renderStatus === "rendering" && short.renderId && short.renderBucketName) {
    try {
      const { region, functionName } = getRemotionLambdaConfig();
      const progress = await getRenderProgress({
        region,
        functionName,
        bucketName: short.renderBucketName,
        renderId: short.renderId,
      });
      const nextProgress = progress.done ? 100 : Math.max(8, Math.min(99, Math.round(progress.overallProgress * 100)));
      const nextStatus = progress.fatalErrorEncountered ? "failed" : progress.done ? "completed" : "rendering";
      const nextExportUrl = progress.done ? progress.outputFile : short.exportUrl;

      await db
        .update(generatedShorts)
        .set({
          renderStatus: nextStatus,
          renderProgress: nextProgress,
          exportUrl: nextExportUrl,
          updatedAt: new Date(),
        })
        .where(eq(generatedShorts.id, shortId));

      return {
        shortId: short.id,
        status: nextStatus,
        progress: nextProgress,
        exportUrl: nextExportUrl,
        message: getRenderStatusLabel(nextStatus),
      };
    } catch (error) {
      console.warn("Could not refresh Remotion render progress", error);
    }
  }

  return {
    shortId: short.id,
    status: short.renderStatus ?? "idle",
    progress: Math.round(Number(short.renderProgress ?? 0)),
    exportUrl: short.exportUrl,
    message: getRenderStatusLabel(short.renderStatus),
  };
}

export async function cancelShortClipRender(shortId: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");
  await ensureGeneratedShortsCaptionColumns();

  const [short] = await db.select().from(generatedShorts).where(eq(generatedShorts.id, shortId));
  if (!short) throw new Error("Short clip not found");
  if (short.userId !== user.id) throw new Error("Unauthorized");

  const canDeleteRender = short.renderId && short.renderBucketName && short.renderStatus !== "completed";

  if (canDeleteRender) {
    try {
      await deleteRender({
        region: getRemotionRegion(),
        bucketName: short.renderBucketName!,
        renderId: short.renderId!,
      });
    } catch (error) {
      console.warn("Could not delete Remotion render during cancel", error);
    }
  }

  await db
    .update(generatedShorts)
    .set({
      exportUrl: null,
      renderId: null,
      renderBucketName: null,
      renderStatus: "canceled",
      renderProgress: 0,
      updatedAt: new Date(),
    })
    .where(eq(generatedShorts.id, shortId));

  return {
    shortId,
    status: "canceled",
    progress: 0,
    exportUrl: null,
    message: "Render canceled",
  };
}
