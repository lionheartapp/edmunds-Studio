// app/api/afterfx/route.ts — After Effects Script Generation Endpoint

import { NextRequest, NextResponse } from "next/server"
import { generateAEScript } from "@/lib/aftereffects"
import { CreativeBrief, Platform } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const { brief, platform, heroImagePath } = (await request.json()) as {
      brief: CreativeBrief
      platform: Platform
      heroImagePath?: string
    }

    if (!brief || !platform) {
      return NextResponse.json(
        { error: "Brief and platform are required" },
        { status: 400 }
      )
    }

    const script = generateAEScript(
      brief,
      platform,
      heroImagePath || "/path/to/hero.png"
    )

    return NextResponse.json({ script, platform })
  } catch (error) {
    console.error("[afterfx] Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
