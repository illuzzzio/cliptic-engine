"use server";

import { db } from "@/lib/db";
import { feedbacks } from "@/lib/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { desc, gte, eq } from "drizzle-orm";

export async function submitFeedback(rating: number, comment: string) {
  const user = await currentUser();
  if (!user) {
    throw new Error("You must be logged in to leave feedback.");
  }

  // Check if user already has a feedback to ensure "shows only one time"
  const [existing] = await db.select().from(feedbacks).where(eq(feedbacks.userId, user.id));

  if (existing) {
    await db.update(feedbacks)
      .set({ 
        rating, 
        comment, 
        userName: user.firstName || "Anonymous",
        createdAt: new Date() 
      })
      .where(eq(feedbacks.userId, user.id));
  } else {
    const id = `fb_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    await db.insert(feedbacks).values({
      id,
      userId: user.id,
      userName: user.firstName || "Anonymous",
      rating,
      comment,
    });
  }

  return { success: true };
}

export async function getTopFeedbacks() {
  const data = await db.select()
    .from(feedbacks)
    .where(gte(feedbacks.rating, 4))
    .orderBy(desc(feedbacks.createdAt))
    .limit(30);

  return data;
}
