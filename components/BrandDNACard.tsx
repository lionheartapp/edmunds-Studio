"use client"

import { motion } from "framer-motion"
import { BrandDNA } from "@/lib/types"

interface BrandDNACardProps {
  brandDna: BrandDNA
  onConfirm: () => void
  onEdit?: (field: string) => void
}

export default function BrandDNACard({
  brandDna,
  onConfirm,
  onEdit,
}: BrandDNACardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto p-8"
    >
      <div className="mb-6">
        <h2 className="text-3xl font-bold">{brandDna.name}</h2>
        <p className="text-gray-500 mt-1">{brandDna.domain}</p>
      </div>

      {/* Color Palette */}
      <Section title="Colors" onEdit={() => onEdit?.("colors")}>
        <div className="flex gap-3">
          {Object.entries(brandDna.colors).map(([name, hex]) => (
            <div key={name} className="flex flex-col items-center gap-1">
              <div
                className="w-14 h-14 rounded-xl border border-gray-100 shadow-sm"
                style={{ backgroundColor: hex }}
              />
              <span className="text-xs text-gray-500 capitalize">{name}</span>
              <span className="text-xs font-mono text-gray-400">{hex}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Typography */}
      <Section title="Typography" onEdit={() => onEdit?.("typography")}>
        <p className="text-lg" style={{ fontWeight: parseInt(brandDna.typography.headingWeight) || 700 }}>
          {brandDna.typography.primaryFont}
        </p>
        <p className="text-sm text-gray-500">
          Fallback: {brandDna.typography.fallback} · Weight: {brandDna.typography.headingWeight}
        </p>
      </Section>

      {/* Voice */}
      <Section title="Voice" onEdit={() => onEdit?.("voice")}>
        <div className="flex flex-wrap gap-2">
          {brandDna.voice.map((attr) => (
            <span
              key={attr}
              className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
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
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
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
            <span key={comp} className="text-sm text-gray-600">
              {comp}
            </span>
          ))}
        </div>
      </Section>

      {/* Current Ads */}
      {brandDna.currentAds.length > 0 && (
        <Section title="Current Ads">
          <div className="space-y-3">
            {brandDna.currentAds.map((ad, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    {ad.platform}
                  </span>
                  <span className="text-xs text-gray-400">{ad.format}</span>
                </div>
                <p className="text-sm font-medium">{ad.headline}</p>
                <p className="text-xs text-blue-600 mt-1">{ad.cta}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Confirm Button */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={onConfirm}
        className="w-full mt-8 py-4 bg-blue-600 text-white font-semibold rounded-2xl
                 hover:bg-blue-700 transition-colors text-lg"
      >
        Looks Right →
      </motion.button>
    </motion.div>
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 pb-6 border-b border-gray-100"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
          {title}
        </h3>
        {onEdit && (
          <button
            onClick={onEdit}
            className="text-xs text-blue-500 hover:text-blue-700 transition-colors"
          >
            Edit
          </button>
        )}
      </div>
      {children}
    </motion.div>
  )
}
