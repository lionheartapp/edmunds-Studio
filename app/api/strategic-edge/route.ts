// app/api/strategic-edge/route.ts — Strategic Edge Analysis Endpoint
// Now enriched with real Edmunds inventory, market, and incentive data

import { NextRequest, NextResponse } from "next/server"
import { askAIJSON, isAIConfigured } from "@/lib/ai"
import {
  STRATEGIC_EDGE_SYSTEM_PROMPT,
  STRATEGIC_EDGE_USER_PROMPT,
} from "@/prompts/brand-dna"
import { StrategicEdge } from "@/lib/types"
import {
  getInventorySummary,
  getMarketData,
  getIncentives,
  getDataSource,
} from "@/lib/edmunds"

export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const { brandDna } = await request.json()

    if (!brandDna) {
      return NextResponse.json(
        { error: "Brand DNA is required" },
        { status: 400 }
      )
    }

    if (!isAIConfigured()) {
      return NextResponse.json(
        { error: "No AI API key configured." },
        { status: 503 }
      )
    }

    console.log(`[strategic-edge] Analyzing opportunities for: ${brandDna.name}`)

    // ── Fetch real Edmunds data in parallel to enrich AI context ──
    const [inventory, market, incentives] = await Promise.allSettled([
      getInventorySummary(brandDna.name),
      getMarketData(brandDna.name),
      getIncentives(brandDna.name, "90210"),
    ])

    const inventoryData = inventory.status === "fulfilled" ? inventory.value : null
    const marketData = market.status === "fulfilled" ? market.value : null
    const incentivesData = incentives.status === "fulfilled" ? incentives.value : null
    const dataSource = getDataSource()

    console.log(`[strategic-edge] Edmunds data loaded (source: ${dataSource}) — inventory: ${!!inventoryData}, market: ${!!marketData}, incentives: ${incentivesData?.length || 0}`)

    // Build enriched context for AI
    const edmundsContext = buildEdmundsContext(brandDna.name, inventoryData, marketData, incentivesData, dataSource)
    const enrichedBrandDna = {
      ...brandDna,
      _edmundsMarketIntelligence: edmundsContext,
    }

    const edge = await askAIJSON<StrategicEdge>(
      STRATEGIC_EDGE_SYSTEM_PROMPT,
      STRATEGIC_EDGE_USER_PROMPT(JSON.stringify(enrichedBrandDna)),
      { temperature: 0.7, maxTokens: 8192 }
    )

    console.log(`[strategic-edge] Found ${edge.opportunities?.length || 0} opportunities, ${edge.preBuiltCampaigns?.length || 0} pre-built campaigns`)

    return NextResponse.json({
      edge,
      edmundsData: {
        inventory: inventoryData,
        market: marketData,
        incentives: incentivesData,
        dataSource,
      },
    })
  } catch (error) {
    console.error("[strategic-edge] Error:", error)
    return NextResponse.json(
      { error: "Failed to generate strategic analysis" },
      { status: 500 }
    )
  }
}

function buildEdmundsContext(
  brandName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inventory: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  market: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  incentives: any[] | null,
  dataSource: string
): string {
  const lines: string[] = [
    `\n--- REAL EDMUNDS MARKET DATA (source: ${dataSource}) ---`,
  ]

  if (inventory) {
    lines.push(`INVENTORY: ${brandName} has ${inventory.totalInStock?.toLocaleString() || "N/A"} vehicles in stock nationally.`)
    lines.push(`  Avg days on lot: ${inventory.avgDaysOnLot || "N/A"} | Avg selling price: $${inventory.avgSellingPrice?.toLocaleString() || "N/A"} | MSRP: $${inventory.avgMsrp?.toLocaleString() || "N/A"}`)
    if (inventory.topTrims && inventory.topTrims.length > 0) {
      lines.push(`  Top trims: ${inventory.topTrims.map((t: { trim: string; count: number; avgPrice: number }) => `${t.trim} (${t.count} units, $${t.avgPrice.toLocaleString()})`).join(", ")}`)
    }
    if (inventory.ageDistribution) {
      const age = inventory.ageDistribution
      lines.push(`  Age distribution: <30d: ${age.under30Days}, 30-60d: ${age.thirtyTo60Days}, 60-90d: ${age.sixtyTo90Days}, >90d: ${age.over90Days}`)
    }
  }

  if (market) {
    lines.push(`MARKET: Market share: ${market.marketShare}% | Sales trend: ${market.salesTrend} | Avg transaction: $${market.avgTransactionPrice?.toLocaleString() || "N/A"}`)
    lines.push(`  Incentive spend: $${market.incentiveSpend?.toLocaleString() || "N/A"} | Days to turn: ${market.daysToTurn}`)
    if (market.competitorComparison && market.competitorComparison.length > 0) {
      lines.push(`  Competitors: ${market.competitorComparison.map((c: { competitor: string; theirAvgPrice: number; theirDaysToTurn: number }) => `${c.competitor} ($${c.theirAvgPrice?.toLocaleString()}, ${c.theirDaysToTurn}d turn)`).join(", ")}`)
    }
    if (market.shopperInterest) {
      lines.push(`  Shopper interest: ${market.shopperInterest.searchVolume?.toLocaleString() || "N/A"} searches/mo (${market.shopperInterest.trend})`)
    }
  }

  if (incentives && incentives.length > 0) {
    lines.push(`INCENTIVES: ${incentives.length} active offers`)
    incentives.slice(0, 3).forEach((inc: { name: string; description: string }) => {
      lines.push(`  - ${inc.name}: ${inc.description}`)
    })
  }

  lines.push(`--- USE THIS DATA to ground your strategic recommendations in real market conditions. Reference specific numbers. ---`)

  return lines.join("\n")
}
