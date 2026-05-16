import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, socialMediaAccounts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Self-healing: Ensure the table exists
    try {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS social_media_accounts (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          platform TEXT NOT NULL,
          account_name TEXT NOT NULL,
          account_handle TEXT,
          profile_pic TEXT,
          connected_at TIMESTAMP DEFAULT NOW() NOT NULL,
          access_token TEXT,
          refresh_token TEXT,
          expires_at TIMESTAMP,
          metadata JSONB,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
          UNIQUE(user_id, platform, account_handle)
        )
      `);
    } catch (e) {
      console.warn("Table initialization warning:", e);
    }

    const apiKey = process.env.ZERNIO_API_KEY || process.env.NEXT_PUBLIC_ZERNIO_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Zernio API key missing" }, { status: 400 });
    }

    // 1. Fetch connected accounts from Zernio
    const zernioRes = await fetch("https://zernio.com/api/v1/accounts", {
      headers: { "Authorization": `Bearer ${apiKey}` }
    });

    if (!zernioRes.ok) {
      const errText = await zernioRes.text();
      console.error("Failed to fetch Zernio accounts:", errText);
      return NextResponse.json({ error: "Failed to fetch accounts from Zernio" }, { status: zernioRes.status });
    }

    const zernioData = await zernioRes.json();
    console.log("Zernio Accounts Sync Logic - Response:", JSON.stringify(zernioData, null, 2));
    const accounts = zernioData.accounts || [];

    // 2. Sync with local database
    for (const acc of accounts) {
      const platform = acc.platform;
      const accountHandle = acc.username || acc.handle || acc._id || "unknown";
      const accountName = acc.displayName || acc.name || acc.username || platform;
      const profilePic = acc.profilePicture || acc.profilePicUrl || acc.profile_image;

      console.log(`Syncing account: ${accountName} (${platform})`);

      // Check if it exists
      const existing = await db.query.socialMediaAccounts.findFirst({
        where: and(
          eq(socialMediaAccounts.userId, userId),
          eq(socialMediaAccounts.platform, platform),
          eq(socialMediaAccounts.accountHandle, accountHandle)
        )
      });

      if (!existing) {
        // Insert new account
        await db.insert(socialMediaAccounts).values({
          id: `acc_${crypto.randomUUID()}`,
          userId,
          platform,
          accountName,
          accountHandle,
          profilePic,
          metadata: acc
        });
      } else {
        // Update existing
        await db.update(socialMediaAccounts)
          .set({ accountName, profilePic, metadata: acc, updatedAt: new Date() })
          .where(eq(socialMediaAccounts.id, existing.id));
      }
    }

    // Optionally: fetch all accounts for this user from DB to return
    const allDbAccounts = await db.query.socialMediaAccounts.findMany({
      where: eq(socialMediaAccounts.userId, userId)
    });

    return NextResponse.json({ success: true, accounts: allDbAccounts });
  } catch (error: any) {
    console.error("Zernio Accounts Sync Error Details:", error);
    return NextResponse.json({ 
      error: `Sync Error: ${error.message || "Unknown error"}`,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("accountId");
    
    if (!accountId) {
      return NextResponse.json({ error: "Missing accountId" }, { status: 400 });
    }

    // 1. Get the account from our DB to find the Zernio ID
    const account = await db.query.socialMediaAccounts.findFirst({
      where: and(
        eq(socialMediaAccounts.id, accountId),
        eq(socialMediaAccounts.userId, userId)
      )
    });

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // 2. Disconnect from Zernio API
    const apiKey = process.env.ZERNIO_API_KEY || process.env.NEXT_PUBLIC_ZERNIO_API_KEY;
    const metadata = account.metadata as any;
    const zernioAccountId = metadata?._id;

    if (zernioAccountId && apiKey) {
      try {
        const zernioRes = await fetch(`https://zernio.com/api/v1/accounts/${zernioAccountId}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${apiKey}` }
        });
        
        if (!zernioRes.ok) {
          console.warn("Failed to disconnect from Zernio API:", await zernioRes.text());
          // We continue to delete from our DB anyway to keep the UI clean
        }
      } catch (e) {
        console.error("Error calling Zernio DELETE:", e);
      }
    }

    // 3. Delete from our local DB
    await db.delete(socialMediaAccounts)
      .where(eq(socialMediaAccounts.id, accountId));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error disconnecting account:", error);
    return NextResponse.json({ error: `Failed to disconnect: ${error.message}` }, { status: 500 });
  }
}
