import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function SyncUser() {
  try {
    const user = await currentUser();
    
    if (!user) {
      return null;
    }

    const email = user.emailAddresses[0]?.emailAddress || user.primaryEmailAddressId || `user_${user.id}@cliptic.internal`;

    // 1. Check if user exists using standard select for better compatibility
    const results = await db.select()
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);
      
    const existingUser = results[0];

    if (existingUser) {
      // 2. Update existing user
      await db.update(users)
        .set({
          firstName: user.firstName ?? "",
          lastName: user.lastName ?? "",
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));
    } else {
      // 3. Insert new user safely
      await db.insert(users).values({
        id: user.id,
        email: email,
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        createdAt: new Date(),
        updatedAt: new Date(),
      }).onConflictDoNothing();
    }
  } catch (error: any) {
    console.error("Critical: Failed to sync user to database.");
    console.error("Error details:", error);
    if (error.stack) console.error("Stack trace:", error.stack);
  }

  return null;
}
