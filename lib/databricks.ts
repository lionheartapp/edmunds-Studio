// lib/databricks.ts — Databricks SQL Statement API Service
// ═══════════════════════════════════════════════════════════════
// Queries Edmunds production data via Databricks SQL warehouse.
// Uses the SQL Statement Execution API to run queries against
// the Unity Catalog (prod, public, reporting schemas).
//
// Workspace: https://edm-west.cloud.databricks.com
// SQL Warehouse: 97c55e8561894cb0
// ═══════════════════════════════════════════════════════════════

// ─── Configuration ──────────────────────────────────────────

const DATABRICKS_HOST = process.env.DATABRICKS_HOST || "https://edm-west.cloud.databricks.com"
const DATABRICKS_TOKEN = process.env.DATABRICKS_TOKEN || ""
const DATABRICKS_WAREHOUSE_ID = process.env.DATABRICKS_WAREHOUSE_ID || "97c55e8561894cb0"

export function isDatabricksConfigured(): boolean {
  return !!DATABRICKS_TOKEN
}

// ─── Core Query Engine ──────────────────────────────────────

interface DatabricksColumn {
  name: string
  type_name: string
}

interface DatabricksResult {
  columns: DatabricksColumn[]
  rows: string[][]
  rowCount: number
}

/**
 * Execute a SQL query against the Databricks SQL warehouse.
 * Returns typed rows with column metadata.
 */
