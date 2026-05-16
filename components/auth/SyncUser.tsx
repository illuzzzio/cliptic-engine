import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export async function SyncUser() {
  try {
    const user = await currentUser();
    
    if (!user) {
      return null;
    }

    const email = user.emailAddresses[0]?.emailAddress ?? "";

    // Using onConflictDoUpdate but handling potential unique constraint failures on email
    await db.insert(users).values({
      id: user.id,
      email: email,
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      updatedAt: new Date(),
    }).onConflictDoUpdate({
      target: users.id,
      set: {
        email: email,
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        updatedAt: new Date(),
      }
    });
  } catch (error: any) {
    console.error("Failed to sync user to database:", error.message || error);
    // Silent fail so we don't break the app if there's a constraint issue
  }

  return null;
}
