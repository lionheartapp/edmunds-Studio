// app/api/databricks/route.ts — Databricks Data Endpoint
// Fetches real Edmunds data from Databricks SQL warehouse.
// Falls back gracefully if Databricks is not configured.

import { NextRequest, NextResponse } from "next/server"
import {
  isDatabricksConfigured,
  queryInventorySummary,
  queryInventoryItems,
  queryPricing,
  queryIncentives,
  queryAdPerformance,
  queryAdEvents,
  queryDealers,
  queryVehicleStyles,
  queryMarketData,
  queryShopperInterest,
  executeQuery,
  listTables,
} from "@/lib/databricks"

export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const { action, make, model, year, zip, catalog, schema, sql, dealerId, limit } = await request.json()

    if (!isDatabricksConfigured()) {
      return NextResponse.json(
        { error: "Databricks not configured. Set DATABRICKS_TOKEN env var." },
        { status: 503 }
      )
    }

    switch (action) {
      case "inventory": {
        if (!make) return NextResponse.json({ error: "make is required" }, { status: 400 })
        const data = await queryInventorySummary(make, model)
        return NextResponse.json({ data })
      }

      case "inventory_items": {
        if (!make) return NextResponse.json({ error: "make is required" }, { status: 400 })
        const data = await queryInventoryItems(make, model, zip, limit || 10)
        return NextResponse.json({ data })
      }

      case "pricing": {
        if (!make || !model) return NextResponse.json({ error: "make and model required" }, { status: 400 })
        const data = await queryPricing(make, model, year || 2026)
        return NextResponse.json({ data })
      }

      case "incentives": {
        if (!make) return NextResponse.json({ error: "make is required" }, { status: 400 })
        const data = await queryIncentives(make, model)
        return NextResponse.json({ data })
      }

      case "ad_performance": {
        const data = await queryAdPerformance(make, dealerId)
        return NextResponse.json({ data })
      }

      case "ad_events": {
        if (!make) return NextResponse.json({ error: "make is required" }, { status: 400 })
        const data = await queryAdEvents(make, model, limit || 100)
        return NextResponse.json({ data })
      }

      case "dealers": {
        if (!make) return NextResponse.json({ error: "make is required" }, { status: 400 })
        const data = await queryDealers(make, zip, limit || 20)
        return NextResponse.json({ data })
      }

      case "vehicle_styles": {
        if (!make) return NextResponse.json({ error: "make is required" }, { status: 400 })
        const data = await queryVehicleStyles(make, model, year)
        return NextResponse.json({ data })
      }

      case "market": {
        if (!make) return NextResponse.json({ error: "make is required" }, { status: 400 })
        const data = await queryMarketData(make, model)
        return NextResponse.json({ data })
      }

      case "shopper_interest": {
        if (!make) return NextResponse.json({ error: "make is required" }, { status: 400 })
        const data = await queryShopperInterest(make, model)
        return NextResponse.json({ data })
      }

      case "explore": {
        if (!catalog || !schema) {
          return NextResponse.json({ error: "catalog and schema required" }, { status: 400 })
        }
        const data = await listTables(catalog, schema)
        return NextResponse.json({ data })
      }

      case "query": {
        if (!sql) return NextResponse.json({ error: "sql is required" }, { status: 400 })
        const data = await executeQuery(sql, catalog || "public")
        return NextResponse.json({ data })
      }

      // "all" — fetch everything for a make in parallel
      case "all":
      default: {
        if (!make) return NextResponse.json({ error: "make is required" }, { status: 400 })

        const results = await Promise.allSettled([
          queryInventorySummary(make, model),
          model ? queryPricing(make, model, year || 2026) : Promise.resolve(null),
          queryIncentives(make, model),
          queryMarketData(make, model),
          queryAdPerformance(make),
          queryShopperInterest(make, model),
          queryDealers(make, zip, 10),
        ])

        const [inventory, pricing, incentives, market, adPerformance, shopperInterest, dealers] = results.map(
          (r) => (r.status === "fulfilled" ? r.value : null)
        )

        return NextResponse.json({
          databricks: {
            inventory,
            pricing,
            incentives,
            market,
            adPerformance,
            shopperInterest,
            dealers,
          },
          status: results.map((r, i) => ({
            query: ["inventory", "pricing", "incentives", "market", "adPerformance", "shopperInterest", "dealers"][i],
            success: r.status === "fulfilled",
            error: r.status === "rejected" ? (r as PromiseRejectedResult).reason?.message : undefined,
          })),
        })
      }
    }
  } catch (error) {
    console.error("[databricks] Error:", error)
    return NextResponse.json(
      { error: `Databricks query failed: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    )
  }
}
