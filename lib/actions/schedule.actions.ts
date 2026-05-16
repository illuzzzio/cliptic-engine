"use server";

import { db } from "@/lib/db";
import { scheduledPosts, generatedShorts, socialMediaAccounts } from "@/lib/db/schema";
import { eq, and, between, sql } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import crypto from "crypto";

export async function getScheduledPosts(startDate: Date, endDate: Date) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  // Self-healing table check
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "scheduled_posts" (
      "id" text PRIMARY KEY NOT NULL,
      "user_id" text NOT NULL,
      "short_id" text NOT NULL,
      "social_account_id" text NOT NULL,
      "scheduled_date" timestamp NOT NULL,
      "status" text DEFAULT 'scheduled' NOT NULL,
      "posted_at" timestamp,
      "post_url" text,
      "error_message" text,
      "metadata" jsonb,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    )
  `);

  return await db.select({
    id: scheduledPosts.id,
    scheduledDate: scheduledPosts.scheduledDate,
    status: scheduledPosts.status,
    errorMessage: scheduledPosts.errorMessage,
    platform: socialMediaAccounts.platform,
    accountName: socialMediaAccounts.accountName,
    shortTitle: generatedShorts.title,
    exportUrl: generatedShorts.exportUrl,
  })
  .from(scheduledPosts)
  .leftJoin(socialMediaAccounts, eq(scheduledPosts.socialAccountId, socialMediaAccounts.id))
  .leftJoin(generatedShorts, eq(scheduledPosts.shortId, generatedShorts.id))
  .where(
    and(
      eq(scheduledPosts.userId, user.id),
      between(scheduledPosts.scheduledDate, startDate, endDate)
    )
  );
}

import { inngest } from "@/lib/inngest/client";

export async function schedulePost(data: {
  shortId: string;
  socialAccountIds: string[]; // Support multiple accounts
  scheduledDate: Date;
  metadata?: any;
}) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const results = [];

  for (const socialAccountId of data.socialAccountIds) {
    const id = `sched_${crypto.randomUUID()}`;

    await db.insert(scheduledPosts).values({
      id,
      userId: user.id,
      shortId: data.shortId,
      socialAccountId: socialAccountId,
      scheduledDate: data.scheduledDate,
      status: "scheduled",
      metadata: data.metadata || {},
    });

    // Send to Inngest to handle background waiting and posting
    await inngest.send({
      name: "social.post.publish",
      data: {
        scheduledPostId: id,
        userId: user.id,
      },
    });

    results.push(id);
  }

  return { ids: results };
}

import { revalidatePath } from "next/cache";

export async function cancelScheduledPost(scheduledPostId: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  // Check ownership
  const [post] = await db.select().from(scheduledPosts).where(eq(scheduledPosts.id, scheduledPostId));
  if (!post) throw new Error("Post not found");
  if (post.userId !== user.id) throw new Error("Unauthorized");

  // Delete from DB
  await db.delete(scheduledPosts).where(eq(scheduledPosts.id, scheduledPostId));
  
  revalidatePath("/dashboard/schedule");
  return { success: true };
}

export async function generateAIContent(shortId: string, userTitle?: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const [short] = await db.select().from(generatedShorts).where(eq(generatedShorts.id, shortId));
  if (!short) throw new Error("Short not found");

  const prompt = `
    You are a social media expert. Generate a highly engaging caption and hashtags for a short-form video.
    User provided Title: ${userTitle || short.title}
    Original Short Reason: ${short.reason}
    
    Return the response in this exact JSON format:
    {
      "title": "A catchy viral title",
      "caption": "The main engagement-focused caption with emojis",
      "hashtags": ["list", "of", "relevant", "hashtags"]
    }
  `;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY!,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) throw new Error("Gemini AI failed");
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Generation Error:", error);
    return {
      title: short.title,
      caption: `Check out this viral moment! #viral #cliptic`,
      hashtags: ["viral", "cliptic", "shorts"],
    };
  }
}
