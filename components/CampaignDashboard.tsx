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
    <div className="max-w-4xl mx-auto p-8 bg-zinc-950 min-h-screen">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-3xl font-bold mb-2 accent-gradient-text"
      >
        Campaign Performance
      </motion.h2>
      <p className="text-zinc-400 mb-8">Real-time results across all platforms</p>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Impressions" value={totals.impressions.toLocaleString()} />
        <MetricCard label="Clicks" value={totals.clicks.toLocaleString()} />
        <MetricCard label="Conversions" value={totals.conversions.toLocaleString()} />
        <MetricCard label="Total Spend" value={`$${totals.spend.toLocaleString()}`} />
      </div>

      {/* Claude Insight - Indigo-tinted Glass */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-indigo-500/5 backdrop-blur border border-indigo-500/20 rounded-xl mb-8"
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">🧠</span>
          <div>
            <h3 className="font-semibold text-indigo-300 mb-1">Claude&apos;s Insight</h3>
            <p className="text-zinc-300">{insightSummary}</p>
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
            className="flex items-center gap-4 p-4 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors"
          >
            <span className="font-medium text-sm w-32 text-zinc-100">
              {PLATFORM_DIMENSIONS[p.platform]?.label || p.platform}
            </span>
            <div className="flex-1 grid grid-cols-4 gap-4 text-sm text-zinc-400">
              <span>{p.impressions.toLocaleString()} imp</span>
              <span>{p.clicks.toLocaleString()} clicks</span>
              <span>{(p.ctr * 100).toFixed(1)}% CTR</span>
              <span>{p.roas.toFixed(1)}x ROAS</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Next Campaign CTA */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={onCreateNext}
        className="w-full py-4 bg-indigo-600 text-zinc-100 font-semibold rounded-xl
                 hover:bg-indigo-500 transition-colors text-lg glow-sm shadow-lg shadow-indigo-500/20"
      >
        Create Next Campaign →
      </motion.button>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg text-center hover:border-indigo-500/30 transition-colors"
    >
      <p className="text-2xl font-bold text-zinc-100">{value}</p>
      <p className="text-xs text-zinc-400 mt-1">{label}</p>
    </motion.div>
  )
}
