"use server";

import { db } from "@/lib/db";
import { generatedShorts, projects } from "@/lib/db/schema";
import { GetObjectCommand, getSignedUrl, s3Client } from "@/lib/s3";
import { asc, eq, sql } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

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
    })();
  }
  await ensuredCaptionColumnsPromise;
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
