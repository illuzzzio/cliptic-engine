import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/lib/inngest/client";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { aiArcjet, arcjetDeniedResponse, arcjetEnabled, estimateTokens } from "@/lib/arcjet";
import { eq } from "drizzle-orm";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Failed to start processing";
}

import { users } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { projectId, s3Key, fileName } = await req.json();
    if (!projectId || !s3Key || !fileName) {
      return NextResponse.json({ error: "Missing processing metadata" }, { status: 400 });
    }

    // 1. Fetch user from DB to check credits
    const [dbUser] = await db.select().from(users).where(eq(users.id, user.id));
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const CREDIT_COST = 10;
    const isFreePlan = dbUser.plan === "free";
    const hasInsufficientCredits = dbUser.credits < CREDIT_COST && dbUser.plan !== "cliptic_pro";

    // 2. Arcjet Protection & Trial Restriction
    if (arcjetEnabled) {
      // If free plan and no credits, trigger a denial
      if (isFreePlan && hasInsufficientCredits) {
        return NextResponse.json({ 
          error: "Trial Exhausted", 
          message: "You have used your 3 free Cliptic trials. Upgrade to the Cliptic Plan to continue creating viral content!" 
        }, { status: 403 });
      }

      const decision = await aiArcjet.protect(req, {
        userId: user.id,
        requested: estimateTokens(`${fileName} ${s3Key}`),
        detectPromptInjectionMessage: fileName,
      });

      if (decision.isDenied()) {
        return arcjetDeniedResponse(decision);
      }
    }

    // Double check credits if arcjet didn't catch it
    if (hasInsufficientCredits) {
      return NextResponse.json({ 
        error: "Insufficient Credits", 
        message: "You don't have enough Cliptic credits. Please upgrade or wait for your monthly renewal." 
      }, { status: 403 });
    }

    const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    if (project.userId !== user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 3. Deduct Credits (unless Pro)
    if (dbUser.plan !== "cliptic_pro") {
      await db.update(users)
        .set({ 
          credits: Math.max(0, dbUser.credits - CREDIT_COST),
          updatedAt: new Date()
        })
        .where(eq(users.id, user.id));
    }

    await db.update(projects)
      .set({
        status: "queued",
        progress: "5",
        videoKey: s3Key,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId));

    // Trigger Inngest to process the video in Cliptic Cloud
    await inngest.send({
      name: "video.process",
      data: { projectId, s3Key, fileName, userId: user.id }
    });

    return NextResponse.json({ success: true, remainingCredits: dbUser.plan === "cliptic_pro" ? "Unlimited" : dbUser.credits - CREDIT_COST });
  } catch (error: unknown) {
    console.error("Cliptic Process error:", error);
    return NextResponse.json({ error: "Failed to start Cliptic processing", details: getErrorMessage(error) }, { status: 500 });
  }
}
