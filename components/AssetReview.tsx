"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CampaignVariant, Platform, PLATFORM_DIMENSIONS } from "@/lib/types"

interface AssetReviewProps {
  variants: CampaignVariant[]
  onApprove: (variantId: string) => void
  onTweak: (variantId: string, instruction: string) => void
  onApproveAll: () => void
}

export default function AssetReview({
  variants,
  onApprove,
  onTweak,
  onApproveAll,
}: AssetReviewProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("instagram_feed")
  const [tweakTarget, setTweakTarget] = useState<string | null>(null)
  const [tweakInstruction, setTweakInstruction] = useState("")

  const platforms = Object.keys(PLATFORM_DIMENSIONS) as Platform[]

  const getAccentColor = (angle: string) => {
    switch (angle) {
      case "emotional":
        return { border: "border-purple-500/30", top: "bg-gradient-to-r from-purple-500 to-purple-600" }
      case "rational":
        return { border: "border-blue-500/30", top: "bg-gradient-to-r from-blue-500 to-cyan-600" }
      case "urgency":
        return { border: "border-amber-500/30", top: "bg-gradient-to-r from-amber-500 to-orange-600" }
      default:
        return { border: "border-indigo-500/30", top: "bg-gradient-to-r from-indigo-500 to-indigo-600" }
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-8 bg-zinc-950 min-h-screen">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-3xl font-bold mb-2 accent-gradient-text"
      >
        Review Your Campaign
      </motion.h2>
      <p className="text-zinc-400 mb-8">Three creative directions, side by side</p>

      {/* Platform Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {platforms.map((platform) => (
          <button
            key={platform}
            onClick={() => setSelectedPlatform(platform)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              selectedPlatform === platform
                ? "bg-indigo-600 text-zinc-100 glow-sm shadow-lg shadow-indigo-500/20"
                : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700"
            }`}
          >
            {PLATFORM_DIMENSIONS[platform].label}
          </button>
        ))}
      </div>

      {/* Variant Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {variants.map((variant, i) => {
          const colors = getAccentColor(variant.angle)
          return (
            <motion.div
              key={variant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              className={`border rounded-xl overflow-hidden bg-zinc-900 ${colors.border} transition-all hover:shadow-lg hover:shadow-zinc-800/50`}
            >
              {/* Colored Top Accent Bar */}
              <div className={`h-1 ${colors.top}`} />

              {/* Preview Area */}
              <div className="aspect-square bg-zinc-800/50 flex items-center justify-center p-6 border-b border-zinc-800">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-zinc-100 mb-2">{variant.headline}</h3>
                  <p className="text-zinc-400 text-sm">{variant.description}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 flex gap-2 border-t border-zinc-800">
                <button
                  onClick={() => onApprove(variant.id)}
                  className="flex-1 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg text-sm font-medium
                           hover:bg-emerald-500/20 transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => setTweakTarget(variant.id)}
                  className="flex-1 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 rounded-lg text-sm font-medium
                           hover:bg-indigo-500/20 transition-colors"
                >
                  Tweak
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Tweak Dialog */}
      <AnimatePresence>
        {tweakTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setTweakTarget(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur border-t border-zinc-800 shadow-2xl p-6"
            >
              <div className="max-w-2xl mx-auto">
                <h3 className="text-zinc-100 font-semibold mb-4">Tweak this variant</h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={tweakInstruction}
                    onChange={(e) => setTweakInstruction(e.target.value)}
                    placeholder="Make the headline punchier..."
                    className="flex-1 px-4 py-3 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-100 placeholder-zinc-500
                             focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      onTweak(tweakTarget, tweakInstruction)
                      setTweakTarget(null)
                      setTweakInstruction("")
                    }}
                    className="px-6 py-3 bg-indigo-600 text-zinc-100 rounded-lg font-medium glow-sm hover:bg-indigo-500 transition-colors"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => setTweakTarget(null)}
                    className="px-4 py-3 text-zinc-400 hover:text-zinc-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Approve All */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={onApproveAll}
        className="w-full py-4 bg-indigo-600 text-zinc-100 font-semibold rounded-xl
                 hover:bg-indigo-500 transition-colors text-lg glow-sm shadow-lg shadow-indigo-500/20"
      >
        Approve All & Schedule →
      </motion.button>
    </div>
  )
}
