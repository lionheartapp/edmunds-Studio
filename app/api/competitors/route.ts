// app/api/competitors/route.ts — Competitor Profiles (Stage 2)
// Fetched separately from brand-dna to keep each call fast and reliable.
// Now enriched with real Edmunds inventory + market data for each competitor.

import { NextRequest, NextResponse } from "next/server"
import { askAIJSON, isAIConfigured } from "@/lib/ai"
import {
  COMPETITOR_PROFILES_SYSTEM_PROMPT,
  COMPETITOR_PROFILES_USER_PROMPT,
} from "@/prompts/brand-dna"
import {
  getInventorySummary,
  getMarketData,
  getDataSource,
} from "@/lib/edmunds"
import { fetchBrand, getBestLogoUrl } from "@/lib/brandfetch"

export const maxDuration = 60

interface CompetitorProfile {
  name: string
  domain: string
  logoColor: string
  logoUrl?: string
  adSpend: string
  topPlatform: string
  audienceOverlap: number
  ads: {
    platform: string
    headline: string
    bodyText?: string
    cta: string
    format: string
    thumbnailDesc?: string
    dateSpotted?: string
    estimatedImpressions?: string
    engagementRate?: number
    sentiment?: string
    whyItWorks?: string
  }[]
  strengths: string[]
  weaknesses: string[]
}

interface CompetitorResponse {
  competitorProfiles: CompetitorProfile[]
}

/** Race a promise against a timeout — returns null on timeout */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) =>
      setTimeout(() => {
        console.log(`[competitors] ${label} timed out after ${ms}ms`)
        resolve(null)
      }, ms)
    ),
  ])
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const { brandName, competitors } = await request.json()

    if (!brandName || !competitors || !Array.isArray(competitors) || competitors.length === 0) {
      return NextResponse.json(
        { error: "brandName and competitors[] are required" },
        { status: 400 }
      )
    }

    if (!isAIConfigured()) {
      return NextResponse.json(
        { error: "No AI API key configured", competitorProfiles: [] },
        { status: 503 }
      )
    }

    console.log(`[competitors] Fetching profiles for ${competitors.join(", ")} (brand: ${brandName})`)

    // ── Fetch real Edmunds data + Brandfetch logos for each competitor in parallel ──
    const competitorNames = competitors.slice(0, 3)
    const [edmundsResults, logoResults] = await Promise.all([
      Promise.allSettled(
        competitorNames.map(async (name: string) => {
          const [inv, mkt] = await Promise.allSettled([
            getInventorySummary(name),
            getMarketData(name),
          ])
          return {
            name,
            inventory: inv.status === "fulfilled" ? inv.value : null,
            market: mkt.status === "fulfilled" ? mkt.value : null,
          }
        })
      ),
      // Fetch logos via Brandfetch (fire-and-forget, never blocks)
      Promise.allSettled(
        competitorNames.map(async (name: string) => {
          const bf = await withTimeout(fetchBrand(name), 5000, `logo:${name}`)
          return { name, logoUrl: bf ? getBestLogoUrl(bf) : null }
        })
      ),
    ])

    // Build a name → logoUrl map
    const logoMap = new Map<string, string>()
    for (const r of logoResults) {
      if (r.status === "fulfilled" && r.value.logoUrl) {
        logoMap.set(r.value.name, r.value.logoUrl)
      }
    }

    const competitorEdmundsData = edmundsResults
      .filter(r => r.status === "fulfilled")
      .map(r => (r as PromiseFulfilledResult<{ name: string; inventory: unknown; market: unknown }>).value)

    const dataSource = getDataSource()
    console.log(`[competitors] Edmunds data loaded for ${competitorEdmundsData.length} competitors (source: ${dataSource})`)

    // Build context string for AI
    const edmundsContext = competitorEdmundsData.map(cd => {
      const lines: string[] = [`\n--- REAL EDMUNDS DATA for ${cd.name} (source: ${dataSource}) ---`]
      const inv = cd.inventory as Record<string, unknown> | null
      const mkt = cd.market as Record<string, unknown> | null
      if (inv) {
        lines.push(`  Inventory: ${(inv.totalInStock as number)?.toLocaleString() || "N/A"} units | Avg price: $${(inv.avgSellingPrice as number)?.toLocaleString() || "N/A"} | Days on lot: ${inv.avgDaysOnLot || "N/A"}`)
      }
      if (mkt) {
        lines.push(`  Market share: ${mkt.marketShare || "N/A"}% | Days to turn: ${mkt.daysToTurn || "N/A"} | Incentive spend: $${(mkt.incentiveSpend as number)?.toLocaleString() || "N/A"}`)
      }
      return lines.join("\n")
    }).join("\n")

    const enrichedPrompt = COMPETITOR_PROFILES_USER_PROMPT(brandName, competitorNames)
      + "\n\nIMPORTANT: Use this real Edmunds market data to ground your analysis. Reference specific inventory counts, pricing, and days-on-lot numbers in your strengths/weaknesses."
      + edmundsContext

    const result = await withTimeout(
      askAIJSON<CompetitorResponse>(
        COMPETITOR_PROFILES_SYSTEM_PROMPT,
        enrichedPrompt,
        { temperature: 0.5 }
      ),
      45000,
      "AI"
    )

    if (result && result.competitorProfiles) {
      // Ensure safe defaults on each profile + attach logos
      const profiles = result.competitorProfiles.map((cp) => ({
        ...cp,
        ads: cp.ads || [],
        strengths: cp.strengths || [],
        weaknesses: cp.weaknesses || [],
        audienceOverlap: cp.audienceOverlap || 0,
        adSpend: cp.adSpend || "Unknown",
        topPlatform: cp.topPlatform || "Unknown",
        logoUrl: logoMap.get(cp.name) || undefined,
      }))

      console.log(`[competitors] Success: ${profiles.length} profiles in ${Date.now() - startTime}ms`)
      return NextResponse.json({
        competitorProfiles: profiles,
        edmundsData: { competitors: competitorEdmundsData, dataSource },
      })
    }

    // AI failed — return empty but not a 500
    console.log(`[competitors] AI returned null, returning empty profiles`)
    return NextResponse.json({ competitorProfiles: buildGenericCompetitors(competitors) })

  } catch (error) {
    console.error("[competitors] Error:", error instanceof Error ? error.message : error)
    // Still return something so the UI doesn't crash
    try {
      const { competitors } = await request.clone().json()
      return NextResponse.json({ competitorProfiles: buildGenericCompetitors(competitors || []) })
    } catch {
      return NextResponse.json({ competitorProfiles: [] })
    }
  }
}

/** Build minimal competitor stubs when AI is unavailable */
function buildGenericCompetitors(names: string[]): CompetitorProfile[] {
  const colors = ["#EF4444", "#3B82F6", "#10B981"]
  return names.slice(0, 3).map((name, i) => ({
    name,
    domain: `${name.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
    logoColor: colors[i] || "#2070E8",
    adSpend: "$50k-100k/mo",
    topPlatform: "Facebook",
    audienceOverlap: 60 + i * 10,
    ads: [
      {
        platform: "Facebook",
        headline: `${name} — Drive Yours Today`,
        cta: "Learn More",
        format: "Image",
        dateSpotted: "2026-Q1",
      },
    ],
    strengths: ["Strong brand recognition", "Large ad budget"],
    weaknesses: ["Generic messaging", "Low social engagement"],
  }))
}
