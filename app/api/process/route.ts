import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/lib/inngest/client";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Failed to start processing";
}

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { projectId, s3Key, fileName } = await req.json();
    if (!projectId || !s3Key || !fileName) {
      return NextResponse.json({ error: "Missing processing metadata" }, { status: 400 });
    }

    const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    if (project.userId !== user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await db.update(projects)
      .set({
        status: "queued",
        progress: "5",
        videoKey: s3Key,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId));

    // Trigger Inngest to process the video that was just uploaded to S3
    await inngest.send({
      name: "video.process",
      data: { projectId, s3Key, fileName, userId: user.id }
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Process error:", error);
    return NextResponse.json({ error: "Failed to start processing", details: getErrorMessage(error) }, { status: 500 });
  }
}
