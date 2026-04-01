// app/api/analyze/route.ts — Creative Brief Generation Endpoint

import { NextRequest, NextResponse } from "next/server"
import { askClaudeJSON } from "@/lib/claude"
import {
  CREATIVE_BRIEF_SYSTEM_PROMPT,
  CREATIVE_BRIEF_USER_PROMPT,
} from "@/prompts/creative-brief"
import { BrandDNA, CreativeBrief } from "@/lib/types"
import { readFile } from "fs/promises"
import path from "path"

// Demo brief lookup for fallback
const DEMO_BRANDS: Record<string, string> = {
  rivian: "rivian.json",
  subaru: "subaru.json",
  "valley subaru": "subaru.json",
  toyota: "dealer-generic.json",
  "autonation toyota": "dealer-generic.json",
  "autonation toyota tempe": "dealer-generic.json",
}

async function loadDemoBrief(brandName: string): Promise<CreativeBrief | null> {
  const key = brandName.toLowerCase().trim()
  const fileName = DEMO_BRANDS[key]
  if (!fileName) return null

  try {
    const filePath = path.join(process.cwd(), "public", "demo-briefs", fileName)
    const data = JSON.parse(await readFile(filePath, "utf-8"))
    // Build a CreativeBrief from demo data
    const expected = data.expectedBrief || {}
    return {
      brand: expected.brand || brandName,
      product: expected.product || "Campaign",
      tagline: expected.tagline || "Your brand, amplified",
      headline: expected.headline || "Drive What Matters",
      subheadline: expected.subheadline || "AI-powered creative at scale",
      cta: expected.cta || "Learn More",
      platforms: expected.platforms || ["instagram_feed", "facebook_feed"],
      voiceoverScript: `Introducing the ${expected.product || brandName}. ${expected.tagline || "Your next adventure starts here."}`,
      imagePrompt: `Professional automotive advertisement photography of ${expected.product || brandName}, cinematic lighting, high production value`,
    } as CreativeBrief
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { brandDna, campaignDescription } = (await request.json()) as {
      brandDna: BrandDNA
      campaignDescription: string
    }

    if (!brandDna || !campaignDescription) {
      return NextResponse.json(
        { error: "Brand DNA and campaign description are required" },
        { status: 400 }
      )
    }

    // If no API key, fall back to demo brief
    if (!process.env.ANTHROPIC_API_KEY) {
      const demo = await loadDemoBrief(brandDna.name || "")
      if (demo) {
        return NextResponse.json({ brief: demo })
      }
      return NextResponse.json(
        { error: "No API key configured. Try a demo brand: Rivian, Subaru, or Toyota." },
        { status: 503 }
      )
    }

    const brief = await askClaudeJSON<CreativeBrief>(
      CREATIVE_BRIEF_SYSTEM_PROMPT,
      CREATIVE_BRIEF_USER_PROMPT(
        JSON.stringify(brandDna, null, 2),
        campaignDescription
      ),
      { temperature: 0.7 }
    )

    return NextResponse.json({ brief })
  } catch (error) {
    console.error("[analyze] Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
