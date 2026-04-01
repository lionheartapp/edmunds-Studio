"use client"

import { motion } from "framer-motion"
import { CampaignPerformance, PLATFORM_DIMENSIONS } from "@/lib/types"

interface CampaignDashboardProps {
  performance: CampaignPerformance[]
  insightSummary: string
  onCreateNext: () => void
}

export default function CampaignDashboard({
  performance,
  insightSummary,
  onCreateNext,
}: CampaignDashboardProps) {
  const totals = performance.reduce(
    (acc, p) => ({
      impressions: acc.impressions + p.impressions,
      clicks: acc.clicks + p.clicks,
      engagement: acc.engagement + p.engagement,
      spend: acc.spend + p.spend,
      conversions: acc.conversions + p.conversions,
    }),
    { impressions: 0, clicks: 0, engagement: 0, spend: 0, conversions: 0 }
  )

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h2 className="text-3xl font-bold mb-2">Campaign Performance</h2>
      <p className="text-gray-500 mb-8">Real-time results across all platforms</p>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Impressions" value={totals.impressions.toLocaleString()} />
        <MetricCard label="Clicks" value={totals.clicks.toLocaleString()} />
        <MetricCard label="Conversions" value={totals.conversions.toLocaleString()} />
        <MetricCard label="Total Spend" value={`$${totals.spend.toLocaleString()}`} />
      </div>

      {/* Claude Insight */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-blue-50 rounded-2xl mb-8"
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl">🧠</span>
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Claude&apos;s Insight</h3>
            <p className="text-blue-800">{insightSummary}</p>
          </div>
        </div>
      </motion.div>

      {/* Per-Platform Breakdown */}
      <div className="space-y-3 mb-8">
        {performance.map((p, i) => (
          <motion.div
            key={p.platform}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl"
          >
            <span className="font-medium text-sm w-32">
              {PLATFORM_DIMENSIONS[p.platform]?.label || p.platform}
            </span>
            <div className="flex-1 grid grid-cols-4 gap-4 text-sm text-gray-600">
              <span>{p.impressions.toLocaleString()} imp</span>
              <span>{p.clicks.toLocaleString()} clicks</span>
              <span>{(p.ctr * 100).toFixed(1)}% CTR</span>
              <span>{p.roas.toFixed(1)}x ROAS</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Next Campaign CTA */}
      <button
        onClick={onCreateNext}
        className="w-full py-4 bg-blue-600 text-white font-semibold rounded-2xl
                 hover:bg-blue-700 transition-colors text-lg"
      >
        Create Next Campaign →
      </button>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-4 bg-gray-50 rounded-xl text-center"
    >
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </motion.div>
  )
}
