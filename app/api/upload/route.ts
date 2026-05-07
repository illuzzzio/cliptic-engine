import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { s3Client, PutObjectCommand, getSignedUrl } from "@/lib/s3";
import { arcjetDeniedResponse, arcjetEnabled, uploadArcjet } from "@/lib/arcjet";
import { and, eq, gte } from "drizzle-orm";

const generateId = () => Math.random().toString(36).substring(2, 15);

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Failed to generate upload URL";
}

function startOfUtcDay() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (arcjetEnabled) {
      const decision = await uploadArcjet.protect(req, { userId: user.id });
      if (decision.isDenied()) {
        return arcjetDeniedResponse(decision);
      }
    }

    const body = await req.json();
    const { fileName, fileType } = body;

    if (!fileName || !fileType) {
      return NextResponse.json({ error: "Missing file metadata" }, { status: 400 });
    }

    const projectId = generateId();
    const s3Key = `projects/${projectId}/${Date.now()}-${fileName.replace(/\s+/g, '-')}`;

    // Generate Presigned Upload URL (Valid for 1 hour)
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME || "cliptic-bucket",
      Key: s3Key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    // Create DB Record
    await db.insert(projects).values({
      id: projectId,
      userId: user.id,
      title: fileName,
      status: "uploading",
      progress: "0",
    });

    return NextResponse.json({ success: true, projectId, uploadUrl, s3Key });

  } catch (error: unknown) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to generate upload URL", details: getErrorMessage(error) }, { status: 500 });
  }
}
