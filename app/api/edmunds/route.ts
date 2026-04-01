// app/api/edmunds/route.ts — Edmunds Data Enrichment Endpoint

import { NextRequest, NextResponse } from "next/server"
import {
  getInventorySummary,
  getTMVPricing,
  getIncentives,
  getReviews,
  getMarketData,
  getAdPlacements,
  getDataSource,
} from "@/lib/edmunds"

export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    const { make, model, zip, year } = await request.json()

    if (!make) {
      return NextResponse.json({ error: "Make is required" }, { status: 400 })
    }

    const resolvedZip = zip || "90245" // default to El Segundo (Edmunds HQ)
    const resolvedYear = year || 2025

    // Fetch all Edmunds data in parallel
    const [inventory, tmv, incentives, review, market, placements] = await Promise.all([
      getInventorySummary(make, model, resolvedZip),
      model ? getTMVPricing(make, model, resolvedYear, resolvedZip) : null,
      getIncentives(make, resolvedZip, model),
      model ? getReviews(make, model, resolvedYear) : null,
      getMarketData(make, model, "National"),
      getAdPlacements(),
    ])

    return NextResponse.json({
      edmunds: {
        inventory,
        tmv,
        incentives,
        review,
        market,
        placements,
      },
      dataSource: getDataSource(),
    })
  } catch (error) {
    console.error("[edmunds] Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch Edmunds data" },
      { status: 500 }
    )
  }
}
