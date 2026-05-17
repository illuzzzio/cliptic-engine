import { NextRequest, NextResponse } from "next/server";
import { inngest } from "@/lib/inngest/client";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { projects, users } from "@/lib/db/schema";
import { aiArcjet, arcjetDeniedResponse, arcjetEnabled, estimateTokens } from "@/lib/arcjet";
import { eq } from "drizzle-orm";

// Force Node.js runtime and dynamic route
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export async function POST(req: NextRequest) {
  try {
    // 1️⃣ Clerk user fetch
    const user = await currentUser();
    if (!user) {
      console.error("Clerk: SyncUser failed - user not found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ Parse JSON safely
    let body;
    try {
      body = await req.json();
    } catch (err) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { projectId, s3Key, fileName } = body;
    if (!projectId || !s3Key || !fileName) {
      return NextResponse.json({ error: "Missing processing metadata" }, { status: 400 });
    }

    // 3️⃣ Fetch DB user
    const [dbUser] = await db.select().from(users).where(eq(users.id, user.id));
    if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const CREDIT_COST = 10;
    const isFreePlan = dbUser.plan === "free";
    const userCredits = dbUser.credits ?? 0;
    const hasInsufficientCredits = userCredits < CREDIT_COST && dbUser.plan !== "cliptic_pro";

    // 4️⃣ Arcjet & trial protection
    if (arcjetEnabled) {
      if (isFreePlan && hasInsufficientCredits) {
        return NextResponse.json(
          {
            error: "Trial Exhausted",
            message:
              "You have used your 3 free Cliptic trials. Upgrade to the Cliptic Plan to continue creating viral content!",
          },
          { status: 403 }
        );
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

    if (hasInsufficientCredits) {
      return NextResponse.json(
        {
          error: "Insufficient Credits",
          message: "You don't have enough Cliptic credits. Please upgrade or wait for your monthly renewal.",
        },
        { status: 403 }
      );
    }

    // 5️⃣ Fetch project and check ownership
    const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    if (project.userId !== user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 6️⃣ Deduct credits if not Pro
    if (dbUser.plan !== "cliptic_pro") {
      await db.update(users)
        .set({
          credits: Math.max(0, (dbUser.credits ?? 0) - CREDIT_COST),
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));
    }

    // 7️⃣ Update project status to "queued" and progress to 5% immediately (before Inngest)
    await db.update(projects)
      .set({
        status: "queued",
        progress: "5", // Start at 5% immediately to show user something is happening
        videoKey: s3Key,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId));
    console.log("📊 Project initialized with status=queued, progress=5%", { projectId });

    // 8️⃣ Trigger Inngest asynchronously
    try {
      const result = await inngest.send({
        name: "video.process",
        data: { projectId, s3Key, fileName, userId: user.id },
      });
      console.log("✅ Inngest job triggered successfully:", { projectId, eventId: result.ids?.[0] });
    } catch (err) {
      console.error("❌ Inngest trigger failed:", { projectId, error: getErrorMessage(err) });
      // Update to error state since we couldn't queue the job
      await db.update(projects)
        .set({
          status: "failed",
          progress: "100",
          transcript: `Failed to queue video processing: ${getErrorMessage(err)}`,
          updatedAt: new Date(),
        })
        .where(eq(projects.id, projectId));
    }

    return NextResponse.json({
      success: true,
      remainingCredits: dbUser.plan === "cliptic_pro" ? "Unlimited" : (dbUser.credits ?? 0) - CREDIT_COST,
    });
  } catch (error: unknown) {
    console.error("Cliptic Process error:", error);
    return NextResponse.json(
      { error: "Failed to start Cliptic processing", details: getErrorMessage(error) },
      { status: 500 }
    );
  }
}