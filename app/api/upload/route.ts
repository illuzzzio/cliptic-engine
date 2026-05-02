import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { inngest } from "@/lib/inngest/client";
import fs from "fs";
import path from "path";
import os from "os";

// Generate a random string ID
const generateId = () => Math.random().toString(36).substring(2, 15);

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const projectId = generateId();
    
    // Save to temp disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Use os.tmpdir() to avoid issues with missing /tmp on windows
    const tempFilePath = path.join(os.tmpdir(), `${projectId}-${file.name}`);
    fs.writeFileSync(tempFilePath, buffer);

    // Create DB Record
    await db.insert(projects).values({
      id: projectId,
      userId: user.id,
      title: file.name,
      status: "uploading",
      progress: "0",
    });

    // Trigger Inngest
    await inngest.send({
      name: "video.process",
      data: {
        projectId,
        filePath: tempFilePath,
        fileName: file.name,
        mimeType: file.type,
      },
    });

    return NextResponse.json({ success: true, projectId });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
