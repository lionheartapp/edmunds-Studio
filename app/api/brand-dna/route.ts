// app/api/brand-dna/route.ts — Brand DNA Analysis Endpoint

import { NextRequest, NextResponse } from "next/server"
import { askAIJSON, isAIConfigured } from "@/lib/ai"
import { scrapeBrand, buildScraperContext } from "@/lib/scraper"
import {
  BRAND_DNA_SYSTEM_PROMPT,
  BRAND_DNA_USER_PROMPT,
} from "@/prompts/brand-dna"
import { BrandDNA } from "@/lib/types"
import { readFile } from "fs/promises"
import path from "path"
import {
  fetchBrand,
  isBrandfetchConfigured,
  getBestLogoUrl,
  getFullLogoUrl,
  extractColors,
  extractFonts,
  BrandfetchResult,
} from "@/lib/brandfetch"

// Allow up to 60s for scraper + AI
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
    if (!isAIConfigured()) {
      const demo = await loadDemoBrief(brandName)
      if (demo) {
        return NextResponse.json({ brandDna: demo })
      }
      return NextResponse.json(
        {
          error:
            "No AI API key configured. Set GOOGLE_GEMINI_API_KEY in environment variables. Try a demo brand: Rivian, Subaru, or Toyota.",
        },
        { status: 503 }
      )
    }

    // Step 1: Run scraper + Brandfetch in parallel (with timeouts)
    let scraperContext = ""

    // Helper: race a promise against a timeout
    const withTimeout = <T>(promise: Promise<T>, ms: number, label: string): Promise<T | null> =>
      Promise.race([
        promise,
        new Promise<null>((resolve) => setTimeout(() => {
          console.log(`[brand-dna] ${label} timed out after ${ms}ms`)
          resolve(null)
        }, ms)),
      ])

    const [scraperSettled, bfSettled] = await Promise.allSettled([
      withTimeout(
        scrapeBrand(brandName).then(result => {
          scraperContext = buildScraperContext(result)
          return result
        }),
        15000, // 15s max for scraper
        "Scraper"
      ),
      isBrandfetchConfigured()
        ? withTimeout(fetchBrand(brandName), 8000, "Brandfetch")
        : Promise.resolve(null),
    ])

    if (scraperSettled.status === "rejected") {
      console.log(`[brand-dna] Scraper failed:`, scraperSettled.reason)
    }
    if (bfSettled.status === "rejected") {
      console.log(`[brand-dna] Brandfetch failed:`, bfSettled.reason)
    }

    // Extract Brandfetch data if available
    const brandfetchData: BrandfetchResult | null =
      bfSettled.status === "fulfilled" ? bfSettled.value : null

    if (brandfetchData) {
      console.log(`[brand-dna] Brandfetch: ${brandfetchData.logos?.length || 0} logos, ${brandfetchData.colors?.length || 0} colors, ${brandfetchData.fonts?.length || 0} fonts`)
    } else {
      console.log(`[brand-dna] Brandfetch: no data available`)
    }

    console.log(`[brand-dna] Scraper context length: ${scraperContext.length} chars`)

    // Step 2: Ask AI for full Brand DNA analysis, enriched with scraper context
    // Retry up to 2 times on failure
    let lastError = ""
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        console.log(`[brand-dna] AI attempt ${attempt + 1} for: ${brandName}`)
        const profile = await askAIJSON<BrandDNA>(
          BRAND_DNA_SYSTEM_PROMPT,
          BRAND_DNA_USER_PROMPT(brandName, scraperContext),
          { temperature: 0.5 }
        )

        // Step 3: Override AI-generated colors/fonts/logos with Brandfetch data
        // Brandfetch is authoritative for visual identity
        if (brandfetchData) {
          const bfColors = extractColors(brandfetchData)
          const bfFonts = extractFonts(brandfetchData)
          const logoUrl = getBestLogoUrl(brandfetchData)
          const fullLogoUrl = getFullLogoUrl(brandfetchData)

          // Override colors with real brand colors
          if (brandfetchData.colors && brandfetchData.colors.length > 0) {
            profile.colors = bfColors
            console.log(`[brand-dna] Overriding colors with Brandfetch: ${JSON.stringify(bfColors)}`)
          }

          // Override fonts with real brand fonts
          if (brandfetchData.fonts && brandfetchData.fonts.length > 0) {
            profile.typography = bfFonts
            console.log(`[brand-dna] Overriding fonts with Brandfetch: ${bfFonts.primaryFont}`)
          }

          // Add real logos
          if (logoUrl) {
            profile.logoUrl = logoUrl
            console.log(`[brand-dna] Logo URL: ${logoUrl}`)
          }
          if (fullLogoUrl) {
            profile.fullLogoUrl = fullLogoUrl
          }

          // Add description if AI didn't provide one
          if (brandfetchData.description && !profile.description) {
            profile.description = brandfetchData.description
          }

          // Ensure domain is correct
          if (brandfetchData.domain) {
            profile.domain = brandfetchData.domain
          }
        }

        console.log(`[brand-dna] Success for: ${brandName}`)
        return NextResponse.json({ brandDna: profile })
      } catch (aiError) {
        lastError = aiError instanceof Error ? aiError.message : String(aiError)
        console.error(`[brand-dna] AI attempt ${attempt + 1} failed:`, lastError)
        if (attempt < 1) await new Promise(r => setTimeout(r, 1000))
      }
    }

    // Fall back to demo brief if AI fails (still apply Brandfetch if available)
    const demo = await loadDemoBrief(brandName)
    if (demo) {
      console.log("[brand-dna] Falling back to demo brief for:", brandName)
      if (brandfetchData) {
        const bfColors = extractColors(brandfetchData)
        const logoUrl = getBestLogoUrl(brandfetchData)
        const fullLogoUrl = getFullLogoUrl(brandfetchData)
        if (brandfetchData.colors.length > 0) demo.colors = bfColors
        if (logoUrl) demo.logoUrl = logoUrl
        if (fullLogoUrl) demo.fullLogoUrl = fullLogoUrl
      }
      return NextResponse.json({ brandDna: demo })
    }
    return NextResponse.json(
      { error: `Failed to analyze brand: ${lastError}` },
      { status: 500 }
    )
  } catch (error) {
    console.error("[brand-dna] Unhandled error:", error instanceof Error ? error.message : error)
    console.error("[brand-dna] Stack:", error instanceof Error ? error.stack : "no stack")
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : "Unknown"}` },
      { status: 500 }
    )
  }
}
