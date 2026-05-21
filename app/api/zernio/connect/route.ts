import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { platform } = body;
    const apiKey = process.env.ZERNIO_API_KEY || process.env.NEXT_PUBLIC_ZERNIO_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Zernio API key missing from environment variables" }, { status: 400 });
    }

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

    // Step 1: Get or create a profile for this user.
    let profileId = storedProfile?.profile_id || null;

    if (!profileId) {
      const createRes = await fetch("https://zernio.com/api/v1/profiles", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${apiKey}`, 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({ 
          name: `Cliptic Engine Profile - ${userId}`,
          description: "Auto-generated for this Cliptic user"
        })
      });
      
      if (!createRes.ok) {
        const errorText = await createRes.text();
        console.error("Failed to create profile:", errorText);
        // We will try to proceed without profileId just in case the endpoint doesn't strictly need it
      } else {
        const createData = await createRes.json();
        profileId = createData.profileId || createData.profile?._id || createData.profile?.id || createData.data?._id || createData.data?.id || createData._id || createData.id;
        if (profileId) {
          await db.execute(sql`
            INSERT INTO "zernio_user_profiles" ("user_id", "profile_id", "created_at", "updated_at")
            VALUES (${userId}, ${profileId}, now(), now())
            ON CONFLICT ("user_id")
            DO UPDATE SET "profile_id" = EXCLUDED."profile_id", "updated_at" = now()
          `);
        }
      }
    }

    // If still no profileId, we'll try the request without it just in case Zernio allows a default profile fallback
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const redirectUrl = `${baseUrl}/dashboard/social-connect`;
    const encodedRedirectUrl = encodeURIComponent(redirectUrl);
    const queryParam = profileId 
      ? `?profileId=${encodeURIComponent(profileId)}&redirect_url=${encodedRedirectUrl}`
      : `?redirect_url=${encodedRedirectUrl}`;

    // Step 2: Get the connection URL for the specified platform
    const connectRes = await fetch(`https://zernio.com/api/v1/connect/${platform}${queryParam}`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${apiKey}` }
    });

    if (!connectRes.ok) {
      const errText = await connectRes.text();
      console.error(`Failed to get connect URL for ${platform}:`, errText);
      return NextResponse.json({ 
        error: `Zernio Error: ${errText}` 
      }, { status: connectRes.status });
    }

    const connectData = await connectRes.json();
    const authUrl = connectData.authUrl || connectData.auth_url || connectData.url;

    if (!authUrl) {
      return NextResponse.json({ error: "Zernio API did not return an authUrl. Response: " + JSON.stringify(connectData) }, { status: 500 });
    }

    // Step 3: Return the authUrl and profileId to the frontend
    return NextResponse.json({ 
      success: true, 
      url: authUrl,
      profileId
    });
  } catch (error) {
    console.error("Zernio Connect Error:", error);
    return NextResponse.json({ error: "Failed to communicate with Zernio API" }, { status: 500 });
  }
}
