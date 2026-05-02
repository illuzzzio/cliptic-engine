import { inngest } from "./client";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { s3Client, PutObjectCommand, getSignedUrl, GetObjectCommand } from "@/lib/s3";
import fs from "fs";
import path from "path";

export const uploadVideoToS3 = inngest.createFunction(
  { id: "upload-video-to-s3", event: "video.process" },
  async ({ event, step }) => {
    const { projectId, filePath, fileName, mimeType } = event.data;

    // 1. Mark as processing in DB
    await step.run("update-status-processing", async () => {
      await db.update(projects)
        .set({ status: "processing", progress: "10", updatedAt: new Date() })
        .where(eq(projects.id, projectId));
    });

    // 2. Read file from disk
    const fileBuffer = await step.run("read-local-file", async () => {
      // In a real app, you'd stream this to S3 instead of reading into memory,
      // but for this implementation we'll read it to buffer.
      return fs.readFileSync(filePath);
    });

    // 3. Upload to AWS S3
    const s3Key = `projects/${projectId}/${Date.now()}-${fileName.replace(/\s+/g, '-')}`;
    
    await step.run("upload-to-s3", async () => {
      // Update progress to 40% before uploading
      await db.update(projects)
        .set({ progress: "40", updatedAt: new Date() })
        .where(eq(projects.id, projectId));

      const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME || "cliptic-bucket",
        Key: s3Key,
        Body: Buffer.from(fileBuffer),
        ContentType: mimeType,
      });

      await s3Client.send(command);
    });

    // 4. Generate Signed URL
    const signedUrl = await step.run("generate-signed-url", async () => {
      await db.update(projects)
        .set({ progress: "80", updatedAt: new Date() })
        .where(eq(projects.id, projectId));

      const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME || "cliptic-bucket",
        Key: s3Key,
      });

      // Signed URL valid for 7 days
      return await getSignedUrl(s3Client, command, { expiresIn: 604800 });
    });

    // 5. Finalize DB Project
    await step.run("finalize-project", async () => {
      await db.update(projects)
        .set({ 
          status: "completed", 
          progress: "100", 
          videoKey: s3Key,
          videoUrl: signedUrl,
          updatedAt: new Date() 
        })
        .where(eq(projects.id, projectId));
        
      // Clean up local temp file
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.error("Could not delete temp file", e);
      }
    });

    return { success: true, signedUrl };
  }
);