export async function executeQuery(sql: string, catalog = "public"): Promise<DatabricksResult> {
  const response = await fetch(`${DATABRICKS_HOST}/api/2.0/sql/statements`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${DATABRICKS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      warehouse_id: DATABRICKS_WAREHOUSE_ID,
      catalog,
      statement: sql,
      wait_timeout: "30s",
      disposition: "INLINE",
      format: "JSON_ARRAY",
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Databricks query failed (${response.status}): ${errorText}`)
  }

  const data = await response.json()

  if (data.status?.state === "FAILED") {
    throw new Error(`Query failed: ${data.status.error?.message || "Unknown error"}`)
  }

  // Handle pending/running states (poll if needed)
  if (data.status?.state === "PENDING" || data.status?.state === "RUNNING") {
    return await pollStatement(data.statement_id)
  }

  const columns: DatabricksColumn[] = data.manifest?.schema?.columns || []
  const rows: string[][] = data.result?.data_array || []

  return {
    columns,
    rows,
    rowCount: data.manifest?.total_row_count || rows.length,
  }
}

async function pollStatement(statementId: string, maxAttempts = 20): Promise<DatabricksResult> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const response = await fetch(
      `${DATABRICKS_HOST}/api/2.0/sql/statements/${statementId}`,
      {
        headers: {
          Authorization: `Bearer ${DATABRICKS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    )

    const data = await response.json()

    if (data.status?.state === "SUCCEEDED") {
      return {
        columns: data.manifest?.schema?.columns || [],
        rows: data.result?.data_array || [],
        rowCount: data.manifest?.total_row_count || 0,
      }
    }

    if (data.status?.state === "FAILED") {
      throw new Error(`Query failed: ${data.status.error?.message || "Unknown error"}`)
    }
  }

  throw new Error("Query timed out after polling")
}

// ─── Helper: Convert rows to objects ────────────────────────

function rowsToObjects<T>(result: DatabricksResult): T[] {
  return result.rows.map((row) => {
    const obj: Record<string, unknown> = {}
    result.columns.forEach((col, i) => {
      const value = row[i]
      // Auto-parse numbers
      if (col.type_name === "INT" || col.type_name === "BIGINT" || col.type_name === "LONG") {
        obj[col.name] = value ? parseInt(value, 10) : 0
      } else if (col.type_name === "DOUBLE" || col.type_name === "FLOAT" || col.type_name === "DECIMAL") {
        obj[col.name] = value ? parseFloat(value) : 0
      } else if (col.type_name === "BOOLEAN") {
        obj[col.name] = value === "true"
      } else {
        obj[col.name] = value
      }
    })
    return obj as T
  })
}

// ─── Edmunds Data Queries ───────────────────────────────────
// These functions query specific Edmunds schemas and return
// data shaped to match our EdmundsTypes interfaces.
// Table/column names may need adjustment once we see the actual schema.

// ═══════════════════════════════════════════════════════════════
// REAL EDMUNDS QUERIES — Using actual production table schemas
// ═══════════════════════════════════════════════════════════════

/**
 * Inventory summary from public.inventory.gold_inventory_active
 * 130+ columns: VIN, year, make, model, trim, style, body_type, msrp,
 * displayed_dealer_price, advertised_price, tmv, deal_type, photos, colors, etc.
 */
export async function queryInventorySummary(make: string, model?: string) {
  const modelFilter = model ? `AND LOWER(model) = LOWER('${model}')` : ""

  // Main aggregation query
  const result = await executeQuery(`
    SELECT
      make,
      model,
      COUNT(*) as total_in_stock,
      ROUND(AVG(DATEDIFF(CURRENT_DATE(), lot_date)), 0) as avg_days_on_lot,
      ROUND(AVG(COALESCE(advertised_price, displayed_dealer_price, msrp)), 0) as avg_selling_price,
      ROUND(AVG(msrp), 0) as avg_msrp,
      MIN(COALESCE(advertised_price, displayed_dealer_price, msrp)) as min_price,
      MAX(COALESCE(advertised_price, displayed_dealer_price, msrp)) as max_price,
      SUM(CASE WHEN DATEDIFF(CURRENT_DATE(), lot_date) < 30 THEN 1 ELSE 0 END) as under_30,
      SUM(CASE WHEN DATEDIFF(CURRENT_DATE(), lot_date) BETWEEN 30 AND 59 THEN 1 ELSE 0 END) as thirty_to_60,
      SUM(CASE WHEN DATEDIFF(CURRENT_DATE(), lot_date) BETWEEN 60 AND 89 THEN 1 ELSE 0 END) as sixty_to_90,
      SUM(CASE WHEN DATEDIFF(CURRENT_DATE(), lot_date) >= 90 THEN 1 ELSE 0 END) as over_90,
      ROUND(AVG(tmv), 0) as avg_tmv,
      COUNT(CASE WHEN deal_type = 'Great' THEN 1 END) as great_deals,
      COUNT(CASE WHEN deal_type = 'Good' THEN 1 END) as good_deals
    FROM inventory.gold_inventory_active
    WHERE LOWER(make) = LOWER('${make}')
    ${modelFilter}
    GROUP BY make, model
    ORDER BY total_in_stock DESC
    LIMIT 1
  `)

  if (result.rows.length === 0) return null
  const row = rowsToObjects<Record<string, unknown>>(result)[0]

  // Top trims breakdown
  const trimResult = await executeQuery(`
    SELECT
      trim,
      COUNT(*) as count,
      ROUND(AVG(COALESCE(advertised_price, displayed_dealer_price, msrp)), 0) as avg_price
    FROM inventory.gold_inventory_active
    WHERE LOWER(make) = LOWER('${make}')
    ${modelFilter}
    GROUP BY trim
    ORDER BY count DESC
    LIMIT 5
  `)
  const trims = rowsToObjects<{ trim: string; count: number; avg_price: number }>(trimResult)

  return {
    make: row.make as string,
    model: (row.model as string) || model || "All Models",
    totalInStock: row.total_in_stock as number,
    avgDaysOnLot: row.avg_days_on_lot as number,
    avgSellingPrice: row.avg_selling_price as number,
    avgMsrp: row.avg_msrp as number,
    priceRange: { min: row.min_price as number, max: row.max_price as number },
    ageDistribution: {
      under30Days: row.under_30 as number,
      thirtyTo60Days: row.thirty_to_60 as number,
      sixtyTo90Days: row.sixty_to_90 as number,
      over90Days: row.over_90 as number,
    },
    topTrims: trims.map((t) => ({ trim: t.trim, count: t.count, avgPrice: t.avg_price })),
    avgTmv: row.avg_tmv as number,
    greatDeals: row.great_deals as number,
    goodDeals: row.good_deals as number,
  }
}

/**
 * Get real inventory items with photos, pricing, deal types
 * from public.inventory.gold_inventory_active
 */
export async function queryInventoryItems(make: string, model?: string, zip?: string, limit = 10) {
  const modelFilter = model ? `AND LOWER(model) = LOWER('${model}')` : ""
  const zipFilter = zip ? `AND zip LIKE '${zip.slice(0, 3)}%'` : ""

  const result = await executeQuery(`
    SELECT
      vin,
      year, make, model, trim, style as style_name,
      body_type, doors, drive_type, fuel_type,
      engine_size, engine_cylinders, engine_horsepower,
      transmission_name, electricty_range,
      msrp, invoice_price, displayed_dealer_price, advertised_price, tmv,
      deal_type, total_purchase_incentive,
      cdd_dealer_id, cdd_franchise_id, zip,
      exterior_color, interior_color,
      new_used_flag,
      photo_count,
      dealer_vdp,
      lot_date,
      DATEDIFF(CURRENT_DATE(), lot_date) as days_on_lot
    FROM inventory.gold_inventory_active
    WHERE LOWER(make) = LOWER('${make}')
    ${modelFilter}
    ${zipFilter}
    ORDER BY lot_date DESC
    LIMIT ${limit}
  `)

  return rowsToObjects(result)
}

/**
 * Pricing/TMV from inventory (TMV is a column on inventory rows)
 * Aggregates TMV, MSRP, invoice, deal types across active inventory
 */
export async function queryPricing(make: string, model: string, year: number) {
  const result = await executeQuery(`
    SELECT
      make, model, year,
      ROUND(AVG(msrp), 0) as avg_msrp,
      ROUND(AVG(tmv), 0) as avg_tmv,
      ROUND(AVG(invoice_price), 0) as avg_invoice,
      ROUND(AVG(displayed_dealer_price), 0) as avg_dealer_price,
      ROUND(AVG(advertised_price), 0) as avg_advertised_price,
      ROUND(AVG(total_purchase_incentive), 0) as avg_incentive_savings,
      MIN(COALESCE(advertised_price, displayed_dealer_price, msrp)) as price_low,
      MAX(COALESCE(advertised_price, displayed_dealer_price, msrp)) as price_high,
      COUNT(*) as sample_size,
      COUNT(CASE WHEN deal_type = 'Great' THEN 1 END) as great_deal_count,
      COUNT(CASE WHEN deal_type = 'Good' THEN 1 END) as good_deal_count,
      COUNT(CASE WHEN deal_type = 'Fair' THEN 1 END) as fair_deal_count
    FROM inventory.gold_inventory_active
    WHERE LOWER(make) = LOWER('${make}')
      AND LOWER(model) = LOWER('${model}')
      AND year = ${year}
    GROUP BY make, model, year
    LIMIT 1
  `)

  if (result.rows.length === 0) return null
  return rowsToObjects(result)[0]
}

/**
 * Lease specials from public.incentive.gold_lease_specials
 * Real lease deals with payment, due_at_signing, lifetime_cost, geo targeting
 */
export async function queryIncentives(make: string, model?: string) {
  const modelFilter = model ? `AND LOWER(model) = LOWER('${model}')` : ""

  const result = await executeQuery(`
    SELECT
      make, model, year, trim, vehicle,
      style_id, edmunds_style, edmunds_trim,
      start_date, end_date,
      msrp, payment, due_at_signing,
      total_payments, lifetime_cost, effective_payment,
      term, yearly_excess_mileage,
      lease_description, web_url,
      is_hidden_gem,
      inv_average_monthly_payment, inv_median_monthly_payment,
      inv_min_monthly_payment, inv_max_monthly_payment
    FROM incentive.gold_lease_specials
    WHERE LOWER(make) = LOWER('${make}')
    ${modelFilter}
    ORDER BY payment ASC
    LIMIT 10
  `)

  return rowsToObjects(result)
}

/**
 * Ad campaign performance from public.ad.gold_adsolutions_daily_campaign
 * Real campaign data with spend, CPM, CTR, CPC, impressions, contacts
 */
export async function queryAdPerformance(make?: string, dealerId?: string) {
  const whereClause = dealerId
    ? `WHERE cdd_id = ${dealerId}`
    : "WHERE f_date >= DATE_SUB(CURRENT_DATE(), 30)"

  const result = await executeQuery(`
    SELECT
      campaign_name,
      dealer_name,
      strategy,
      SUM(total_facebook_impressions) as total_impressions,
      SUM(total_facebook_clicks) as total_clicks,
      ROUND(SUM(total_facebook_clicks) * 100.0 / NULLIF(SUM(total_facebook_impressions), 0), 2) as ctr,
      SUM(total_facebook_spend) as total_spend,
      ROUND(SUM(total_facebook_spend) * 1000.0 / NULLIF(SUM(total_facebook_impressions), 0), 2) as cpm,
      ROUND(SUM(total_facebook_spend) / NULLIF(SUM(total_facebook_clicks), 0), 2) as cpc,
      SUM(contacts) as total_contacts,
      SUM(visitors) as total_visitors,
      SUM(retarget_facebook_impressions) as retarget_impressions,
      SUM(lookalikes_facebook_impressions) as lookalike_impressions
    FROM ad.gold_adsolutions_daily_campaign
    ${whereClause}
    GROUP BY campaign_name, dealer_name, strategy
    ORDER BY total_impressions DESC
    LIMIT 15
  `)

  return rowsToObjects(result)
}

/**
 * Granular ad event data from public.ad.gold_event_ad
 * Targeting, geo, revenue, viewability, creative details
 */
export async function queryAdEvents(make: string, model?: string, limit = 100) {
  const modelFilter = model ? `AND LOWER(targeted_model) = LOWER('${model}')` : ""

  const result = await executeQuery(`
    SELECT
      targeted_make, targeted_model, targeted_model_year,
      geo_state, geo_dma,
      SUM(total_estimated_revenue) as total_revenue,
      SUM(ad_impressions) as total_impressions,
      ROUND(SUM(viewable_impressions) * 100.0 / NULLIF(SUM(measurable_impressions), 0), 2) as viewability_pct,
      COUNT(DISTINCT creative_id) as unique_creatives,
      SUM(click_count) as total_clicks
    FROM ad.gold_event_ad
    WHERE LOWER(targeted_make) = LOWER('${make}')
    ${modelFilter}
      AND record_date >= DATE_SUB(CURRENT_DATE(), 30)
    GROUP BY targeted_make, targeted_model, targeted_model_year, geo_state, geo_dma
    ORDER BY total_revenue DESC
    LIMIT ${limit}
  `)

  return rowsToObjects(result)
}

/**
 * Dealer info from public.dealer.gold_dealer
 * Full dealer data with address, lat/long, coverage radius, franchise hierarchy
 */
export async function queryDealers(make: string, zip?: string, limit = 20) {
  const zipFilter = zip ? `AND rooftop_address_zip LIKE '${zip.slice(0, 3)}%'` : ""

  const result = await executeQuery(`
    SELECT
      dealer_franchise_id,
      dealer_franchise_name,
      rooftop_address_street as address,
      rooftop_address_city as city,
      rooftop_address_statecode as state,
      rooftop_address_zip as zip,
      rooftop_address_latitude as latitude,
      rooftop_address_longitude as longitude,
      coverage_radius,
      parent_dealer_franchise_id,
      dealer_make,
      dealer_franchise_status
    FROM dealer.gold_dealer
    WHERE LOWER(dealer_make) = LOWER('${make}')
      AND dealer_franchise_status = 'Active'
    ${zipFilter}
    LIMIT ${limit}
  `)

  return rowsToObjects(result)
}

/**
 * Vehicle style catalog from public.vehicle.gold_style
 * model_year is a STRUCT with {id, make, model, year}
 * Deep spec data: 90+ attribute structs (engine, safety, dimensions, etc.)
 */
export async function queryVehicleStyles(make: string, model?: string, year?: number) {
  const modelFilter = model ? `AND LOWER(model_year.model) = LOWER('${model}')` : ""
  const yearFilter = year ? `AND model_year.year = '${year}'` : ""

  const result = await executeQuery(`
    SELECT
      style_id,
      model_year,
      name,
      vehicle_state,
      standard_engine,
      standard_transmission,
      primary_body_type,
      vehicle_size_class,
      trim_level,
      manufacturer_code,
      prices,
      where_built
    FROM vehicle.gold_style
    WHERE LOWER(model_year.make) = LOWER('${make}')
    ${modelFilter}
    ${yearFilter}
    ORDER BY model_year.year DESC
    LIMIT 10
  `)

  return rowsToObjects(result)
}

/**
 * Market competitive analysis — aggregates inventory data to compare makes
 */
export async function queryMarketData(make: string, model?: string) {
  const modelFilter = model ? `AND LOWER(model) = LOWER('${model}')` : ""

  // Get stats for the target make
  const targetResult = await executeQuery(`
    SELECT
      make,
      ${model ? "model," : "'' as model,"}
      COUNT(*) as total_inventory,
      ROUND(AVG(COALESCE(advertised_price, displayed_dealer_price, msrp)), 0) as avg_transaction_price,
      ROUND(AVG(total_purchase_incentive), 0) as avg_incentive_spend,
      ROUND(AVG(DATEDIFF(CURRENT_DATE(), lot_date)), 0) as avg_days_to_turn,
      COUNT(CASE WHEN deal_type = 'Great' THEN 1 END) as great_deals,
      ROUND(AVG(tmv), 0) as avg_tmv
    FROM inventory.gold_inventory_active
    WHERE LOWER(make) = LOWER('${make}')
    ${modelFilter}
    GROUP BY make ${model ? ", model" : ""}
    LIMIT 1
  `)

  if (targetResult.rows.length === 0) return null
  const target = rowsToObjects<Record<string, unknown>>(targetResult)[0]

  // Get top competitors by inventory volume in same body type
  const competitorResult = await executeQuery(`
    SELECT
      make,
      COUNT(*) as total_inventory,
      ROUND(AVG(COALESCE(advertised_price, displayed_dealer_price, msrp)), 0) as avg_price,
      ROUND(AVG(DATEDIFF(CURRENT_DATE(), lot_date)), 0) as avg_days_to_turn
    FROM inventory.gold_inventory_active
    WHERE LOWER(make) != LOWER('${make}')
      AND body_type IN (
        SELECT DISTINCT body_type
        FROM inventory.gold_inventory_active
        WHERE LOWER(make) = LOWER('${make}')
        ${modelFilter}
      )
    GROUP BY make
    ORDER BY total_inventory DESC
    LIMIT 5
  `)

  const competitors = rowsToObjects<Record<string, unknown>>(competitorResult)

  return {
    make: target.make as string,
    model: (target.model as string) || model || "All Models",
    totalInventory: target.total_inventory as number,
    avgTransactionPrice: target.avg_transaction_price as number,
    avgIncentiveSpend: target.avg_incentive_spend as number,
    avgDaysToTurn: target.avg_days_to_turn as number,
    avgTmv: target.avg_tmv as number,
    greatDeals: target.great_deals as number,
    competitors: competitors.map((c) => ({
      make: c.make as string,
      totalInventory: c.total_inventory as number,
      avgPrice: c.avg_price as number,
      avgDaysToTurn: c.avg_days_to_turn as number,
    })),
  }
}

/**
 * Shopper interest — count inventory views/activity as a proxy
 */
export async function queryShopperInterest(make: string, model?: string) {
  const modelFilter = model ? `AND LOWER(model) = LOWER('${model}')` : ""

  // Use inventory volume + deal types as proxy for shopper interest
  const result = await executeQuery(`
    SELECT
      make,
      model,
      COUNT(*) as inventory_volume,
      COUNT(CASE WHEN deal_type = 'Great' THEN 1 END) as great_deals,
      COUNT(CASE WHEN deal_type = 'Good' THEN 1 END) as good_deals,
      ROUND(AVG(tmv), 0) as avg_tmv,
      ROUND(AVG(COALESCE(advertised_price, displayed_dealer_price, msrp)), 0) as avg_price,
      COUNT(DISTINCT cdd_dealer_id) as dealer_count
    FROM inventory.gold_inventory_active
    WHERE LOWER(make) = LOWER('${make}')
    ${modelFilter}
    GROUP BY make, model
    ORDER BY inventory_volume DESC
    LIMIT 5
  `)

  if (result.rows.length === 0) return null
  return rowsToObjects(result)
}

// ═══════════════════════════════════════════════════════════════
// EDMUNDS AD ACTIVITY — What this OEM is running on Edmunds NOW
// ═══════════════════════════════════════════════════════════════

export interface EdmundsAdActivity {
  campaigns: {
    campaignName: string
    dealerName: string
    strategy: string
    impressions: number
    clicks: number
    ctr: number
    spend: number
    cpm: number
    cpc: number
    contacts: number
  }[]
  eventSummary: {
    targetedModel: string
    targetedModelYear: string
    totalImpressions: number
    totalClicks: number
    totalRevenue: number
    viewabilityPct: number
    uniqueCreatives: number
    topStates: string[]
  }[]
  totalImpressions: number
  totalSpend: number
  totalCreatives: number
  activeCampaigns: number
}

/**
 * Get the OEM's complete ad activity on Edmunds — campaigns + events.
 * This is REAL data showing what's actually running.
 */
export async function queryEdmundsAdActivity(make: string): Promise<EdmundsAdActivity | null> {
  if (!isDatabricksConfigured()) return null

  try {
    const [campaignResult, eventResult] = await Promise.allSettled([
      // Active campaigns from adsolutions
      executeQuery(`
        SELECT
          campaign_name,
          dealer_name,
          strategy,
          SUM(total_facebook_impressions) as impressions,
          SUM(total_facebook_clicks) as clicks,
          ROUND(SUM(total_facebook_clicks) * 100.0 / NULLIF(SUM(total_facebook_impressions), 0), 2) as ctr,
          ROUND(SUM(total_facebook_spend), 2) as spend,
          ROUND(SUM(total_facebook_spend) * 1000.0 / NULLIF(SUM(total_facebook_impressions), 0), 2) as cpm,
          ROUND(SUM(total_facebook_spend) / NULLIF(SUM(total_facebook_clicks), 0), 2) as cpc,
          SUM(contacts) as contacts
        FROM ad.gold_adsolutions_daily_campaign
        WHERE f_date >= DATE_SUB(CURRENT_DATE(), 30)
          AND LOWER(dealer_name) LIKE CONCAT('%', LOWER('${make}'), '%')
        GROUP BY campaign_name, dealer_name, strategy
        ORDER BY impressions DESC
        LIMIT 10
      `),
      // Ad events by model
      executeQuery(`
        SELECT
          targeted_model,
          targeted_model_year,
          SUM(ad_impressions) as total_impressions,
          SUM(click_count) as total_clicks,
          ROUND(SUM(total_estimated_revenue), 2) as total_revenue,
          ROUND(SUM(viewable_impressions) * 100.0 / NULLIF(SUM(measurable_impressions), 0), 2) as viewability_pct,
          COUNT(DISTINCT creative_id) as unique_creatives,
          COLLECT_SET(geo_state) as top_states
        FROM ad.gold_event_ad
        WHERE LOWER(targeted_make) = LOWER('${make}')
          AND record_date >= DATE_SUB(CURRENT_DATE(), 30)
        GROUP BY targeted_model, targeted_model_year
        ORDER BY total_impressions DESC
        LIMIT 10
      `),
    ])

    const campaigns = campaignResult.status === "fulfilled"
      ? rowsToObjects<Record<string, unknown>>(campaignResult.value).map(r => ({
          campaignName: (r.campaign_name as string) || "",
          dealerName: (r.dealer_name as string) || "",
          strategy: (r.strategy as string) || "",
          impressions: (r.impressions as number) || 0,
          clicks: (r.clicks as number) || 0,
          ctr: (r.ctr as number) || 0,
          spend: (r.spend as number) || 0,
          cpm: (r.cpm as number) || 0,
          cpc: (r.cpc as number) || 0,
          contacts: (r.contacts as number) || 0,
        }))
      : []

    const eventSummary = eventResult.status === "fulfilled"
      ? rowsToObjects<Record<string, unknown>>(eventResult.value).map(r => ({
          targetedModel: (r.targeted_model as string) || "",
          targetedModelYear: (r.targeted_model_year as string) || "",
          totalImpressions: (r.total_impressions as number) || 0,
          totalClicks: (r.total_clicks as number) || 0,
          totalRevenue: (r.total_revenue as number) || 0,
          viewabilityPct: (r.viewability_pct as number) || 0,
          uniqueCreatives: (r.unique_creatives as number) || 0,
          topStates: Array.isArray(r.top_states) ? (r.top_states as string[]).slice(0, 5) : [],
        }))
      : []

    const totalImpressions = eventSummary.reduce((s, e) => s + e.totalImpressions, 0)
    const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0)
    const totalCreatives = eventSummary.reduce((s, e) => s + e.uniqueCreatives, 0)

    return {
      campaigns,
      eventSummary,
      totalImpressions,
      totalSpend,
      totalCreatives,
      activeCampaigns: campaigns.length,
    }
  } catch (err) {
    console.error("[databricks] queryEdmundsAdActivity failed:", err)
    return null
  }
}

