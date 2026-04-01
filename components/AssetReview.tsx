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

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h2 className="text-3xl font-bold mb-2">Review Your Campaign</h2>
      <p className="text-gray-500 mb-8">Three creative directions, side by side</p>

      {/* Platform Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {platforms.map((platform) => (
          <button
            key={platform}
            onClick={() => setSelectedPlatform(platform)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              selectedPlatform === platform
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {PLATFORM_DIMENSIONS[platform].label}
          </button>
        ))}
      </div>

      {/* Variant Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {variants.map((variant, i) => (
          <motion.div
            key={variant.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
            className="border border-gray-200 rounded-2xl overflow-hidden"
          >
            {/* Variant Label */}
            <div className={`px-4 py-2 text-sm font-medium text-white ${
              variant.angle === "emotional" ? "bg-purple-500" :
              variant.angle === "rational" ? "bg-blue-500" :
              "bg-orange-500"
            }`}>
              {variant.angle.charAt(0).toUpperCase() + variant.angle.slice(1)}
            </div>

            {/* Preview Area */}
            <div className="aspect-square bg-gray-100 flex items-center justify-center p-6">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">{variant.headline}</h3>
                <p className="text-gray-600 text-sm">{variant.description}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 flex gap-2">
              <button
                onClick={() => onApprove(variant.id)}
                className="flex-1 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium
                         hover:bg-green-100 transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => setTweakTarget(variant.id)}
                className="flex-1 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium
                         hover:bg-gray-100 transition-colors"
              >
                Tweak
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tweak Dialog */}
      <AnimatePresence>
        {tweakTarget && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-xl p-6"
          >
            <div className="max-w-2xl mx-auto flex gap-3">
              <input
                type="text"
                value={tweakInstruction}
                onChange={(e) => setTweakInstruction(e.target.value)}
                placeholder="Make the headline punchier..."
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200
                         focus:border-blue-500 focus:outline-none"
                autoFocus
              />
              <button
                onClick={() => {
                  onTweak(tweakTarget, tweakInstruction)
                  setTweakTarget(null)
                  setTweakInstruction("")
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium"
              >
                Apply
              </button>
              <button
                onClick={() => setTweakTarget(null)}
                className="px-4 py-3 text-gray-500"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Approve All */}
      <button
        onClick={onApproveAll}
        className="w-full py-4 bg-blue-600 text-white font-semibold rounded-2xl
                 hover:bg-blue-700 transition-colors text-lg"
      >
        Approve All & Schedule →
      </button>
    </div>
  )
}
