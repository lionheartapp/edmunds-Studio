"use client"

import { motion } from "framer-motion"
import { BrandDNA, AdSample } from "@/lib/types"
import { useMemo } from "react"

interface BrandDNACardProps {
  brandDna: BrandDNA
  onContinue: () => void
  onEdit?: (field: string) => void
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
  onContinue,
  onEdit,
}: BrandDNACardProps) {
  return (
    <div className="relative min-h-screen py-10 px-4 md:px-8">
      {/* Background ambient glow based on brand color */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full blur-3xl opacity-[0.07] pointer-events-none"
        style={{ background: `radial-gradient(circle, ${brandDna.colors.primary}, ${brandDna.colors.accent}, transparent)` }}
      />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-6xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={cardVariant} className="mb-6 flex items-end justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: brandDna.colors.primary, boxShadow: `0 0 12px ${brandDna.colors.primary}60` }}
              />
              <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
                Brand DNA
              </span>
            </div>
            <h2 className="text-4xl font-bold tracking-tight">{brandDna.name}</h2>
            <p className="text-zinc-500 mt-1 text-sm">{brandDna.domain}</p>
          </div>
        </motion.div>

        {/* ── Bento Grid ──────────────────────────── */}
        <div className="grid grid-cols-12 gap-3 auto-rows-auto">

          {/* Colors — spans 5 cols */}
          <GlassCard className="col-span-12 md:col-span-5" onEdit={() => onEdit?.("colors")} label="Colors">
            <div className="flex gap-3 mt-1">
              {Object.entries(brandDna.colors).map(([name, hex]) => (
                <motion.div
                  key={name}
                  whileHover={{ scale: 1.08, y: -4 }}
                  className="flex flex-col items-center gap-2 flex-1"
                >
                  <div
                    className="w-full aspect-square rounded-2xl border border-white/5 shadow-lg"
                    style={{
                      backgroundColor: hex,
                      boxShadow: `0 8px 32px ${hex}30`,
                    }}
                  />
                  <span className="text-[10px] text-zinc-500 capitalize">{name}</span>
                  <span className="text-[10px] font-mono text-zinc-600">{hex}</span>
                </motion.div>
              ))}
            </div>
          </GlassCard>

          {/* Typography — spans 4 cols */}
          <GlassCard className="col-span-12 md:col-span-4" onEdit={() => onEdit?.("typography")} label="Typography">
            <div className="flex flex-col justify-center h-full">
              <p
                className="text-3xl text-zinc-100 tracking-tight"
                style={{ fontWeight: parseInt(brandDna.typography.headingWeight) || 700 }}
              >
                {brandDna.typography.primaryFont}
              </p>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-[11px] px-2 py-1 bg-zinc-800 rounded-md text-zinc-400 border border-zinc-700/50">
                  {brandDna.typography.fallback}
                </span>
                <span className="text-[11px] px-2 py-1 bg-zinc-800 rounded-md text-zinc-400 border border-zinc-700/50">
                  Weight {brandDna.typography.headingWeight}
                </span>
              </div>
            </div>
          </GlassCard>

          {/* Competitors — spans 3 cols */}
          <GlassCard className="col-span-12 md:col-span-3" label="Competitors">
            <div className="flex flex-col gap-2">
              {brandDna.competitors.map((comp, i) => (
                <motion.div
                  key={comp}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-2.5 px-3 py-2 bg-zinc-800/50 rounded-lg border border-zinc-700/30"
                >
                  <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                    {i + 1}
                  </div>
                  <span className="text-sm text-zinc-300">{comp}</span>
                </motion.div>
              ))}
            </div>
          </GlassCard>

          {/* Voice — spans 6 cols */}
          <GlassCard className="col-span-12 md:col-span-6" onEdit={() => onEdit?.("voice")} label="Voice">
            <div className="flex flex-wrap gap-2">
              {brandDna.voice.map((attr, i) => (
                <motion.span
                  key={attr}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="px-4 py-2 bg-indigo-500/10 text-indigo-400 rounded-xl text-sm font-medium
                           border border-indigo-500/20 backdrop-blur-sm cursor-default"
                  style={{ boxShadow: "0 0 20px rgba(99, 102, 241, 0.05)" }}
                >
                  {attr}
                </motion.span>
              ))}
            </div>
          </GlassCard>

          {/* Visual Style — spans 6 cols */}
          <GlassCard className="col-span-12 md:col-span-6" onEdit={() => onEdit?.("visualStyle")} label="Visual Style">
            <div className="flex flex-wrap gap-2">
              {brandDna.visualStyle.map((style, i) => (
                <motion.span
                  key={style}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="px-4 py-2 bg-zinc-800/80 text-zinc-300 rounded-xl text-sm font-medium
                           border border-zinc-700/50 backdrop-blur-sm cursor-default"
                >
                  {style}
                </motion.span>
              ))}
            </div>
          </GlassCard>

          {/* Your Ads — full width with ad mockups */}
          {brandDna.currentAds.length > 0 && (
            <GlassCard className="col-span-12" label="Your Ads">
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
            whileHover={{ scale: 1.005 }}
            whileTap={{ scale: 0.995 }}
            onClick={onContinue}
            className="w-full py-4 font-semibold rounded-xl transition-all text-base text-white"
            style={{
              background: `linear-gradient(135deg, ${brandDna.colors.primary}, ${brandDna.colors.secondary})`,
              boxShadow: `0 0 30px ${brandDna.colors.primary}40`,
            }}
          >
            See What Your Competitors Are Doing →
          </motion.button>
          <p className="text-center text-xs text-zinc-600 mt-3">
            You can edit any section above before continuing
          </p>
        </motion.div>
      </motion.div>
    </div>
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
      { bg: "bg-purple-500/10", text: "text-purple-300" },
      { bg: "bg-pink-500/10", text: "text-pink-300" },
    ]
    return badges[index % badges.length]
  }, [index])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative w-80 md:w-full flex-shrink-0 md:flex-shrink rounded-2xl border border-white/[0.04]
                 overflow-hidden transition-all duration-300"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
        backdropFilter: "blur(12px)",
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
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-20 -right-20 w-40 h-40 rounded-full border border-current"
            style={{ color: colors.primary }}
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full border border-current"
            style={{ color: colors.accent }}
          />
        </div>

        {/* Platform + Format Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider bg-black/40 backdrop-blur
                         px-2.5 py-1 rounded-full border border-white/10">
            {ad.platform}
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full
                         ${formatBadgeColor.bg} ${formatBadgeColor.text}`}>
            {ad.format}
          </span>
        </div>

        {/* Shimmer effect on hover */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100"
          initial={false}
          animate={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)" }}
          transition={{ duration: 0.6, repeat: Infinity }}
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

        {/* CTA Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="relative w-full py-2.5 rounded-lg font-medium text-sm text-white overflow-hidden
                   transition-all duration-200 mt-2 group/btn"
          style={{
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
            boxShadow: `0 4px 12px ${colors.primary}30`,
          }}
        >
          <span className="relative z-10 flex items-center justify-center gap-1.5">
            {ad.cta}
            <span className="group-hover/btn:translate-x-0.5 transition-transform">→</span>
          </span>
          <motion.div
            className="absolute inset-0 opacity-0 group-hover/btn:opacity-100"
            style={{
              background: `linear-gradient(135deg, ${colors.secondary}, ${colors.primary})`,
            }}
            transition={{ duration: 0.3 }}
          />
        </motion.button>

        {/* Footer Stats */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
          <div className="text-[10px] text-zinc-500">
            {ad.engagementRate && (
              <span className="text-green-400/80">
                {ad.engagementRate.toFixed(1)}% engagement
              </span>
            )}
          </div>
          <div className="text-[10px] text-zinc-500">
            {ad.estimatedSpend && (
              <span className="text-amber-400/80">{ad.estimatedSpend}</span>
            )}
          </div>
        </div>

        {/* Date Spotted */}
        {ad.dateSpotted && (
          <div className="text-[9px] text-zinc-600 text-center">
            Spotted {ad.dateSpotted}
          </div>
        )}
      </div>

      {/* View Details Overlay (appears on hover) */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center
                 opacity-0 transition-opacity duration-200 pointer-events-none"
      >
        <span className="text-sm font-medium text-white">View Full Details</span>
      </motion.div>
    </motion.div>
  )
}

/* ── Glass Card Component ─────────────────────── */

function GlassCard({
  children,
  className = "",
  label,
  onEdit,
}: {
  children: React.ReactNode
  className?: string
  label?: string
  onEdit?: () => void
}) {
  return (
    <motion.div
      variants={cardVariant}
      whileHover={{ borderColor: "rgba(255,255,255,0.08)" }}
      className={`relative p-5 rounded-2xl border border-white/[0.04] overflow-hidden transition-colors ${className}`}
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
        backdropFilter: "blur(12px)",
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
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
            {label}
          </span>
          {onEdit && (
            <button
              onClick={onEdit}
              className="text-[11px] text-zinc-600 hover:text-indigo-400 transition-colors px-2 py-0.5 rounded-md
                       hover:bg-white/[0.03]"
            >
              Edit
            </button>
          )}
        </div>
      )}
      {children}
    </motion.div>
  )
}