// ═══════════════════════════════════════════════════════════════
// EDMUNDS MEDIA CDN — Real vehicle photos
// ═══════════════════════════════════════════════════════════════

/**
 * Normalize raw model names (from Databricks targeted_model, campaign names, etc.)
 * into the hyphenated slug format the Edmunds media CDN expects.
 *
 * Examples:
 *   "f150" → "f-150"
 *   "F250SuperDuty" → "f-250-super-duty"
 *   "grandcherokee" → "grand-cherokee"
 *   "CX-5" → "cx-5"
 *   "Bronco" → "bronco"
 */
const MODEL_SLUG_MAP: Record<string, string> = {
  // Ford
  f150: "f-150", f250: "f-250", f350: "f-350", f450: "f-450",
  f250superduty: "f-250-super-duty", f350superduty: "f-350-super-duty",
  f150lightning: "f-150-lightning",
  mustangmache: "mustang-mach-e", mustangmachegtp: "mustang-mach-e",
  bronco: "bronco", broncosport: "bronco-sport",
  explorer: "explorer", expedition: "expedition", edge: "edge",
  escape: "escape", maverick: "maverick", ranger: "ranger",
  mustang: "mustang", transit: "transit",
  // Toyota
  camry: "camry", corolla: "corolla", rav4: "rav4",
  highlander: "highlander", tacoma: "tacoma", tundra: "tundra",
  "4runner": "4runner", sienna: "sienna", prius: "prius",
  venza: "venza", supra: "supra", sequoia: "sequoia",
  grandhighlander: "grand-highlander", landcruiser: "land-cruiser",
  crownsiglsdn: "crown-signia", bz4x: "bz4x",
  // Honda
  civic: "civic", accord: "accord", crv: "cr-v", "cr-v": "cr-v",
  hrv: "hr-v", "hr-v": "hr-v", pilot: "pilot", ridgeline: "ridgeline",
  odyssey: "odyssey", passport: "passport", prologue: "prologue",
  // Chevrolet
  silverado: "silverado", equinox: "equinox", tahoe: "tahoe",
  suburban: "suburban", traverse: "traverse", blazer: "blazer",
  trax: "trax", colorado: "colorado", camaro: "camaro",
  corvette: "corvette", bolt: "bolt-euv", malibu: "malibu",
  silveradoev: "silverado-ev",
  // Jeep
  grandcherokee: "grand-cherokee", wrangler: "wrangler",
  compass: "compass", cherokee: "cherokee", gladiator: "gladiator",
  renegade: "renegade", wagoneer: "wagoneer",
  grandwagoneer: "grand-wagoneer",
  // Hyundai
  tucson: "tucson", palisade: "palisade", santafe: "santa-fe",
  ioniq5: "ioniq-5", ioniq6: "ioniq-6", kona: "kona",
  sonata: "sonata", elantra: "elantra",
  // Kia
  telluride: "telluride", sportage: "sportage", ev6: "ev6",
  ev9: "ev9", sorento: "sorento", forte: "forte", seltos: "seltos",
  // Nissan
  rogue: "rogue", altima: "altima", pathfinder: "pathfinder",
  frontier: "frontier", sentra: "sentra", murano: "murano",
  kicks: "kicks", ariya: "ariya",
  // Subaru
  outback: "outback", forester: "forester", crosstrek: "crosstrek",
  wrx: "wrx", impreza: "impreza", ascent: "ascent", solterra: "solterra",
  // BMW
  "3series": "3-series", "5series": "5-series", "7series": "7-series",
  x3: "x3", x5: "x5", x7: "x7", x1: "x1", i4: "i4", ix: "ix",
  // Mercedes
  "cclass": "c-class", "eclass": "e-class", "sclass": "s-class",
  gle: "gle", glc: "glc", gls: "gls", glb: "glb", gla: "gla",
  // Audi
  q5: "q5", q7: "q7", q3: "q3", a4: "a4", a6: "a6", q8: "q8",
  etron: "e-tron", etrongt: "e-tron-gt",
  // VW
  tiguan: "tiguan", atlas: "atlas", jetta: "jetta",
  taos: "taos", id4: "id.4", arteon: "arteon",
  atlascrosssport: "atlas-cross-sport",
  // Mazda
  cx5: "cx-5", "cx-5": "cx-5", cx50: "cx-50", "cx-50": "cx-50",
  cx90: "cx-90", "cx-90": "cx-90", mazda3: "mazda3", mx5miata: "mx-5-miata",
  // Lexus
  rx: "rx", nx: "nx", es: "es", is: "is", gx: "gx", lx: "lx", ux: "ux",
  rz: "rz",
  // GMC
  sierra: "sierra", yukon: "yukon", terrain: "terrain",
  acadia: "acadia", canyon: "canyon", hummer: "hummer-ev",
  // Ram
  "1500": "1500", "2500": "2500", "3500": "3500",
  // Dodge
  durango: "durango", charger: "charger", hornet: "hornet",
  // Rivian
  r1t: "r1t", r1s: "r1s", r2: "r2",
  // Tesla
  modely: "model-y", model3: "model-3", modelx: "model-x", models: "model-s",
  "model y": "model-y", "model 3": "model-3", "model x": "model-x", "model s": "model-s",
}

