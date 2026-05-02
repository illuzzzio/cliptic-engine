import { inngest } from "./client";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { DeepgramClient } from "@deepgram/sdk";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const uploadVideoToS3 = inngest.createFunction(
  { id: "upload-video-to-s3", event: "video.process" },
  async ({ event, step }) => {
    const { projectId, s3Key, fileName } = event.data;

    // 1. Generate Actual and Signed URLs (Since the video is already on S3!)
    const { actualUrl, signedUrl } = await step.run("generate-urls", async () => {
      const actual = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
      
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME || "cliptic-bucket",
        Key: s3Key,
      });

      const signed = await getSignedUrl(s3Client, command, { expiresIn: 604800 });
      return { actualUrl: actual, signedUrl: signed };
    });

    // 2. Mark as Transcribing in DB
    await step.run("update-status-transcribing", async () => {
      await db.update(projects)
        .set({ status: "transcribing", progress: "10", videoKey: s3Key, videoUrl: actualUrl, updatedAt: new Date() })
        .where(eq(projects.id, projectId));
    });

    // 3. Transcribe with Deepgram
    const { transcriptText, captions } = await step.run("transcribe-with-deepgram", async () => {
      if (!process.env.DEEPGRAM_API_KEY) {
        throw new Error("DEEPGRAM_API_KEY is not set in environment variables");
      }

      const deepgram = new DeepgramClient({ apiKey: process.env.DEEPGRAM_API_KEY });
      
      const response = await deepgram.listen.prerecorded.transcribeUrl(
        { url: signedUrl },
        { smart_format: true, model: "nova-2", language: "en", utterances: true }
      );
      
      // Extract transcript and words
      const transcriptText = response?.results?.channels[0]?.alternatives[0]?.transcript || "";
      const captions = response?.results?.channels[0]?.alternatives[0]?.words || [];

      return { transcriptText, captions };
    });

    // 4. Finalize DB Project
    await step.run("finalize-project", async () => {
      await db.update(projects)
        .set({ 
          status: "completed", 
          progress: "100", 
          transcript: transcriptText,
          captions: captions,
          updatedAt: new Date() 
        })
        .where(eq(projects.id, projectId));
    });

    return { success: true, actualUrl, signedUrl, transcript: transcriptText };
  }
);
