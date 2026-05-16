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
        "plan" text DEFAULT 'free',
        "credits" integer DEFAULT 30,
        "last_renewal_at" timestamp DEFAULT now() NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      )
    `);

    // 2. Fetch existing user to check for renewal
    const results = await db.execute(sql`
      SELECT id, plan, credits, last_renewal_at FROM "users" WHERE id = ${user.id} LIMIT 1
    `);
    
    const dbUser = results.rows[0] as { id: string; plan: string; credits: number; last_renewal_at: string } | undefined;

    if (dbUser) {
      // 3. Monthly Renewal Check
      const now = new Date();
      const lastRenewal = new Date(dbUser.last_renewal_at as string);
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      if (lastRenewal < oneMonthAgo) {
        // Renew credits based on plan
        let newCredits = 30;
        if (dbUser.plan === 'cliptic') newCredits = 250;
        if (dbUser.plan === 'cliptic_pro') newCredits = 9999; 

        await db.execute(sql`
          UPDATE "users" 
          SET "credits" = ${newCredits},
              "last_renewal_at" = now(),
              "updated_at" = now()
          WHERE "id" = ${user.id}
        `);
      } else {
        // Simple update
        await db.execute(sql`
          UPDATE "users" 
          SET "first_name" = ${user.firstName ?? ""}, 
              "last_name" = ${user.lastName ?? ""}, 
              "updated_at" = now()
          WHERE "id" = ${user.id}
        `);
      }
    } else {
      // 4. Simple raw insert
      await db.execute(sql`
        INSERT INTO "users" ("id", "email", "first_name", "last_name", "plan", "credits", "last_renewal_at", "created_at", "updated_at")
        VALUES (${user.id}, ${email}, ${user.firstName ?? ""}, ${user.lastName ?? ""}, 'free', 30, now(), now(), now())
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


