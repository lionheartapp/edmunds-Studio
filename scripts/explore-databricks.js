#!/usr/bin/env node
/**
 * Databricks Explorer - Run this locally to see what data is available
 *
 * Usage: node scripts/explore-databricks.js
 */

const WORKSPACE_URL = process.env.DATABRICKS_HOST || "https://edm-west.cloud.databricks.com";
const TOKEN = process.env.DATABRICKS_TOKEN;
if (!TOKEN) { console.error("Set DATABRICKS_TOKEN env var"); process.exit(1); }

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-Type": "application/json",
};

async function api(path) {
  try {
    const res = await fetch(`${WORKSPACE_URL}${path}`, { headers });
    if (!res.ok) return { error: `${res.status} ${res.statusText}` };
    return await res.json();
  } catch (e) {
    return { error: e.message };
  }
}

async function main() {
  console.log("🔍 Exploring your Databricks workspace...\n");

  // 1. Who am I?
  console.log("═══ CURRENT USER ═══");
  const me = await api("/api/2.0/preview/scim/v2/Me");
  if (me.displayName) console.log(`  User: ${me.displayName} (${me.userName})`);
  else console.log("  ", JSON.stringify(me, null, 2));

  // 2. List catalogs (Unity Catalog)
  console.log("\n═══ UNITY CATALOG - CATALOGS ═══");
  const catalogs = await api("/api/2.1/unity-catalog/catalogs");
  if (catalogs.catalogs) {
    for (const cat of catalogs.catalogs) {
      console.log(`  📁 ${cat.name} ${cat.comment ? `- ${cat.comment}` : ""}`);
    }
  } else {
    console.log("  No Unity Catalog or no access:", JSON.stringify(catalogs));
  }

  // 3. If catalogs exist, drill into schemas and tables
  if (catalogs.catalogs) {
    for (const cat of catalogs.catalogs) {
      console.log(`\n═══ SCHEMAS in "${cat.name}" ═══`);
      const schemas = await api(`/api/2.1/unity-catalog/schemas?catalog_name=${cat.name}`);
      if (schemas.schemas) {
        for (const schema of schemas.schemas) {
          console.log(`  📂 ${schema.full_name} ${schema.comment ? `- ${schema.comment}` : ""}`);

          // List tables in each schema
          const tables = await api(`/api/2.1/unity-catalog/tables?catalog_name=${cat.name}&schema_name=${schema.name}`);
          if (tables.tables) {
            for (const table of tables.tables.slice(0, 20)) {
              const cols = table.columns ? table.columns.map(c => c.name).join(", ") : "columns not listed";
              console.log(`    📋 ${table.name} (${table.table_type}) — [${cols}]`);
            }
            if (tables.tables.length > 20) {
              console.log(`    ... and ${tables.tables.length - 20} more tables`);
            }
          }
        }
      }
    }
  }

  // 4. SQL Warehouses
  console.log("\n═══ SQL WAREHOUSES ═══");
  const warehouses = await api("/api/2.0/sql/warehouses");
  if (warehouses.warehouses) {
    for (const wh of warehouses.warehouses) {
      console.log(`  🏭 ${wh.name} (${wh.state}) - ${wh.cluster_size} - ID: ${wh.id}`);
    }
  } else {
    console.log("  No SQL warehouses found:", JSON.stringify(warehouses));
  }

  // 5. Clusters
  console.log("\n═══ CLUSTERS ═══");
  const clusters = await api("/api/2.0/clusters/list");
  if (clusters.clusters) {
    for (const cl of clusters.clusters) {
      console.log(`  ⚡ ${cl.cluster_name} (${cl.state}) - ${cl.cluster_id}`);
    }
  } else {
    console.log("  No clusters found:", JSON.stringify(clusters));
  }

  // 6. List databases (legacy Hive metastore)
  console.log("\n═══ LEGACY DATABASES (Hive) ═══");
  const dbs = await api("/api/2.0/sql/statements", {
    method: "POST",
    // We can't POST with our simple api() helper, so try the legacy endpoint
  });
  // Try listing via different endpoint
  const legacyDbs = await api("/api/2.0/preview/scim/v2/Groups?filter=displayName+co+%22db%22");

  // 7. Jobs
  console.log("\n═══ RECENT JOBS ═══");
  const jobs = await api("/api/2.1/jobs/list?limit=10");
  if (jobs.jobs) {
    for (const job of jobs.jobs) {
      console.log(`  🔧 ${job.settings?.name || job.job_id}`);
    }
  } else {
    console.log("  No jobs found:", JSON.stringify(jobs));
  }

  // 8. Serving endpoints (ML models)
  console.log("\n═══ MODEL SERVING ENDPOINTS ═══");
  const endpoints = await api("/api/2.0/serving-endpoints");
  if (endpoints.endpoints) {
    for (const ep of endpoints.endpoints) {
      console.log(`  🤖 ${ep.name} (${ep.state?.ready})`);
    }
  } else {
    console.log("  No serving endpoints:", JSON.stringify(endpoints));
  }

  console.log("\n✅ Done! Copy/paste this output back to me and I'll build the integration.\n");
}

main().catch(console.error);
