"use client"

import { motion } from "framer-motion"
import { BrandDNA } from "@/lib/types"

interface BrandDNACardProps {
  brandDna: BrandDNA
  onConfirm: () => void
  onEdit?: (field: string) => void
}

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function BrandDNACard({
  brandDna,
  onConfirm,
  onEdit,
}: BrandDNACardProps) {
  return (
    <div className="relative min-h-screen py-12 px-6">
      {/* Background accent based on brand primary color */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${brandDna.colors.primary}, transparent)` }}
      />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-2xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="mb-10">
          <div className="flex items-center gap-3 mb-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: brandDna.colors.primary }}
            />
            <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
              Brand DNA
            </span>
          </div>
          <h2 className="text-4xl font-bold tracking-tight">{brandDna.name}</h2>
          <p className="text-zinc-500 mt-1 text-sm">{brandDna.domain}</p>
        </motion.div>

        {/* Color Palette */}
        <Section title="Colors" onEdit={() => onEdit?.("colors")}>
          <div className="flex gap-4">
            {Object.entries(brandDna.colors).map(([name, hex]) => (
              <div key={name} className="flex flex-col items-center gap-2">
                <div
                  className="w-16 h-16 rounded-2xl border border-zinc-800 shadow-lg transition-transform hover:scale-105"
                  style={{ backgroundColor: hex }}
                />
                <span className="text-[11px] text-zinc-500 capitalize">{name}</span>
                <span className="text-[11px] font-mono text-zinc-600">{hex}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Typography */}
        <Section title="Typography" onEdit={() => onEdit?.("typography")}>
          <p
            className="text-2xl text-zinc-100"
            style={{ fontWeight: parseInt(brandDna.typography.headingWeight) || 700 }}
          >
            {brandDna.typography.primaryFont}
          </p>
          <p className="text-sm text-zinc-500 mt-1">
            Fallback: {brandDna.typography.fallback} · Weight: {brandDna.typography.headingWeight}
          </p>
        </Section>

        {/* Voice */}
        <Section title="Voice" onEdit={() => onEdit?.("voice")}>
          <div className="flex flex-wrap gap-2">
            {brandDna.voice.map((attr) => (
              <span
                key={attr}
                className="px-3 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg text-sm font-medium
                         border border-indigo-500/20"
              >
                {attr}
              </span>
            ))}
          </div>
        </Section>

        {/* Visual Style */}
        <Section title="Visual Style" onEdit={() => onEdit?.("visualStyle")}>
          <div className="flex flex-wrap gap-2">
            {brandDna.visualStyle.map((style) => (
              <span
                key={style}
                className="px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded-lg text-sm font-medium
                         border border-zinc-700"
              >
                {style}
              </span>
            ))}
          </div>
        </Section>

        {/* Competitors */}
        <Section title="Competitors">
          <div className="flex gap-3">
            {brandDna.competitors.map((comp) => (
              <div
                key={comp}
                className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-400"
              >
                {comp}
              </div>
            ))}
          </div>
        </Section>

        {/* Current Ads */}
        {brandDna.currentAds.length > 0 && (
          <Section title="Ad Intelligence">
            <div className="grid gap-3">
              {brandDna.currentAds.map((ad, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">
                      {ad.platform}
                    </span>
                    <span className="text-[11px] text-zinc-600">·</span>
                    <span className="text-[11px] text-zinc-600">{ad.format}</span>
                    {ad.dateSpotted && (
                      <>
                        <span className="text-[11px] text-zinc-600">·</span>
                        <span className="text-[11px] text-zinc-600">{ad.dateSpotted}</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm font-medium text-zinc-200">&ldquo;{ad.headline}&rdquo;</p>
                  <p className="text-xs text-indigo-400 mt-1.5 font-medium">{ad.cta} →</p>
                </motion.div>
              ))}
            </div>
          </Section>
        )}

        {/* Confirm Button */}
        <motion.div variants={fadeUp} className="mt-10">
          <button
            onClick={onConfirm}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold
                     rounded-xl transition-all glow-sm text-base"
          >
            Looks Right — Continue →
          </button>
          <p className="text-center text-xs text-zinc-600 mt-3">
            You can edit any section above before continuing
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}

function Section({
  title,
  children,
  onEdit,
}: {
  title: string
  children: React.ReactNode
  onEdit?: () => void
}) {
  return (
    <motion.div variants={fadeUp} className="mb-8 pb-8 border-b border-zinc-800/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          {title}
        </h3>
        {onEdit && (
          <button
            onClick={onEdit}
            className="text-xs text-zinc-600 hover:text-indigo-400 transition-colors px-2 py-1 rounded-md
                     hover:bg-zinc-800"
          >
            Edit
          </button>
        )}
      </div>
      {children}
    </motion.div>
  )
}
