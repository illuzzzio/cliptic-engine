"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

export async function getUserCredits() {
  const user = await currentUser();
  if (!user) return null;

  const [dbUser] = await db.select().from(users).where(eq(users.id, user.id));

  if (!dbUser) return null;

  return {
    credits: dbUser.credits,
    plan: dbUser.plan,
  };
}

export async function deductCredits(amount: number) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const [dbUser] = await db.select().from(users).where(eq(users.id, user.id));
  if (!dbUser) throw new Error("User not found");

  if (dbUser.plan === 'cliptic_pro') {
    return true; // Pro has unlimited credits
  }

  const currentCredits = dbUser.credits ?? 0;
  if (currentCredits < amount) {
    throw new Error("Insufficient credits");
  }

  await db.update(users)
    .set({ 
        credits: Math.max(0, currentCredits - amount),
        updatedAt: new Date()
    })
    .where(eq(users.id, user.id));

  return true;
}
