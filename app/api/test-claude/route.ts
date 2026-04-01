// app/api/test-claude/route.ts — Diagnostic endpoint to test Claude connectivity
import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"

export const maxDuration = 30

export async function GET() {
  const hasKey = !!process.env.ANTHROPIC_API_KEY
  const keyPrefix = process.env.ANTHROPIC_API_KEY?.substring(0, 10) || "NOT SET"

  if (!hasKey) {
    return NextResponse.json({
      status: "error",
      message: "ANTHROPIC_API_KEY is not set",
      keyPrefix,
    })
  }

  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 50,
      messages: [{ role: "user", content: "Say hello in 5 words" }],
    })

    const text = response.content.find((b) => b.type === "text")
    return NextResponse.json({
      status: "ok",
      model: response.model,
      message: text?.type === "text" ? text.text : "no text",
      keyPrefix,
    })
  } catch (error) {
    const errObj: Record<string, unknown> = {
      status: "error",
      keyPrefix,
      name: error instanceof Error ? error.name : "unknown",
      message: error instanceof Error ? error.message : String(error),
    }

    // Anthropic SDK errors have extra fields
    if (error && typeof error === "object") {
      const e = error as Record<string, unknown>
      if (e.status) errObj.httpStatus = e.status
      if (e.error) errObj.apiError = e.error
      if (e.type) errObj.type = e.type
    }

    return NextResponse.json(errObj, { status: 500 })
  }
}
