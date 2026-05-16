import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function SyncUser() {
  try {
    const user = await currentUser();
    
    if (!user) {
      return null;
    }

    const email = user.emailAddresses[0]?.emailAddress || user.primaryEmailAddressId || `user_${user.id}@cliptic.internal`;

    // 1. Ensure table exists (as a safety measure)
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" text PRIMARY KEY NOT NULL,
        "email" text NOT NULL UNIQUE,
        "first_name" text,
        "last_name" text,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      )
    `);

    // 2. Simple raw select
    const results = await db.execute(sql`
      SELECT id FROM "users" WHERE id = ${user.id} LIMIT 1
    `);
    
    const exists = results.rows.length > 0;

    if (exists) {
      // 3. Simple raw update
      await db.execute(sql`
        UPDATE "users" 
        SET "first_name" = ${user.firstName ?? ""}, 
            "last_name" = ${user.lastName ?? ""}, 
            "updated_at" = now()
        WHERE "id" = ${user.id}
      `);
    } else {
      // 4. Simple raw insert
      await db.execute(sql`
        INSERT INTO "users" ("id", "email", "first_name", "last_name", "created_at", "updated_at")
        VALUES (${user.id}, ${email}, ${user.firstName ?? ""}, ${user.lastName ?? ""}, now(), now())
        ON CONFLICT ("id") DO NOTHING
      `);
    }
  } catch (error: any) {
    console.error("CRITICAL ERROR: SyncUser failed.");
    console.error("Message:", error.message);
    // Don't stringify the whole error as it might be circular
    console.error("Stack Trace:", error.stack);
  }

  return null;
}


