import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;
export const dynamic = "force-dynamic";

import { isLlmConfigured, type LlmAssistSource } from "@/lib/llm-chat";

function detectProvider(): Exclude<LlmAssistSource, "rules"> | null {
  if (process.env.GROQ_API_KEY?.trim()) return "groq";
  if (process.env.OPENAI_API_KEY?.trim()) return "openai";
  return null;
}

export async function GET() {
  const provider = detectProvider();
  return NextResponse.json({
    configured: isLlmConfigured(),
    provider,
  });
}
