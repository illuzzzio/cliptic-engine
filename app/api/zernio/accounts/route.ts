import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { socialMediaAccounts } from "@/lib/db/schema";
import { eq, and, inArray, sql } from "drizzle-orm";
import crypto from "crypto";

type ZernioAccount = {
  _id?: string;
  id?: string;
  platform?: string;
  username?: string;
  handle?: string;
  displayName?: string;
  name?: string;
  profilePicture?: string;
  profilePicUrl?: string;
  profile_image?: string;
  profileId?: string | { _id?: string; id?: string };
  profile_id?: string | { _id?: string; id?: string };
  profile?: {
    _id?: string;
    id?: string;
  };
};

type ZernioAccountsResponse = {
  accounts?: ZernioAccount[];
  data?: ZernioAccount[];
  results?: ZernioAccount[];
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

function getProfileId(value: ZernioAccount["profileId"]) {
  if (!value) return undefined;
  return typeof value === "string" ? value : value._id || value.id;
}

function hasMappedProfile(account: typeof socialMediaAccounts.$inferSelect) {
  const metadata = account.metadata as { clipticProfileId?: string } | null;
  return Boolean(metadata?.clipticProfileId);
}

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
    const { searchParams } = new URL(req.url);
    const requestedProfileId = searchParams.get("profileId");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "zernio_user_profiles" (
        "user_id" text PRIMARY KEY NOT NULL,
        "profile_id" text NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      )
    `);

    const storedProfiles = await db.execute(sql`
      SELECT profile_id FROM "zernio_user_profiles" WHERE user_id = ${userId} LIMIT 1
    `);
    const storedProfile = storedProfiles.rows[0] as { profile_id: string } | undefined;
    const profileId = storedProfile?.profile_id || requestedProfileId;

    if (!profileId) {
      const allDbAccounts = await db.query.socialMediaAccounts.findMany({
        where: eq(socialMediaAccounts.userId, userId)
      });

      return NextResponse.json({ success: true, accounts: allDbAccounts.filter(hasMappedProfile) });
    }

    if (requestedProfileId && storedProfile && storedProfile.profile_id !== requestedProfileId) {
      return NextResponse.json({ success: true, accounts: [] });
    }

    if (!apiKey) {
      return NextResponse.json({ error: "Zernio API key missing" }, { status: 400 });
    }

    // 1. Fetch connected accounts from this user's Zernio profile only.
    const zernioRes = await fetch(`https://zernio.com/api/v1/accounts?profileId=${encodeURIComponent(profileId)}&includeOverLimit=true`, {
      headers: { "Authorization": `Bearer ${apiKey}` }
    });

    if (!zernioRes.ok) {
      const errText = await zernioRes.text();
      console.error("Failed to fetch Zernio accounts:", errText);
      return NextResponse.json({ error: "Failed to fetch accounts from Zernio" }, { status: zernioRes.status });
    }

    const zernioData = await zernioRes.json();
    const zernioAccountsResponse = zernioData as ZernioAccountsResponse | ZernioAccount[];
    const rawAccounts = Array.isArray(zernioAccountsResponse)
      ? zernioAccountsResponse
      : zernioAccountsResponse.accounts || zernioAccountsResponse.data || zernioAccountsResponse.results || [];
    const accounts = rawAccounts.filter((acc) => {
      const accountProfileId = getProfileId(acc.profileId) || getProfileId(acc.profile_id) || acc.profile?._id || acc.profile?.id;
      return !accountProfileId || accountProfileId === profileId;
    });
    const syncedAccountIds: string[] = [];

    // 2. Sync with local database
    for (const acc of accounts) {
      const platform = acc.platform;
      if (!platform) {
        continue;
      }

      const accountHandle = acc.username || acc.handle || acc._id || "unknown";
      const accountName = acc.displayName || acc.name || acc.username || platform;
      const profilePic = acc.profilePicture || acc.profilePicUrl || acc.profile_image;

      const existing = await db.query.socialMediaAccounts.findFirst({
        where: and(
          eq(socialMediaAccounts.userId, userId),
          eq(socialMediaAccounts.platform, platform),
          eq(socialMediaAccounts.accountHandle, accountHandle)
        )
      });

      if (!existing) {
        // Insert new account
        const id = `acc_${crypto.randomUUID()}`;
        await db.insert(socialMediaAccounts).values({
          id,
          userId,
          platform,
          accountName,
          accountHandle,
          profilePic,
          metadata: { ...acc, clipticProfileId: profileId }
        });
        syncedAccountIds.push(id);
      } else {
        // Update existing
        await db.update(socialMediaAccounts)
          .set({ accountName, profilePic, metadata: { ...acc, clipticProfileId: profileId }, updatedAt: new Date() })
          .where(eq(socialMediaAccounts.id, existing.id));
        syncedAccountIds.push(existing.id);
      }
    }

    const allDbAccounts = syncedAccountIds.length > 0
      ? await db.query.socialMediaAccounts.findMany({
          where: and(
            eq(socialMediaAccounts.userId, userId),
            inArray(socialMediaAccounts.id, syncedAccountIds)
          )
        })
      : [];

    return NextResponse.json({ success: true, profileId, accounts: allDbAccounts });
  } catch (error: unknown) {
    console.error("Zernio Accounts Sync Error Details:", error);
    return NextResponse.json({ 
      error: `Sync Error: ${getErrorMessage(error)}`,
      stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
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
    const metadata = account.metadata as ZernioAccount | null;
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
  } catch (error: unknown) {
    console.error("Error disconnecting account:", error);
    return NextResponse.json({ error: `Failed to disconnect: ${getErrorMessage(error)}` }, { status: 500 });
  }
}
