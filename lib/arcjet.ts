import arcjet, { detectBot, detectPromptInjection, fixedWindow, shield, tokenBucket } from "@arcjet/next";
import { NextResponse } from "next/server";

export const arcjetEnabled = Boolean(process.env.ARCJET_KEY);

const key = process.env.ARCJET_KEY || "ajkey_missing";

export const uploadArcjet = arcjet({
  key,
  characteristics: ["userId"],
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({ mode: "LIVE", allow: [] }),
    fixedWindow({
      mode: "LIVE",
      characteristics: ["userId"],
      window: "1d",
      max: 2,
    }),
  ],
});

export const aiArcjet = arcjet({
  key,
  characteristics: ["userId"],
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({ mode: "LIVE", allow: [] }),
    tokenBucket({
      mode: "LIVE",
      characteristics: ["userId"],
      refillRate: 10_000,
      interval: "1d",
      capacity: 20_000,
    }),
    detectPromptInjection({ mode: "LIVE" }),
  ],
});

export function estimateTokens(text: string) {
  return Math.max(1, Math.ceil(text.length / 4));
}

export function arcjetDeniedResponse(decision: Awaited<ReturnType<typeof uploadArcjet.protect>>) {
  if (decision.reason.isRateLimit()) {
    return NextResponse.json(
      { error: "Daily limit reached", details: "You can upload only 2 videos per day. Please try again tomorrow." },
      { status: 429 }
    );
  }

  if (decision.reason.isBot()) {
    return NextResponse.json({ error: "Automated clients are not permitted" }, { status: 403 });
  }

  if (decision.reason.isPromptInjection()) {
    return NextResponse.json({ error: "Prompt injection detected" }, { status: 400 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
