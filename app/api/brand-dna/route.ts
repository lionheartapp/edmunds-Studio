// app/api/brand-dna/route.ts — Brand DNA Analysis Endpoint
// FAST: Runs scraper, Brandfetch, and AI all in parallel

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

export const maxDuration = 60

// ─── Demo Briefs ────────────────────────────────────────────

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

// ─── Helpers ────────────────────────────────────────────────

/** Race a promise against a timeout — returns null on timeout */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) =>
      setTimeout(() => {
        console.log(`[brand-dna] ${label} timed out after ${ms}ms`)
        resolve(null)
      }, ms)
    ),
  ])
}

/** Apply Brandfetch overrides to a BrandDNA profile */
function applyBrandfetch(profile: BrandDNA, bf: BrandfetchResult): BrandDNA {
  const result = { ...profile }

  if (bf.colors && bf.colors.length > 0) {
    result.colors = extractColors(bf)
  }
  if (bf.fonts && bf.fonts.length > 0) {
    result.typography = extractFonts(bf)
  }

  const logoUrl = getBestLogoUrl(bf)
  const fullLogoUrl = getFullLogoUrl(bf)
  if (logoUrl) result.logoUrl = logoUrl
  if (fullLogoUrl) result.fullLogoUrl = fullLogoUrl
  if (bf.description && !result.description) result.description = bf.description
  if (bf.domain) result.domain = bf.domain

  return result
}

// ─── Main Handler ───────────────────────────────────────────

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const { brandName } = await request.json()

    if (!brandName) {
      return NextResponse.json({ error: "Brand name is required" }, { status: 400 })
    }

    // If no API key, fall back to demo briefs
    if (!isAIConfigured()) {
      const demo = await loadDemoBrief(brandName)
      if (demo) return NextResponse.json({ brandDna: demo })
      return NextResponse.json(
        { error: "No AI API key configured. Set GOOGLE_GEMINI_API_KEY. Try: Rivian, Subaru, Toyota." },
        { status: 503 }
      )
    }

    // ═══════════════════════════════════════════════════════════
    // FAST PATH: Run ALL three in parallel
    // - AI gets called immediately (no waiting for scraper)
    // - Brandfetch runs simultaneously
    // - Scraper runs simultaneously (enriches retry if needed)
    // ═══════════════════════════════════════════════════════════

    let scraperContext = ""

    const [aiResult, bfResult, scraperResult] = await Promise.allSettled([
      // 1. AI — fire immediately without scraper context
      withTimeout(
        askAIJSON<BrandDNA>(
          BRAND_DNA_SYSTEM_PROMPT,
          BRAND_DNA_USER_PROMPT(brandName, ""),
          { temperature: 0.5 }
        ),
        40000, // 40s max for AI
        "AI"
      ),

      // 2. Brandfetch — fast API call
      isBrandfetchConfigured()
        ? withTimeout(fetchBrand(brandName), 6000, "Brandfetch")
        : Promise.resolve(null),

      // 3. Scraper — for retry enrichment
      withTimeout(
        scrapeBrand(brandName).then(result => {
          scraperContext = buildScraperContext(result)
          return result
        }),
        10000, // 10s max
        "Scraper"
      ),
    ])

    // Extract results
    const aiProfile = aiResult.status === "fulfilled" ? aiResult.value : null
    const brandfetchData: BrandfetchResult | null =
      bfResult.status === "fulfilled" ? bfResult.value : null

    const elapsed = Date.now() - startTime
    console.log(`[brand-dna] Parallel phase done in ${elapsed}ms — AI: ${aiResult.status}, BF: ${bfResult.status}, Scraper: ${scraperResult.status}`)

    // ─── Success: AI worked on first try ────────────────────
    if (aiProfile) {
      const profile = brandfetchData
        ? applyBrandfetch(aiProfile, brandfetchData)
        : aiProfile

      console.log(`[brand-dna] Success for ${brandName} in ${Date.now() - startTime}ms`)
      return NextResponse.json({ brandDna: profile })
    }

    // ─── Retry: AI failed, try once more with scraper context ─
    console.log(`[brand-dna] AI first attempt failed, retrying with scraper context (${scraperContext.length} chars)`)

    try {
      const retryProfile = await withTimeout(
        askAIJSON<BrandDNA>(
          BRAND_DNA_SYSTEM_PROMPT,
          BRAND_DNA_USER_PROMPT(brandName, scraperContext),
          { temperature: 0.5 }
        ),
        30000,
        "AI retry"
      )

      if (retryProfile) {
        const profile = brandfetchData
          ? applyBrandfetch(retryProfile, brandfetchData)
          : retryProfile

        console.log(`[brand-dna] Retry success for ${brandName} in ${Date.now() - startTime}ms`)
        return NextResponse.json({ brandDna: profile })
      }
    } catch (retryError) {
      console.error(`[brand-dna] Retry failed:`, retryError instanceof Error ? retryError.message : retryError)
    }

    // ─── Fallback: demo brief ───────────────────────────────
    const demo = await loadDemoBrief(brandName)
    if (demo) {
      console.log(`[brand-dna] Falling back to demo brief for: ${brandName}`)
      const profile = brandfetchData ? applyBrandfetch(demo, brandfetchData) : demo
      return NextResponse.json({ brandDna: profile })
    }

    const firstError = aiResult.status === "rejected"
      ? (aiResult.reason instanceof Error ? aiResult.reason.message : String(aiResult.reason))
      : "AI returned null (timeout)"

    return NextResponse.json(
      { error: `Failed to analyze brand: ${firstError}` },
      { status: 500 }
    )
  } catch (error) {
    console.error("[brand-dna] Unhandled error:", error instanceof Error ? error.message : error)
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : "Unknown"}` },
      { status: 500 }
    )
  }
}
