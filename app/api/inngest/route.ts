import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { processUploadedVideo, renderShortClipVideo } from "@/lib/inngest/functions";

// Expose the Inngest API
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    processUploadedVideo,
    renderShortClipVideo,
  ],
});
