import { inngest } from "./client";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { s3Client, getSignedUrl, GetObjectCommand } from "@/lib/s3";
import { Upload } from "@aws-sdk/lib-storage";
import fs from "fs";
import path from "path";

export const uploadVideoToS3 = inngest.createFunction(
  { id: "upload-video-to-s3", event: "video.process" },
  async ({ event, step }) => {
    const { projectId, s3Key, fileName } = event.data;

    // 1. Mark as processing in DB (AI Analysis Simulation)
    await step.run("update-status-processing", async () => {
      await db.update(projects)
        .set({ status: "processing", progress: "95", updatedAt: new Date() })
        .where(eq(projects.id, projectId));
    });

    // 2. Generate Actual and Signed URLs (Since the video is already on S3!)
    const { actualUrl, signedUrl } = await step.run("generate-urls", async () => {
      const actual = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
      
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME || "cliptic-bucket",
        Key: s3Key,
      });

      // Provide signed URL just in case the bucket is private
      const signed = await getSignedUrl(s3Client, command, { expiresIn: 604800 });
      return { actualUrl: actual, signedUrl: signed };
    });

    // 3. Finalize DB Project
    await step.run("finalize-project", async () => {
      await db.update(projects)
        .set({ 
          status: "completed", 
          progress: "100", 
          videoKey: s3Key,
          videoUrl: actualUrl, // Saving the actual URL to DB
          updatedAt: new Date() 
        })
        .where(eq(projects.id, projectId));
    });

    return { success: true, actualUrl, signedUrl };
  }
);
