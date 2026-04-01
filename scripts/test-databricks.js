#!/usr/bin/env node
/**
 * Test the Databricks integration end-to-end.
 * Run: node scripts/test-databricks.js
 *
 * This hits the local Next.js API route which talks to Databricks.
 * Make sure the dev server is running first: npm run dev
 */

const API = "http://localhost:3000/api/databricks"

async function test(label, body) {
  console.log(`\n🔍 ${label}...`)
  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (data.error) {
      console.log(`  ❌ ${data.error}`)
    } else {
      console.log(`  ✅ Success`)
      console.log(`  ${JSON.stringify(data).slice(0, 300)}...`)
    }
  } catch (e) {
    console.log(`  ❌ ${e.message}`)
  }
}

async function main() {
  console.log("═══ Edmunds Studio — Databricks Integration Test ═══\n")

  // Test individual endpoints
  await test("Inventory for Toyota", { action: "inventory", make: "Toyota", model: "RAV4" })
  await test("Incentives for Honda", { action: "incentives", make: "Honda" })
  await test("Market data for Rivian", { action: "market", make: "Rivian" })
  await test("Ad performance for Toyota", { action: "ad_performance", make: "Toyota" })
  await test("Shopper interest for Tesla", { action: "shopper_interest", make: "Tesla" })

  // Test the "all" endpoint
  await test("ALL data for Ford", { action: "all", make: "Ford", model: "F-150" })

  // Test table exploration
  await test("Explore inventory tables", { action: "explore", catalog: "public", schema: "inventory" })

  console.log("\n═══ Done! ═══\n")
}

main().catch(console.error)
