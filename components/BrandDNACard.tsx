"use client"

import { motion } from "framer-motion"
import { BrandDNA, AdSample, EdmundsAdsData, SocialAdsData, SocialAdFormatted } from "@/lib/types"
import { useEffect, useMemo, useState } from "react"
import SkeletonCard from "@/components/SkeletonCard"

interface EdmundsMarketInfo {
  inventory?: {
    totalInStock: number
    avgDaysOnLot: number
    avgSellingPrice: number
    avgMsrp: number
    topTrims?: { trim: string; count: number; avgPrice: number }[]
  } | null
  market?: {
    marketShare: number
    salesTrend: string
    avgTransactionPrice: number
    incentiveSpend: number
    daysToTurn: number
    shopperInterest?: { searchVolume: number; trend: string }
  } | null
  incentives?: { name: string; description: string; type?: string }[] | null
  dataSource: "databricks" | "api" | "mock"
}

interface BrandDNACardProps {
  brandDna: BrandDNA
  edmundsAds?: EdmundsAdsData | null
  socialAds?: SocialAdsData | null
  edmundsMarket?: EdmundsMarketInfo | null
  edmundsAdsLoading?: boolean
  socialAdsLoading?: boolean
  onContinue: () => void
}

/* ── Section Loader — animated blob with playful messages ── */

const edmundsLoadingMessages = [
  "Digging through Edmunds ad vaults...",
  "Counting impressions so you don't have to...",
  "Asking Databricks very nicely for the data...",
  "Pulling campaign numbers fresh off the lot...",
  "Snooping on ad performance (legally)...",
  "Crunching 30 days of ad activity...",
]

const socialLoadingMessages = [
  "Scrolling through Meta's ad library at superhuman speed...",
  "Scanning social ads...",
  "Finding out what the algorithm already knows...",
  "Judging ad creative so you don't have to...",
  "Intercepting social signals...",
  "Analyzing every carousel, reel, and story...",
]

function SectionLoader({ messages, label }: { messages: string[]; label: string }) {
  const [msgIndex, setMsgIndex] = useState(() => Math.floor(Math.random() * messages.length))

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % messages.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [messages.length])

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4 }}
      className="col-span-12"
    >
      <div
        role="status"
        aria-live="polite"
        className="relative rounded-2xl border border-white/[0.04] p-8 overflow-hidden bg-zinc-900/80"
      >
        <div className="flex items-center gap-5">
          {/* Animated blob */}
          <div className="relative w-12 h-12 flex-shrink-0">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                borderRadius: ["30% 70% 70% 30% / 30% 30% 70% 70%", "50% 50% 50% 50%", "30% 70% 70% 30% / 30% 30% 70% 70%"],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-eds-50/20 blur-sm"
            />
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                borderRadius: ["50% 50% 50% 50%", "30% 70% 70% 30% / 30% 30% 70% 70%", "50% 50% 50% 50%"],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
              className="absolute inset-1 bg-eds-50/30"
            />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-2 rounded-full border border-eds-60/30 border-t-eds-60/80"
            />
          </div>

          <div className="flex flex-col gap-1.5 min-w-0">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">{label}</span>
            <motion.span
              key={msgIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="text-sm text-zinc-300 font-medium"
            >
              {messages[msgIndex]}
            </motion.span>
            <span className="text-xs text-zinc-600 mt-1">Usually takes about 5-10 seconds</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
}

const cardVariant = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
}