/**
 * Human-readable display names for raw model codes
 */
const MODEL_DISPLAY_MAP: Record<string, string> = {
  f150: "F-150", f250: "F-250", f350: "F-350",
  f250superduty: "F-250 Super Duty", f350superduty: "F-350 Super Duty",
  f150lightning: "F-150 Lightning",
  grandcherokee: "Grand Cherokee", grandwagoneer: "Grand Wagoneer",
  grandhighlander: "Grand Highlander", landcruiser: "Land Cruiser",
  santafe: "Santa Fe", ioniq5: "Ioniq 5", ioniq6: "Ioniq 6",
  crv: "CR-V", hrv: "HR-V",
  broncosport: "Bronco Sport",
  cx5: "CX-5", cx50: "CX-50", cx90: "CX-90",
  atlascrosssport: "Atlas Cross Sport",
  mustangmache: "Mustang Mach-E",
  silveradoev: "Silverado EV",
  modely: "Model Y", model3: "Model 3", modelx: "Model X", models: "Model S",
  "3series": "3 Series", "5series": "5 Series", "7series": "7 Series",
  cclass: "C-Class", eclass: "E-Class", sclass: "S-Class",
  etron: "e-tron", etrongt: "e-tron GT",
  mx5miata: "MX-5 Miata",
}

