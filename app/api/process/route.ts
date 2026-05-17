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

function isInngestConfigured() {
  if (process.env.INNGEST_DEV === "1") return true;

  return Boolean(
    process.env.INNGEST_EVENT_KEY?.trim() &&
      process.env.INNGEST_SIGNING_KEY?.trim()
  );
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

    if (!isInngestConfigured()) {
      return NextResponse.json(
        {
          error: "Inngest is not configured",
          details: "Set INNGEST_EVENT_KEY and INNGEST_SIGNING_KEY in production, or INNGEST_DEV=1 locally.",
        },
        { status: 500 }
      );
    }

    // 7️⃣ Update project status to "queued", but leave progress 0 for now
    await db.update(projects)
      .set({
        status: "queued",
        progress: "5",
        videoKey: s3Key,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, projectId));

    // 8️⃣ Trigger Inngest asynchronously
    try {
      await inngest.send({
        name: "video.process",
        data: { projectId, s3Key, fileName, userId: user.id },
      });
    } catch (err) {
      const message = getErrorMessage(err);
      console.error("Inngest trigger failed:", { projectId, error: message });

      await db.update(projects)
        .set({
          status: "failed",
          progress: "100",
          transcript: `Failed to queue video processing: ${message}`,
          updatedAt: new Date(),
        })
        .where(eq(projects.id, projectId));

      return NextResponse.json(
        { error: "Failed to queue video processing", details: message },
        { status: 502 }
      );
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
