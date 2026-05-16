"use server";

import { db } from "@/lib/db";
import { generatedShorts } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

export async function getMyVideos() {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  return await db.select()
    .from(generatedShorts)
    .where(
      and(
        eq(generatedShorts.userId, user.id),
        eq(generatedShorts.renderStatus, "completed")
      )
    )
    .orderBy(desc(generatedShorts.createdAt));
}

export async function deleteVideo(shortId: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const [short] = await db.select()
    .from(generatedShorts)
    .where(eq(generatedShorts.id, shortId));

  if (!short) throw new Error("Video not found");
  if (short.userId !== user.id) throw new Error("Unauthorized");

  await db.delete(generatedShorts).where(eq(generatedShorts.id, shortId));
  
  return { success: true };
}
