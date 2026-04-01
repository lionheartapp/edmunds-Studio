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
import {
  getInventorySummary,
  getIncentives,
  getMarketData,
  getDataSource,
} from "@/lib/edmunds"

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

/**
 * Build a minimal generic BrandDNA for any brand when AI is unavailable.
 * This ensures the user ALWAYS gets a result they can continue with.
 */
function buildGenericFallback(brandName: string): BrandDNA {
  const name = brandName.trim()
  const domain = `${name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`

  return {
    name,
    domain,
    colors: {
      primary: "#3B82F6",
      secondary: "#1E40AF",
      accent: "#F59E0B",
      background: "#FFFFFF",
    },
    typography: {
      primaryFont: "Inter",
      fallback: "system-ui, sans-serif",
      headingWeight: "700",
    },
    voice: ["Professional", "Confident", "Approachable"],
    visualStyle: ["Clean", "Modern", "Lifestyle photography"],
    currentAds: [
      {
        platform: "Facebook",
        headline: `Discover ${name}`,
        cta: "Learn More",
        format: "Image",
        dateSpotted: "2026-Q1",
      },
      {
        platform: "Instagram",
        headline: `${name} — Built for You`,
        cta: "Shop Now",
        format: "Carousel",
        dateSpotted: "2026-Q1",
      },
    ],
    competitors: ["Competitor 1", "Competitor 2", "Competitor 3"],
    competitorProfiles: [],
    guidelinesUrl: undefined,
  } as unknown as BrandDNA
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

    const [aiResult, bfResult, scraperResult, inventoryResult, marketResult, incentivesResult] = await Promise.allSettled([
      // 1. AI — fire immediately without scraper context (25s so retry fits in 60s budget)
      withTimeout(
        askAIJSON<BrandDNA>(
          BRAND_DNA_SYSTEM_PROMPT,
          BRAND_DNA_USER_PROMPT(brandName, ""),
          { temperature: 0.5 }
        ),
        25000,
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
        10000,
        "Scraper"
      ),

      // 4. Edmunds inventory data (Databricks or mock)
      withTimeout(getInventorySummary(brandName), 10000, "Inventory"),

      // 5. Edmunds market data
      withTimeout(getMarketData(brandName), 10000, "Market"),

      // 6. Edmunds incentives
      withTimeout(getIncentives(brandName, "90210"), 10000, "Incentives"),
    ])

    // Extract results
    const aiProfile = aiResult.status === "fulfilled" ? aiResult.value : null
    const brandfetchData: BrandfetchResult | null =
      bfResult.status === "fulfilled" ? bfResult.value : null
    const inventoryData = inventoryResult.status === "fulfilled" ? inventoryResult.value : null
    const marketData = marketResult.status === "fulfilled" ? marketResult.value : null
    const incentivesData = incentivesResult.status === "fulfilled" ? incentivesResult.value : null
    const edmundsSource = getDataSource()

    const elapsed = Date.now() - startTime
    console.log(`[brand-dna] Parallel phase done in ${elapsed}ms — AI: ${aiResult.status}, BF: ${bfResult.status}, Scraper: ${scraperResult.status}, Inventory: ${inventoryResult.status}, Market: ${marketResult.status} (source: ${edmundsSource})`)

    // Bundle Edmunds data to return alongside brandDna
    const edmundsData = {
      inventory: inventoryData,
      market: marketData,
      incentives: incentivesData,
      dataSource: edmundsSource,
    }

    // ─── Success: AI worked on first try ────────────────────
    if (aiProfile) {
      const profile = brandfetchData
        ? applyBrandfetch(aiProfile, brandfetchData)
        : aiProfile

      console.log(`[brand-dna] Success for ${brandName} in ${Date.now() - startTime}ms`)
      return NextResponse.json({ brandDna: profile, edmundsData })
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
        20000, // 20s retry — keeps total under 60s Vercel limit
        "AI retry"
      )

      if (retryProfile) {
        const profile = brandfetchData
          ? applyBrandfetch(retryProfile, brandfetchData)
          : retryProfile

        console.log(`[brand-dna] Retry success for ${brandName} in ${Date.now() - startTime}ms`)
        return NextResponse.json({ brandDna: profile, edmundsData })
      }
    } catch (retryError) {
      console.error(`[brand-dna] Retry failed:`, retryError instanceof Error ? retryError.message : retryError)
    }

    // ─── Fallback: demo brief or generic ────────────────────
    const demo = await loadDemoBrief(brandName)
    if (demo) {
      console.log(`[brand-dna] Falling back to demo brief for: ${brandName}`)
      const profile = brandfetchData ? applyBrandfetch(demo, brandfetchData) : demo
      return NextResponse.json({ brandDna: profile, edmundsData })
    }

    // Generic fallback — always returns something so the user isn't stuck
    console.log(`[brand-dna] AI failed, using generic fallback for: ${brandName}`)
    const generic = buildGenericFallback(brandName)
    const profile = brandfetchData ? applyBrandfetch(generic, brandfetchData) : generic
    return NextResponse.json({ brandDna: profile, edmundsData, fallback: true })
  } catch (error) {
    console.error("[brand-dna] Unhandled error:", error instanceof Error ? error.message : error)

    // Even on crash, try to return something usable
    try {
      const { brandName } = await request.clone().json()
      if (brandName) {
        const generic = buildGenericFallback(brandName)
        return NextResponse.json({ brandDna: generic, fallback: true })
      }
    } catch { /* ignore */ }

    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : "Unknown"}` },
      { status: 500 }
    )
  }
}
