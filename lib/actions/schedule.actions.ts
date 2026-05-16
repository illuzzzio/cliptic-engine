"use server";

import { db } from "@/lib/db";
import { generatedShorts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import type { VideoClip, SocialAccount, ScheduledPost } from "@/lib/types/schedule";

export async function getExportedVideos(): Promise<VideoClip[]> {
  const user = await currentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const videos = await db
      .select({
        id: generatedShorts.id,
        title: generatedShorts.title,
        duration: generatedShorts.duration,
        seoScore: generatedShorts.seoScore,
        exportUrl: generatedShorts.exportUrl,
        renderStatus: generatedShorts.renderStatus,
      })
      .from(generatedShorts)
      .where(
        eq(generatedShorts.userId, user.id)
      );

    // Filter only completed exports
    return videos.filter((v) => v.exportUrl && v.renderStatus === "completed");
  } catch (error) {
    console.error("Error fetching videos:", error);
    throw new Error("Failed to fetch videos");
  }
}

export async function getSocialAccounts(): Promise<SocialAccount[]> {
  const user = await currentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    // TODO: Implement after adding social_media_accounts table
    // For now return empty array
    return [];
  } catch (error) {
    console.error("Error fetching social accounts:", error);
    throw new Error("Failed to fetch social accounts");
  }
}

export async function schedulePost(input: {
  shortId: string;
  socialAccountId: string;
  scheduledDate: Date;
}): Promise<ScheduledPost> {
  const user = await currentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    // TODO: Implement after adding scheduled_posts table
    // Insert scheduled post record
    return {
      id: "",
      userId: user.id,
      shortId: input.shortId,
      socialAccountId: input.socialAccountId,
      scheduledDate: input.scheduledDate,
      status: "scheduled",
    };
  } catch (error) {
    console.error("Error scheduling post:", error);
    throw new Error("Failed to schedule post");
  }
}
