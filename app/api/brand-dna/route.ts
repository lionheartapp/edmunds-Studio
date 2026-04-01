// app/api/brand-dna/route.ts — Brand DNA Analysis Endpoint

import { NextRequest, NextResponse } from "next/server"
import { askClaudeJSON } from "@/lib/claude"
import { scrapeBrand, buildScraperContext } from "@/lib/scraper"
import {
  BRAND_DNA_SYSTEM_PROMPT,
  BRAND_DNA_USER_PROMPT,
} from "@/prompts/brand-dna"
import { BrandDNA } from "@/lib/types"
import { readFile } from "fs/promises"
import path from "path"

// Allow up to 60s for scraper + Claude
export const maxDuration = 60

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
    const filePath = path.join(
      process.cwd(),
      "public",
      "demo-briefs",
      fileName
    )
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
      return NextResponse.json(
        { error: "Brand name is required" },
        { status: 400 }
      )
    }

    // If no API key, fall back to demo briefs
    if (!process.env.ANTHROPIC_API_KEY) {
      const demo = await loadDemoBrief(brandName)
      if (demo) {
        return NextResponse.json({ brandDna: demo })
      }
      return NextResponse.json(
        {
          error:
            "No API key configured. Try a demo brand: Rivian, Subaru, or Toyota.",
        },
        { status: 503 }
      )
    }

    // Step 1: Run the scraper to get live web intelligence
    let scraperContext = ""
    try {
      const scraperResult = await scrapeBrand(brandName)
      scraperContext = buildScraperContext(scraperResult)

      // If scraper got strong enough data on its own (colors + fonts),
      // merge it as overrides later
      if (scraperResult.raw.colors && scraperResult.raw.typography) {
        console.log(
          `[brand-dna] Scraper found colors + fonts for ${brandName}`
        )
      }
    } catch (error) {
      console.log(
        `[brand-dna] Scraper failed, continuing with Claude only:`,
        error
      )
    }

    // Step 2: Ask Claude for full Brand DNA analysis, enriched with scraper context
    // Retry up to 2 times on failure
    let lastError = ""
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        console.log(`[brand-dna] Claude attempt ${attempt + 1} for: ${brandName}`)
        const profile = await askClaudeJSON<BrandDNA>(
          BRAND_DNA_SYSTEM_PROMPT,
          BRAND_DNA_USER_PROMPT(brandName, scraperContext),
          { temperature: 0.5 }
        )

        console.log(`[brand-dna] Success for: ${brandName}`)
        return NextResponse.json({ brandDna: profile })
      } catch (claudeError) {
        lastError = claudeError instanceof Error ? claudeError.message : String(claudeError)
        console.error(`[brand-dna] Claude attempt ${attempt + 1} failed:`, lastError)
        // Wait a beat before retry
        if (attempt < 1) await new Promise(r => setTimeout(r, 1000))
      }
    }

    // Fall back to demo brief if Claude fails
    const demo = await loadDemoBrief(brandName)
    if (demo) {
      console.log("[brand-dna] Falling back to demo brief for:", brandName)
      return NextResponse.json({ brandDna: demo })
    }
    return NextResponse.json(
      { error: `Failed to analyze brand: ${lastError}` },
      { status: 500 }
    )
  } catch (error) {
    console.error("[brand-dna] Error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
