// app/api/test-claude/route.ts — Diagnostic endpoint to test AI connectivity
import { NextResponse } from "next/server"
import { askAI, isAIConfigured } from "@/lib/ai"

export const maxDuration = 30

export async function GET() {
  const configured = isAIConfigured()
  const keyPrefix = (process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY)?.substring(0, 10) || "NOT SET"

  if (!configured) {
    return NextResponse.json({
      status: "error",
      message: "No AI API key set. Add GOOGLE_GEMINI_API_KEY to environment variables.",
      keyPrefix,
    })
  }

  try {
    const response = await askAI(
      "You are a helpful assistant.",
      "Say hello in 5 words",
      { maxTokens: 50 }
    )

    return NextResponse.json({
      status: "ok",
      provider: "gemini",
      message: response,
      keyPrefix,
    })
  } catch (error) {
    return NextResponse.json({
      status: "error",
      provider: "gemini",
      keyPrefix,
      name: error instanceof Error ? error.name : "unknown",
      message: error instanceof Error ? error.message : String(error),
    }, { status: 500 })
  }
}
