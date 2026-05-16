import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { platform, profileId: clientProfileId } = body;
    const apiKey = process.env.ZERNIO_API_KEY || process.env.NEXT_PUBLIC_ZERNIO_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Zernio API key missing from environment variables" }, { status: 400 });
    }

    // Step 1: Get or Create a Profile
    let profileId = clientProfileId || null;
    
    if (!profileId) {
      // First try to list profiles
      try {
        const profilesRes = await fetch("https://zernio.com/api/v1/profiles", {
          headers: { "Authorization": `Bearer ${apiKey}` }
        });
        if (profilesRes.ok) {
          const profilesData = await profilesRes.json();
          if (profilesData.profiles && profilesData.profiles.length > 0) {
            profileId = profilesData.profiles[0]._id;
          } else if (Array.isArray(profilesData) && profilesData.length > 0) {
            profileId = profilesData[0]._id;
          } else if (profilesData.data && profilesData.data.length > 0) {
            profileId = profilesData.data[0]._id;
          }
        }
      } catch (e) {
        console.warn("Error fetching profiles:", e);
      }
    }

    // If no profile exists, create one
    if (!profileId) {
      const createRes = await fetch("https://zernio.com/api/v1/profiles", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${apiKey}`, 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({ 
          name: "Cliptic Engine Profile", 
          description: "Auto-generated for social connections" 
        })
      });
      
      if (!createRes.ok) {
        const errorText = await createRes.text();
        console.error("Failed to create profile:", errorText);
        // We will try to proceed without profileId just in case the endpoint doesn't strictly need it
      } else {
        const createData = await createRes.json();
        profileId = createData.profile?._id || createData._id;
      }
    }

    // If still no profileId, we'll try the request without it just in case Zernio allows a default profile fallback
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const redirectUrl = `${baseUrl}/dashboard/social-connect`;
    const queryParam = profileId 
      ? `?profileId=${profileId}&redirectUrl=${redirectUrl}` 
      : `?redirectUrl=${redirectUrl}`;

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