export function normalizeModelSlug(rawModel: string): string {
  const key = rawModel.toLowerCase().replace(/[\s_-]+/g, "").replace(/[^a-z0-9]/g, "")
  if (MODEL_SLUG_MAP[key]) return MODEL_SLUG_MAP[key]

  // Also check the raw lowercase with hyphens preserved
  const withHyphens = rawModel.toLowerCase().trim()
  if (MODEL_SLUG_MAP[withHyphens]) return MODEL_SLUG_MAP[withHyphens]

  // Fallback: insert hyphens before digit-letter and letter-digit boundaries
  // "f150" → "f-150", "cx5" → "cx-5"
  const slug = key
    .replace(/([a-z])(\d)/g, "$1-$2")
    .replace(/(\d)([a-z])/g, "$1-$2")
  return slug
}

export function getDisplayModelName(rawModel: string): string {
  const key = rawModel.toLowerCase().replace(/[\s_-]+/g, "").replace(/[^a-z0-9]/g, "")
  if (MODEL_DISPLAY_MAP[key]) return MODEL_DISPLAY_MAP[key]

  // Fallback: title case the raw model
  return rawModel
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/(\d)([a-z])/gi, "$1 $2")
    .replace(/([a-z])(\d)/gi, "$1-$2")
    .split(/[\s_-]+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ")
}

