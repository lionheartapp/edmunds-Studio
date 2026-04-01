// app/api/brand-dna/route.ts — Brand DNA Analysis Endpoint

import { NextRequest, NextResponse } from "next/server"
import { askClaudeJSON } from "@/lib/claude"
import { scrapeBrand } from "@/lib/scraper"
import { BRAND_DNA_SYSTEM_PROMPT, BRAND_DNA_USER_PROMPT } from "@/prompts/brand-dna"
import { BrandDNA } from "@/lib/types"
import { readFile } from "fs/promises"
import path from "path"

// Demo brief lookup for fallback when API keys aren't configured
const DEMO_BRANDS: Record<string, string> = {
  rivian: "rivian.json",
  subaru: "subaru.json",
  "valley subaru": "subaru.json",
  toyota: "dealer-generic.json",
  "autonation toyota": "dealer-generic.json",
  "autonation toyota tempe": "dealer-generic.json",
}

async function loadDemoBrief(brandName: string): Promise<BrandDNA | null> {
  const key = brandName.toLowerCase().trim()
  const fileName = DEMO_BRANDS[key]
  if (!fileName) return null

  try {
    const filePath = path.join(process.cwd(), "public", "demo-briefs", fileName)
    const data = JSON.parse(await readFile(filePath, "utf-8"))
    return data.brandDna as BrandDNA
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { brandName } = await request.json()

    if (!brandName) {
      return NextResponse.json({ error: "Brand name is required" }, { status: 400 })
    }

    // If no API key, fall back to demo briefs
    if (!process.env.ANTHROPIC_API_KEY) {
      const demo = await loadDemoBrief(brandName)
      if (demo) {
        return NextResponse.json({ brandDna: demo })
      }
      return NextResponse.json(
        { error: `No API key configured. Try a demo brand: Rivian, Subaru, or Toyota.` },
        { status: 503 }
      )
    }

    // Run scraper in parallel with Claude analysis
    const [scraperData, claudeProfile] = await Promise.allSettled([
      scrapeBrand(brandName),
      askClaudeJSON<BrandDNA>(
        BRAND_DNA_SYSTEM_PROMPT,
        BRAND_DNA_USER_PROMPT(brandName),
        { temperature: 0.5 }
      ),
    ])

    // Claude's analysis is the primary source
    const profile =
      claudeProfile.status === "fulfilled" ? claudeProfile.value : null

    if (!profile) {
      // Fall back to demo brief if Claude fails
      const demo = await loadDemoBrief(brandName)
      if (demo) {
        return NextResponse.json({ brandDna: demo })
      }
      return NextResponse.json(
        { error: "Failed to analyze brand" },
        { status: 500 }
      )
    }

    // Merge scraper data where available (scraper overrides Claude for live data)
    const scraped = scraperData.status === "fulfilled" ? scraperData.value : {}
    const merged: BrandDNA = {
      ...profile,
      ...scraped,
      colors: scraped.colors || profile.colors,
      typography: scraped.typography || profile.typography,
      voice: profile.voice,
      visualStyle: profile.visualStyle,
      currentAds: scraped.currentAds?.length
        ? scraped.currentAds
        : profile.currentAds,
      competitors: profile.competitors,
    }

    return NextResponse.json({ brandDna: merged })
  } catch (error) {
    console.error("[brand-dna] Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
