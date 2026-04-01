// app/api/publish/route.ts — Social Publishing Endpoint

import { NextRequest, NextResponse } from "next/server"
import { publishToAllPlatforms } from "@/lib/social"
import { Platform, ScheduleSlot } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const { slots, assets } = (await request.json()) as {
      slots: ScheduleSlot[]
      assets: Record<Platform, string>
    }

    if (!slots?.length || !assets) {
      return NextResponse.json(
        { error: "Schedule slots and assets are required" },
        { status: 400 }
      )
    }

    // If no social API keys configured, return simulated success
    if (!process.env.META_APP_SECRET && !process.env.TIKTOK_CLIENT_SECRET) {
      const demoResults = slots.map((slot) => ({
        platform: slot.platform,
        scheduledFor: slot.scheduledAt,
        status: "demo" as const,
        message: "Simulated — connect Meta/TikTok APIs to publish for real",
        postId: `demo_${slot.platform}_${Date.now()}`,
      }))
      return NextResponse.json({ results: demoResults, status: "demo" })
    }

    const tokens = {
      meta: process.env.META_APP_SECRET ? "mock_token" : undefined,
      tiktok: process.env.TIKTOK_CLIENT_SECRET ? "mock_token" : undefined,
    }

    const results = await publishToAllPlatforms(slots, assets, tokens)

    return NextResponse.json(results)
  } catch (error) {
    console.error("[publish] Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