export default function BrandDNACard({
  brandDna,
  edmundsAds,
  socialAds,
  edmundsMarket,
  edmundsAdsLoading,
  socialAdsLoading,
  onContinue,
}: BrandDNACardProps) {
  return (
    <div className="relative min-h-screen py-10 px-4 md:px-8">
      {/* Background ambient glow — consistent UI color, not brand-dependent */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full blur-3xl opacity-[0.07] pointer-events-none"
        style={{ background: "radial-gradient(circle, #2070E8, #4E91F5, transparent)" }}
      />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-6xl mx-auto"
      >
        {/* ── Bento Grid ──────────────────────────── */}
        <div className="grid grid-cols-12 gap-3 auto-rows-auto">

          {/* Row 1: Brand Color + Voice + Visual Style */}

          {/* Brand Color — wider card to fit label, thin swatch */}
          <GlassCard className="col-span-12 md:col-span-3 self-start" label="Brand Color" badge="AI-Inferred">
            <div className="flex items-center gap-3">
              <div
                className="w-16 h-10 rounded-lg border border-white/5 shadow-lg flex-shrink-0"
                style={{
                  backgroundColor: brandDna.colors.primary,
                  boxShadow: `0 4px 16px ${brandDna.colors.primary}30`,
                }}
              />
              <span className="text-xs font-mono text-zinc-500">{brandDna.colors.primary}</span>
            </div>
          </GlassCard>

          {/* Voice — spans remaining cols, compact */}
          <GlassCard className="col-span-12 md:col-span-5 self-start" label="Voice" badge="AI-Inferred">
            <div className="flex flex-wrap gap-2">
              {brandDna.voice.map((attr, i) => (
                <motion.span
                  key={attr}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="px-3 py-1.5 bg-eds-50/10 text-eds-60 rounded-lg text-sm font-medium
                           border border-eds-50/20 cursor-default hover:scale-105 hover:-translate-y-0.5 transition-transform"
                  style={{ boxShadow: "0 0 20px rgba(32, 112, 232, 0.05)" }}
                >
                  {attr}
                </motion.span>
              ))}
            </div>
          </GlassCard>

          {/* Visual Style — spans remaining cols, compact */}
          <GlassCard className="col-span-12 md:col-span-4 self-start" label="Visual Style" badge="AI-Inferred">
            <div className="flex flex-wrap gap-2">
              {brandDna.visualStyle.map((style, i) => (
                <motion.span
                  key={style}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="px-3 py-1.5 bg-zinc-800/80 text-zinc-300 rounded-lg text-sm font-medium
                           border border-zinc-700/50 cursor-default hover:scale-105 hover:-translate-y-0.5 transition-transform"
                >
                  {style}
                </motion.span>
              ))}
            </div>
          </GlassCard>

          {/* ── Edmunds Market Intelligence ── */}
          {edmundsMarket && (edmundsMarket.inventory || edmundsMarket.market) && (
            <GlassCard className="col-span-12" label={undefined}>
              {/* Custom header with Edmunds logo + right-aligned badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  {/* Edmunds car icon */}
                  <svg width="20" height="14" viewBox="0 0 260 175" fill="none" className="text-eds-60 flex-shrink-0">
                    <path fillRule="evenodd" clipRule="evenodd" d="M252.241 43.348C255.974 43.247 259.154 46.136 259.254 49.861H259.264L259.455 57.12C259.556 60.855 256.668 64.036 252.945 64.137L237.37 65.939C237.423 66.053 237.476 66.179 237.525 66.294L237.571 66.402C241.747 71.788 249.605 86.718 249.605 107.88C249.605 117.153 247.885 128.718 246.5 138.031C245.845 142.438 245.264 146.34 244.977 149.257V162.788C244.977 169.533 239.513 175 232.772 175H216.21C209.469 175 204.005 169.533 204.005 162.788V152.731C186.648 151.14 158.345 150.596 129.9 150.546C101.455 150.596 73.152 151.14 55.795 152.731V162.788C55.795 169.533 50.332 175 43.59 175H27.029C20.287 175 14.824 169.533 14.824 162.788V149.257C14.536 146.34 13.956 142.438 13.3 138.031C11.915 128.718 10.195 117.153 10.195 107.88C10.195 98.346 11.151 90.906 12.862 85.057C13.797 79.429 16.977 72.402 22.219 66.402L22.541 65.647L22.35 65.969L6.513 64.137C2.79 64.026 -0.098 60.845 0.003 57.12L0.184 49.861C0.294 46.136 3.474 43.247 7.197 43.348L22.098 43.76C25.459 43.851 28.135 46.438 28.558 49.67C28.679 50.546 28.89 51.412 29.131 52.267L31.013 48.553C37.09 37.307 45.391 23.797 53.732 15.29C53.732 15.29 61.057 6.299 75.748 3.329L75.828 3.309C88.627 0.581 109.465 -0.124 129.89 0.017C150.315 -0.124 171.153 0.571 183.932 3.299L183.95 3.305C183.971 3.313 183.988 3.319 184.012 3.319C198.702 6.289 206.027 15.28 206.027 15.28C214.369 23.787 222.67 37.307 228.747 48.542L230.427 51.855C230.618 51.14 230.779 50.405 230.88 49.67C231.313 46.438 233.989 43.851 237.34 43.76L252.241 43.348ZM34.585 107.236C35.329 114.726 41.387 120.787 48.873 121.532C58.985 122.538 67.427 114.102 66.42 103.974C65.676 96.484 59.619 90.423 52.133 89.678C42.021 88.671 33.579 97.108 34.585 107.236ZM193.309 107.236C194.054 114.726 200.111 120.787 207.597 121.532C217.709 122.538 226.151 114.102 225.145 103.974C224.4 96.484 218.343 90.423 210.857 89.678C200.745 88.671 192.303 97.108 193.309 107.236ZM62.547 51.975V39.19C62.547 34.861 66.873 31.357 72.226 31.357H95.71C101.063 31.357 105.39 34.861 105.39 39.19V51.965C105.39 52.72 105.249 53.455 104.997 54.15H108.016C111.678 54.14 115.381 54.14 119.124 54.15H140.686C144.429 54.14 148.132 54.14 151.794 54.15H156.604C160.742 54.209 165.145 54.302 167.636 54.355L168.889 54.382C186.628 54.835 203.109 56.053 217.588 59.123C213.946 49.801 206.269 34.851 197.153 25.428C195.543 23.847 189.264 18.229 179.867 16.578C175.289 15.873 158.888 13.427 133.391 13.427H126.409C100.912 13.427 84.511 15.873 79.933 16.578C70.526 18.229 64.257 23.847 62.647 25.428C53.531 34.851 45.854 49.801 42.212 59.123C49.024 57.684 56.288 56.657 63.905 55.922C63.06 54.764 62.547 53.425 62.547 51.975ZM129.729 134.388C132.476 134.297 135.243 133.995 138.02 133.472C157.962 129.716 173.427 115.662 180.259 97.631C170.61 108.625 151.352 114.323 129.729 114.565C108.106 114.313 88.858 108.625 79.199 97.631C86.031 115.662 101.496 129.716 121.438 133.472C124.215 133.985 126.982 134.287 129.729 134.388ZM164.201 28.236H187.675L187.685 28.246C193.038 28.246 197.365 31.749 197.365 36.078V48.854C197.365 49.679 197.164 50.505 196.952 51.119C192.012 45.139 182.101 41.434 175.943 41.434C167.502 41.434 159.875 45.34 154.934 51.32C154.522 50.495 154.522 49.669 154.522 48.844V36.068C154.522 31.739 158.848 28.236 164.201 28.236Z" fill="currentColor" />
                  </svg>
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Market Intelligence</span>
                </div>
                <span className={`text-xs uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  edmundsMarket.dataSource === "databricks"
                    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                    : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                }`}>
                  {edmundsMarket.dataSource === "databricks" ? "LIVE PRODUCTION DATA" : "EDMUNDS DATA"}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {edmundsMarket.inventory && (
                  <>
                    <MarketStat
                      label="National Inventory"
                      value={edmundsMarket.inventory.totalInStock?.toLocaleString() || "—"}
                      sub="vehicles in stock"
                    />
                    <MarketStat
                      label="Avg Days on Lot"
                      value={edmundsMarket.inventory.avgDaysOnLot?.toString() || "—"}
                      sub="days"
                    />
                    <MarketStat
                      label="Avg Selling Price"
                      value={`$${edmundsMarket.inventory.avgSellingPrice?.toLocaleString() || "—"}`}
                      sub={`MSRP $${edmundsMarket.inventory.avgMsrp?.toLocaleString() || "—"}`}
                    />
                  </>
                )}
                {edmundsMarket.market && (
                  <MarketStat
                    label="Market Share"
                    value={`${edmundsMarket.market.marketShare}%`}
                    sub={`Trend: ${edmundsMarket.market.salesTrend}`}
                  />
                )}
              </div>

              {/* Incentives row */}
              {edmundsMarket.incentives && edmundsMarket.incentives.length > 0 && (
                <div className="border-t border-white/[0.04] pt-3 mt-1">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider mb-2 block">Active Incentives</span>
                  <div className="flex flex-wrap gap-2">
                    {edmundsMarket.incentives.slice(0, 3).map((inc, i) => (
                      <div
                        key={i}
                        className="px-3 py-2 bg-emerald-500/5 border border-emerald-500/15 rounded-lg flex-1 min-w-[200px]"
                      >
                        <span className="text-xs font-medium text-emerald-300 block">{inc.name}</span>
                        <span className="text-xs text-zinc-400 line-clamp-1">{inc.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top trims */}
              {edmundsMarket.inventory?.topTrims && edmundsMarket.inventory.topTrims.length > 0 && (
                <div className="border-t border-white/[0.04] pt-3 mt-3">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider mb-2 block">Top Selling Trims</span>
                  <div className="flex flex-wrap gap-2">
                    {edmundsMarket.inventory.topTrims.map((trim, i) => (
                      <div
                        key={i}
                        className="px-3 py-2 bg-zinc-800/60 border border-zinc-700/30 rounded-lg"
                      >
                        <span className="text-xs font-medium text-zinc-200">{trim.trim}</span>
                        <span className="text-xs text-zinc-500 ml-2">{trim.count} units · ${trim.avgPrice.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </GlassCard>
          )}

          {/* ── Active on Edmunds — Real campaign data from Databricks ── */}
          {edmundsAdsLoading && (
            <>
              <SectionLoader messages={edmundsLoadingMessages} label="Active on Edmunds" />
              <div className="col-span-12 grid grid-cols-3 gap-3">
                <SkeletonCard lines={4} />
                <SkeletonCard lines={4} />
                <SkeletonCard lines={4} />
              </div>
            </>
          )}
          {!edmundsAdsLoading && edmundsAds && edmundsAds.models && edmundsAds.models.length > 0 && (
            <GlassCard className="col-span-12" label="Active on Edmunds">
              {/* Summary Stats Bar */}
              <div className="flex flex-wrap gap-4 mb-5">
                <EdmundsStat label="Impressions" value={formatNumber(edmundsAds.totalImpressions)} />
                <EdmundsStat label="Active Campaigns" value={edmundsAds.activeCampaigns.toString()} />
                <EdmundsStat label="Creatives" value={edmundsAds.totalCreatives.toString()} />
                {edmundsAds.totalSpend > 0 && (
                  <EdmundsStat label="Est. Spend (30d)" value={`$${formatNumber(edmundsAds.totalSpend)}`} />
                )}
                {edmundsAds.source === "databricks" && (
                  <span className="ml-auto text-xs text-emerald-500/70 bg-emerald-500/10 px-2 py-1 rounded-full self-center border border-emerald-500/20">
                    LIVE DATA
                  </span>
                )}
              </div>

              {/* Model Cards — with real vehicle images */}
              <div className="overflow-x-auto md:overflow-x-visible -mx-5 md:mx-0 px-5 md:px-0 pb-4">
                <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-3 min-w-min md:min-w-fit">
                  {edmundsAds.models.slice(0, 3).map((model, i) => (
                    <EdmundsModelCard
                      key={model.targetedModel}
                      model={model}
                      brandName={brandDna.name}
                      index={i}
                    />
                  ))}
                </div>
              </div>
            </GlassCard>
          )}

          {/* ── No Edmunds Ads — visual opportunity showcase ── */}
          {!edmundsAdsLoading && (!edmundsAds || !edmundsAds.models || edmundsAds.models.length === 0) && (
            <motion.div variants={cardVariant} className="col-span-12">
              {/* Section header */}
              <div className="flex items-center gap-2.5 mb-4">
                <svg width="18" height="13" viewBox="0 0 260 175" fill="none" className="text-eds-60 flex-shrink-0">
                  <path fillRule="evenodd" clipRule="evenodd" d="M252.241 43.348C255.974 43.247 259.154 46.136 259.254 49.861H259.264L259.455 57.12C259.556 60.855 256.668 64.036 252.945 64.137L237.37 65.939C237.423 66.053 237.476 66.179 237.525 66.294L237.571 66.402C241.747 71.788 249.605 86.718 249.605 107.88C249.605 117.153 247.885 128.718 246.5 138.031C245.845 142.438 245.264 146.34 244.977 149.257V162.788C244.977 169.533 239.513 175 232.772 175H216.21C209.469 175 204.005 169.533 204.005 162.788V152.731C186.648 151.14 158.345 150.596 129.9 150.546C101.455 150.596 73.152 151.14 55.795 152.731V162.788C55.795 169.533 50.332 175 43.59 175H27.029C20.287 175 14.824 169.533 14.824 162.788V149.257C14.536 146.34 13.956 142.438 13.3 138.031C11.915 128.718 10.195 117.153 10.195 107.88C10.195 98.346 11.151 90.906 12.862 85.057C13.797 79.429 16.977 72.402 22.219 66.402L22.541 65.647L22.35 65.969L6.513 64.137C2.79 64.026 -0.098 60.845 0.003 57.12L0.184 49.861C0.294 46.136 3.474 43.247 7.197 43.348L22.098 43.76C25.459 43.851 28.135 46.438 28.558 49.67C28.679 50.546 28.89 51.412 29.131 52.267L31.013 48.553C37.09 37.307 45.391 23.797 53.732 15.29C53.732 15.29 61.057 6.299 75.748 3.329L75.828 3.309C88.627 0.581 109.465 -0.124 129.89 0.017C150.315 -0.124 171.153 0.571 183.932 3.299L183.95 3.305C183.971 3.313 183.988 3.319 184.012 3.319C198.702 6.289 206.027 15.28 206.027 15.28C214.369 23.787 222.67 37.307 228.747 48.542L230.427 51.855C230.618 51.14 230.779 50.405 230.88 49.67C231.313 46.438 233.989 43.851 237.34 43.76L252.241 43.348ZM34.585 107.236C35.329 114.726 41.387 120.787 48.873 121.532C58.985 122.538 67.427 114.102 66.42 103.974C65.676 96.484 59.619 90.423 52.133 89.678C42.021 88.671 33.579 97.108 34.585 107.236ZM193.309 107.236C194.054 114.726 200.111 120.787 207.597 121.532C217.709 122.538 226.151 114.102 225.145 103.974C224.4 96.484 218.343 90.423 210.857 89.678C200.745 88.671 192.303 97.108 193.309 107.236ZM62.547 51.975V39.19C62.547 34.861 66.873 31.357 72.226 31.357H95.71C101.063 31.357 105.39 34.861 105.39 39.19V51.965C105.39 52.72 105.249 53.455 104.997 54.15H108.016C111.678 54.14 115.381 54.14 119.124 54.15H140.686C144.429 54.14 148.132 54.14 151.794 54.15H156.604C160.742 54.209 165.145 54.302 167.636 54.355L168.889 54.382C186.628 54.835 203.109 56.053 217.588 59.123C213.946 49.801 206.269 34.851 197.153 25.428C195.543 23.847 189.264 18.229 179.867 16.578C175.289 15.873 158.888 13.427 133.391 13.427H126.409C100.912 13.427 84.511 15.873 79.933 16.578C70.526 18.229 64.257 23.847 62.647 25.428C53.531 34.851 45.854 49.801 42.212 59.123C49.024 57.684 56.288 56.657 63.905 55.922C63.06 54.764 62.547 53.425 62.547 51.975ZM129.729 134.388C132.476 134.297 135.243 133.995 138.02 133.472C157.962 129.716 173.427 115.662 180.259 97.631C170.61 108.625 151.352 114.323 129.729 114.565C108.106 114.313 88.858 108.625 79.199 97.631C86.031 115.662 101.496 129.716 121.438 133.472C124.215 133.985 126.982 134.287 129.729 134.388ZM164.201 28.236H187.675L187.685 28.246C193.038 28.246 197.365 31.749 197.365 36.078V48.854C197.365 49.679 197.164 50.505 196.952 51.119C192.012 45.139 182.101 41.434 175.943 41.434C167.502 41.434 159.875 45.34 154.934 51.32C154.522 50.495 154.522 49.669 154.522 48.844V36.068C154.522 31.739 158.848 28.236 164.201 28.236Z" fill="currentColor" />
                </svg>
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Edmunds Advertising</span>
              </div>

              {/* Visual ad placement grid — inspired by real ad collages */}
              <div className="grid grid-cols-12 gap-3">
                {/* Hero card — large left */}
                <div className="col-span-12 md:col-span-5 relative rounded-2xl overflow-hidden border border-white/[0.04]" style={{ background: `linear-gradient(135deg, ${brandDna.colors.primary}20, ${brandDna.colors.primary}05)` }}>
                  <div className="p-6 h-full flex flex-col justify-between min-h-[260px]">
                    {/* Brand logo area */}
                    <div className="flex items-center gap-3">
                      {brandDna.logoUrl && (
                        <img src={brandDna.logoUrl} alt={brandDna.name} className="w-8 h-8 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                      )}
                      <span className="text-sm font-semibold text-zinc-300">{brandDna.name}</span>
                    </div>
                    {/* CTA mockup */}
                    <div>
                      <p className="text-2xl font-bold text-white mb-2 leading-tight">Your ad<br />could be here</p>
                      <p className="text-sm text-zinc-400 mb-4">Reach shoppers actively researching {brandDna.name} vehicles on Edmunds</p>
                      <div className="inline-flex px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: brandDna.colors.primary }}>
                        Shop Now
                      </div>
                    </div>
                  </div>
                  {/* Decorative gradient orb */}
                  <div className="absolute top-[-40px] right-[-40px] w-48 h-48 rounded-full opacity-20" style={{ background: `radial-gradient(circle, ${brandDna.colors.primary}, transparent)` }} />
                </div>

                {/* Right column — stacked cards */}
                <div className="col-span-12 md:col-span-7 grid grid-cols-2 gap-3">
                  {/* Stat card 1 */}
                  <div className="relative rounded-xl overflow-hidden border border-white/[0.04] p-5 flex flex-col justify-between" style={{ background: "rgba(24, 24, 27, 0.9)" }}>
                    <span className="text-3xl font-bold text-eds-60">20M+</span>
                    <div>
                      <p className="text-sm font-medium text-zinc-200 mt-2">Monthly Shoppers</p>
                      <p className="text-xs text-zinc-500 mt-1">In-market buyers actively researching vehicles</p>
                    </div>
                  </div>

                  {/* Stat card 2 */}
                  <div className="relative rounded-xl overflow-hidden border border-white/[0.04] p-5 flex flex-col justify-between" style={{ background: "rgba(24, 24, 27, 0.9)" }}>
                    <span className="text-3xl font-bold text-eds-60">3.2x</span>
                    <div>
                      <p className="text-sm font-medium text-zinc-200 mt-2">Purchase Intent</p>
                      <p className="text-xs text-zinc-500 mt-1">vs. social media ad engagement</p>
                    </div>
                  </div>

                  {/* Wide bottom card — visual placement mockup */}
                  <div className="col-span-2 relative rounded-xl overflow-hidden border border-white/[0.04]" style={{ background: "rgba(24, 24, 27, 0.9)" }}>
                    <div className="flex items-stretch">
                      {/* Left: placement visual */}
                      <div className="flex-1 p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-5 h-5 rounded bg-emerald-500/20 flex items-center justify-center">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-400">
                              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Opportunity</span>
                        </div>
                        <p className="text-sm font-medium text-zinc-200 mb-1">
                          {brandDna.name} isn&apos;t on Edmunds yet
                        </p>
                        <p className="text-xs text-zinc-500">
                          84% of Edmunds shoppers visit a dealer within 30 days. Average cost per engaged shopper: $0.12.
                        </p>
                      </div>
                      {/* Right: ad format previews */}
                      <div className="w-36 md:w-48 flex-shrink-0 p-3 border-l border-white/[0.04] flex flex-col gap-2">
                        <span className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">Ad Formats</span>
                        {["Display Banner", "Spotlight", "Native Content", "Video Pre-Roll"].map((format) => (
                          <div key={format} className="flex items-center gap-2">
                            <div className="w-6 h-4 rounded-sm border border-eds-50/30" style={{ background: `linear-gradient(135deg, ${brandDna.colors.primary}15, ${brandDna.colors.primary}05)` }} />
                            <span className="text-[11px] text-zinc-400">{format}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Social Ad Intelligence — Real Meta ads or AI fallback ── */}
          {socialAdsLoading && (
            <>
              <SectionLoader messages={socialLoadingMessages} label="Social Ad Intelligence" />
              <div className="col-span-12 grid grid-cols-3 gap-3">
                <SkeletonCard lines={4} />
                <SkeletonCard lines={4} />
                <SkeletonCard lines={4} />
              </div>
            </>
          )}
          {!socialAdsLoading && socialAds && socialAds.ads.length > 0 && (
            <GlassCard className="col-span-12" label="Social Ad Intelligence">
              {/* Source badge + meta info */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs text-zinc-500">
                  {socialAds.totalCount} active ad{socialAds.totalCount !== 1 ? "s" : ""} found
                  {socialAds.pageName ? ` for ${socialAds.pageName}` : ""}
                </span>
                {socialAds.source === "meta_api" && (
                  <span className="text-xs text-blue-400/70 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-400/20">
                    META AD LIBRARY
                  </span>
                )}
                <a
                  href={`https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=US&q=${encodeURIComponent(brandDna.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-xs text-eds-60 hover:text-eds-70 transition-colors"
                >
                  View in Ad Library →
                </a>
              </div>

              <div className="overflow-x-auto md:overflow-x-visible -mx-5 md:mx-0 px-5 md:px-0 pb-4">
                <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-3 min-w-min md:min-w-fit">
                  {socialAds.ads.slice(0, 3).map((ad, i) => (
                    <SocialAdCard
                      key={ad.id}
                      ad={ad}
                      colors={brandDna.colors}
                      index={i}
                    />
                  ))}
                </div>
              </div>
            </GlassCard>
          )}
          {!socialAdsLoading && !(socialAds && socialAds.ads.length > 0) && brandDna.currentAds.length > 0 && (
            <GlassCard className="col-span-12" label="Social Ad Intelligence">
              <div className="overflow-x-auto md:overflow-x-visible -mx-5 md:mx-0 px-5 md:px-0 pb-4">
                <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-3 min-w-min md:min-w-fit">
                  {brandDna.currentAds.slice(0, 3).map((ad, i) => (
                    <AdMockupCard
                      key={i}
                      ad={ad}
                      colors={brandDna.colors}
                      index={i}
                    />
                  ))}
                </div>
              </div>
            </GlassCard>
          )}
        </div>

        {/* Continue Button */}
        <motion.div variants={cardVariant} className="mt-6">
          <motion.button
            whileTap={{ scale: 0.995 }}
            onClick={onContinue}
            className="w-full py-4 font-semibold rounded-xl transition-all text-base text-white bg-eds-50 hover:bg-eds-60 hover:scale-[1.005] active:scale-[0.98]"
            style={{
              boxShadow: "0 0 30px rgba(32, 112, 232, 0.25)",
            }}
          >
            See What Your Competitors Are Doing →
          </motion.button>
          <p className="text-center text-xs text-zinc-600 mt-3">
            Review your brand analysis above before continuing
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}

/* ── Market Stat Card ─────────────────────────── */

function MarketStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3 bg-zinc-800/40 rounded-xl border border-zinc-700/20">
      <span className="text-xs text-zinc-500 uppercase tracking-wider">{label}</span>
      <span className="text-lg font-bold text-zinc-100">{value}</span>
      {sub && <span className="text-xs text-zinc-500">{sub}</span>}
    </div>
  )
}

/* ── Edmunds Stat Pill ────────────────────────── */

function EdmundsStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 px-3 py-2 bg-zinc-800/60 rounded-lg border border-zinc-700/30">
      <span className="text-xs text-zinc-500 uppercase tracking-wider">{label}</span>
      <span className="text-sm font-semibold text-zinc-200">{value}</span>
    </div>
  )
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`
  return n.toString()
}

/* ── Edmunds Model Card — Real vehicle image + stats ── */

function EdmundsModelCard({
  model,
  brandName,
  index,
}: {
  model: {
    targetedModel: string
    targetedModelYear: string
    totalImpressions: number
    totalClicks: number
    totalRevenue: number
    viewabilityPct: number
    uniqueCreatives: number
    topStates: string[]
    vehicleImages: string[]
    displayName?: string
  }
  brandName: string
  index: number
}) {
  // Cascade through image URLs on failure
  const [imgIndex, setImgIndex] = useState(0)
  const [allFailed, setAllFailed] = useState(false)
  const images = model.vehicleImages || []
  const rawImage = images[imgIndex]
  // Proxy edmunds-media.com images to avoid CORS blocks
  const currentImage = rawImage?.includes("edmunds-media.com")
    ? `/api/image-proxy?url=${encodeURIComponent(rawImage)}`
    : rawImage

  const handleImageError = () => {
    if (imgIndex < images.length - 1) {
      setImgIndex(prev => prev + 1)
    } else {
      setAllFailed(true)
    }
  }

  // Use display name if available, otherwise clean up the raw model name
  const displayName = model.displayName || model.targetedModel

  const ctr = model.totalImpressions > 0
    ? ((model.totalClicks / model.totalImpressions) * 100).toFixed(2)
    : "0"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
      className="group relative w-80 md:w-full flex-shrink-0 md:flex-shrink rounded-2xl border border-white/[0.04] overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-2xl"
      style={{
        background: "rgba(24, 24, 27, 0.9)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      {/* Vehicle Image or Gradient Fallback */}
      <div className="relative w-full h-48 overflow-hidden border-b border-white/[0.04] bg-zinc-900">
        {currentImage && !allFailed ? (
          <img
            src={currentImage}
            alt={`${brandName} ${displayName}`}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.1) 100%)" }}
          >
            <span className="text-3xl font-bold text-white/20">{displayName}</span>
          </div>
        )}

        {/* Model Year + Model Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="text-xs font-bold text-white/90 uppercase tracking-wider bg-black/60
                         px-2.5 py-1 rounded-full border border-white/10">
            {model.targetedModelYear} {displayName}
          </span>
        </div>

        {/* Edmunds badge */}
        <div className="absolute top-3 right-3">
          <span className="text-xs font-bold text-blue-300 uppercase tracking-wider bg-blue-500/20
                         px-2 py-1 rounded-full border border-blue-400/20">
            Edmunds.com
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="relative p-4 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Impressions</span>
            <span className="text-sm font-semibold text-zinc-200">{formatNumber(model.totalImpressions)}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Clicks</span>
            <span className="text-sm font-semibold text-zinc-200">{formatNumber(model.totalClicks)}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">CTR</span>
            <span className="text-sm font-semibold text-emerald-400">{ctr}%</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Viewability</span>
            <span className="text-sm font-semibold text-zinc-200">{model.viewabilityPct}%</span>
          </div>
        </div>

        {/* Revenue + Creatives */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
          {model.totalRevenue > 0 && (
            <span className="text-xs text-amber-400/80">
              ${formatNumber(model.totalRevenue)} revenue
            </span>
          )}
          <span className="text-xs text-zinc-500">
            {model.uniqueCreatives} creatives
          </span>
        </div>

        {/* Top States */}
        {model.topStates && model.topStates.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-zinc-600">Top markets:</span>
            {model.topStates.slice(0, 4).map(state => (
              <span key={state} className="text-xs px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400 border border-zinc-700/40">
                {state}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

/* ── Social Ad Card — Real Meta Ad Library data ── */

function SocialAdCard({
  ad,
  colors,
  index,
}: {
  ad: SocialAdFormatted
  colors: BrandDNA["colors"]
  index: number
}) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)

  const platformIcon = useMemo(() => {
    if (ad.platform === "Instagram") return "IG"
    if (ad.platform === "Facebook") return "FB"
    return ad.platform.slice(0, 2).toUpperCase()
  }, [ad.platform])

  const platformColors = useMemo(() => {
    if (ad.platform === "Instagram") return { bg: "bg-pink-500/10", text: "text-pink-300", border: "border-pink-500/20" }
    return { bg: "bg-blue-500/10", text: "text-blue-300", border: "border-blue-500/20" }
  }, [ad.platform])

  const hasValidSnapshot = ad.snapshotUrl && ad.snapshotUrl !== "https://www.facebook.com/ads/library/?id=mock"
  const hasScreenshot = !!ad.screenshotUrl

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
      className="group relative w-80 md:w-full flex-shrink-0 md:flex-shrink rounded-2xl border border-white/[0.04] overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-2xl"
      style={{
        background: "rgba(24, 24, 27, 0.9)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      {/* Visual Header — Screenshot image, or gradient fallback */}
      <div
        className="relative w-full overflow-hidden border-b border-white/[0.04]"
        style={{ minHeight: hasScreenshot && !imageFailed ? "280px" : "144px" }}
      >
        {/* Screenshot image from /api/ad-screenshot pipeline */}
        {hasScreenshot && !imageFailed && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ad.screenshotUrl}
              alt={`${ad.headline || "Ad"} — ${ad.platform}`}
              className="w-full object-cover object-top"
              style={{
                height: "280px",
                opacity: imageLoaded ? 1 : 0,
                transition: "opacity 0.3s ease",
              }}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageFailed(true)}
            />
            {/* Shimmer skeleton while image loads */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-full border-2 border-eds-50/30 border-t-eds-50 animate-spin-slow" />
                  <span className="text-xs text-zinc-500">Loading ad preview...</span>
                </div>
              </div>
            )}
          </>
        )}

        {/* Gradient fallback — shown when no screenshot or image failed */}
        {(!hasScreenshot || imageFailed) && (
          <div
            className="w-full h-36"
            style={{
              background: ad.platform === "Instagram"
                ? `linear-gradient(135deg, ${colors.primary}30, #E1306C20, ${colors.accent}15)`
                : `linear-gradient(135deg, ${colors.primary}30, #1877F220, ${colors.secondary}15)`,
            }}
          >
            {/* Centered brand mark */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl font-black text-white/[0.06] uppercase tracking-widest">
                {ad.platform === "Instagram" ? "IG" : "FB"}
              </span>
            </div>
          </div>
        )}

        {/* Platform badge — always visible, floated over the content */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
          <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full
                         ${platformColors.bg} ${platformColors.text} border ${platformColors.border}`}>
            {platformIcon} · {ad.format}
          </span>
          {ad.isActive && (
            <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Active
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="relative p-4 flex flex-col gap-2.5">
        {/* Headline */}
        {ad.headline && (
          <p className="text-sm font-semibold text-zinc-200 line-clamp-2 leading-snug">
            {ad.headline}
          </p>
        )}

        {/* Body text */}
        {ad.bodyText && (
          <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
            {ad.bodyText}
          </p>
        )}

        {/* CTA Button — white outline, fills brand primary on hover */}
        <motion.button
          className="relative w-full py-2.5 rounded-lg font-medium text-sm overflow-hidden
                   transition-all duration-300 mt-1 border"
          style={{
            borderColor: "rgba(255,255,255,0.25)",
            color: "white",
            background: "transparent",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.primary
            e.currentTarget.style.borderColor = colors.primary
            e.currentTarget.style.boxShadow = `0 4px 16px ${colors.primary}40`
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent"
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"
            e.currentTarget.style.boxShadow = "none"
          }}
        >
          {ad.cta}
        </motion.button>

        {/* Stats footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
          {ad.impressionsRange && (
            <span className="text-xs text-zinc-500">
              <span className="text-emerald-400/80">{ad.impressionsRange}</span> impressions
            </span>
          )}
          {ad.spendRange && (
            <span className="text-xs text-amber-400/80">
              {ad.spendRange}
            </span>
          )}
        </div>

        {/* Date + snapshot link */}
        <div className="flex items-center justify-between">
          {ad.dateSpotted && (
            <span className="text-xs text-zinc-600">
              Running since {ad.dateSpotted}
            </span>
          )}
          {hasValidSnapshot && (
            <a
              href={ad.snapshotUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-eds-60 hover:text-eds-70 transition-colors"
            >
              View Original →
            </a>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/* ── Ad Mockup Card Component ──────────────────── */

function AdMockupCard({
  ad,
  colors,
  index,
}: {
  ad: AdSample
  colors: BrandDNA["colors"]
  index: number
}) {
  const visualGradient = useMemo(() => {
    const gradients = [
      `linear-gradient(135deg, ${colors.primary}40 0%, ${colors.accent}20 50%, ${colors.secondary}10 100%)`,
      `linear-gradient(45deg, ${colors.secondary}35 0%, ${colors.primary}15 50%, ${colors.accent}25 100%)`,
      `linear-gradient(180deg, ${colors.accent}30 0%, ${colors.primary}25 50%, transparent 100%)`,
    ]
    return gradients[index % gradients.length]
  }, [colors, index])

  const formatBadgeColor = useMemo(() => {
    const badges = [
      { bg: "bg-blue-500/10", text: "text-blue-300" },
      { bg: "bg-eds-40/10", text: "text-eds-70" },
      { bg: "bg-pink-500/10", text: "text-pink-300" },
    ]
    return badges[index % badges.length]
  }, [index])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
      className="group relative w-80 md:w-full flex-shrink-0 md:flex-shrink rounded-2xl border border-white/[0.04]
                 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl"
      style={{
        background: "rgba(24, 24, 27, 0.9)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      {/* Animated glow on hover */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${colors.primary}20, transparent 70%)`,
        }}
      />

      {/* Visual Preview Area */}
      <div
        className="relative w-full h-48 overflow-hidden border-b border-white/[0.04]"
        style={{ background: visualGradient }}
      >
        {/* Geometric shapes for visual interest */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute -top-20 -right-20 w-40 h-40 rounded-full border border-current animate-orb-rotate-20s"
            style={{ color: colors.primary }}
          />
          <div
            className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full border border-current animate-orb-rotate-25s"
            style={{ color: colors.accent }}
          />
        </div>

        {/* Platform + Format Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="text-xs font-bold text-white/80 uppercase tracking-wider bg-black/60
                         px-2.5 py-1 rounded-full border border-white/10">
            {ad.platform}
          </span>
          <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full
                         ${formatBadgeColor.bg} ${formatBadgeColor.text}`}>
            {ad.format}
          </span>
        </div>

        {/* Shimmer effect on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 animate-shimmer-effect"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
            backgroundSize: "200% 100%",
          }}
        />
      </div>

      {/* Content Area */}
      <div className="relative p-4 flex flex-col gap-3">
        {/* Headline */}
        <div>
          <p className="text-sm font-semibold text-zinc-200 line-clamp-2 leading-snug">
            "{ad.headline}"
          </p>
        </div>

        {/* Body Text Preview */}
        {ad.bodyText && (
          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
            {ad.bodyText}
          </p>
        )}

        {/* CTA Button — white outline, fills brand primary on hover */}
        <motion.button
          className="relative w-full py-2.5 rounded-lg font-medium text-sm overflow-hidden
                   transition-all duration-300 mt-2 group/btn border"
          style={{
            borderColor: `rgba(255,255,255,0.25)`,
            color: "white",
            background: "transparent",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.primary
            e.currentTarget.style.borderColor = colors.primary
            e.currentTarget.style.boxShadow = `0 4px 16px ${colors.primary}40`
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent"
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"
            e.currentTarget.style.boxShadow = "none"
          }}
        >
          <span className="relative z-10 flex items-center justify-center gap-1.5">
            {ad.cta}
            <span className="group-hover/btn:translate-x-0.5 transition-transform">→</span>
          </span>
        </motion.button>

        {/* Footer Stats */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
          <div className="text-xs text-zinc-500">
            {ad.engagementRate && (
              <span className="text-green-400/80">
                {ad.engagementRate.toFixed(1)}% engagement
              </span>
            )}
          </div>
          <div className="text-xs text-zinc-500">
            {ad.estimatedSpend && (
              <span className="text-amber-400/80">{ad.estimatedSpend}</span>
            )}
          </div>
        </div>

        {/* Date Spotted */}
        {ad.dateSpotted && (
          <div className="text-xs text-zinc-600 text-center">
            Spotted {ad.dateSpotted}
          </div>
        )}
      </div>

      {/* View Details Overlay (appears on hover) */}
      <div
        className="absolute inset-0 bg-black/60 flex items-center justify-center
                 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
      >
        <span className="text-sm font-medium text-white">View Full Details</span>
      </div>
    </motion.div>
  )
}

/* ── Glass Card Component ─────────────────────── */

function GlassCard({
  children,
  className = "",
  label,
  badge,
}: {
  children: React.ReactNode
  className?: string
  label?: string
  badge?: string
}) {
  return (
    <motion.div
      variants={cardVariant}
      className={`relative p-5 rounded-2xl border border-white/[0.04] overflow-hidden transition-colors hover:border-white/[0.08] ${className}`}
      style={{
        background: "rgba(24, 24, 27, 0.9)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      {/* Subtle top highlight */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 50%, transparent)",
        }}
      />

      {label && (
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider whitespace-nowrap">
            {label}
          </span>
          {badge && (
            <span className="text-xs uppercase tracking-wider px-2 py-0.5 rounded-full text-zinc-400 bg-zinc-800/60 border border-zinc-700/30 whitespace-nowrap flex-shrink-0">
              {badge}
            </span>
          )}
        </div>
      )}
      {children}
    </motion.div>
  )
}
