import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/lib/inngest/client";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { projectId, s3Key, fileName } = await req.json();

    // Trigger Inngest to process the video that was just uploaded to S3
    await inngest.send({
      name: "video.process",
      data: { projectId, s3Key, fileName }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Process error:", error);
    return NextResponse.json({ error: "Failed to start processing", details: error.message }, { status: 500 });
  }
}