/**
 * Build Edmunds media CDN URLs for a vehicle.
 * Pattern: https://media.ed.edmunds-media.com/{make}/{model}/{year}/oem/{year}_{make}_{model}_{angle}_oem_{seq}_{size}.jpg
 *
 * Angle codes: f34 (front 3/4), r34 (rear 3/4), sd (side), ft (front), bk (back)
 */
export function getEdmundsVehicleImageUrl(
  make: string,
  model: string,
  year: number | string,
  angle: "f34" | "r34" | "sd" | "ft" | "bk" = "f34",
  size: 600 | 1600 = 600
): string {
  const m = make.toLowerCase().replace(/[^a-z0-9-]/g, "")
  const mod = normalizeModelSlug(model)
  return `https://media.ed.edmunds-media.com/${m}/${mod}/${year}/oem/${year}_${m}_${mod}_${angle}_oem_1_${size}.jpg`
}

/**
 * Get multiple candidate image URLs for a vehicle — tries multiple years and angles
 * so the frontend can cascade through them on error.
 */
export function getEdmundsVehicleImages(make: string, model: string, year: number | string): string[] {
  const numYear = typeof year === "string" ? parseInt(year, 10) : year
  const currentYear = new Date().getFullYear()
  // Try the given year, then current year, then previous year
  const years = [...new Set([numYear, currentYear, currentYear + 1, currentYear - 1].filter(y => y > 2018))]

  const urls: string[] = []
  for (const y of years) {
    urls.push(getEdmundsVehicleImageUrl(make, model, y, "f34", 600))
  }
  // Also add a side view for the primary year
  urls.push(getEdmundsVehicleImageUrl(make, model, years[0], "sd", 600))
  return urls
}

// ═══════════════════════════════════════════════════════════════
// UTILITY QUERIES
// ═══════════════════════════════════════════════════════════════

/**
 * Generic table explorer — useful for discovering what's available
 */
export async function describeTable(catalog: string, schema: string, table: string) {
  const result = await executeQuery(
    `DESCRIBE TABLE ${catalog}.${schema}.${table}`
  )
  return rowsToObjects(result)
}

/**
 * List tables in a schema — for dynamic discovery
 */
export async function listTables(catalog: string, schema: string) {
  const result = await executeQuery(
    `SHOW TABLES IN ${catalog}.${schema}`
  )
  return rowsToObjects(result)
}

/**
 * Run a raw SQL query — for hackathon exploration
 */
export async function rawQuery(sql: string, catalog = "public") {
  const result = await executeQuery(sql, catalog)
  return rowsToObjects(result)
}
