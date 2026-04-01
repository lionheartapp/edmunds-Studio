// app/api/figma/route.ts — Figma Frame Generation Endpoint

import { NextRequest, NextResponse } from "next/server"
import { createFigmaFrames } from "@/lib/figma"
import { CreativeBrief, PLATFORM_DIMENSIONS } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const { brief, heroImageUrl } = (await request.json()) as {
      brief: CreativeBrief
      heroImageUrl: string
    }

    if (!brief || !heroImageUrl) {
      return NextResponse.json(
        { error: "Brief and hero image URL are required" },
        { status: 400 }
      )
    }

    // If no Figma token, return demo frame specs
    if (!process.env.FIGMA_ACCESS_TOKEN) {
      const platforms = brief.platforms || ["instagram_feed"]
      const frames = platforms.map((p) => {
        const dims = PLATFORM_DIMENSIONS[p] || { width: 1080, height: 1080, label: p }
        return {
          platform: p,
          width: dims.width,
          height: dims.height,
          label: dims.label,
          figmaUrl: null,
          status: "demo",
        }
      })
      return NextResponse.json({ frames, status: "demo" })
    }

    const result = await createFigmaFrames(brief, heroImageUrl)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[figma] Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
