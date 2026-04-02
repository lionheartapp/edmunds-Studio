"use client"

import { motion, AnimatePresence } from "framer-motion"
import { PipelineStage } from "@/lib/types"

interface StageInfo {
  key: PipelineStage
  label: string
  description: string
  icon: string
}

const STAGES: StageInfo[] = [
  { key: "creative_brief", label: "Creative Brief", description: "Claude is crafting your campaign strategy", icon: "📝" },
  { key: "image_generation", label: "Hero Image", description: "Imagen 3 is generating photorealistic visuals", icon: "🎨" },
  { key: "figma_generation", label: "Design Frames", description: "Creating platform-sized Figma layouts", icon: "🖼️" },
  { key: "ae_script", label: "Motion Graphics", description: "Building After Effects composition", icon: "🎬" },
  { key: "voiceover", label: "Voiceover", description: "Synthesizing professional narration", icon: "🎙️" },
  { key: "variant_generation", label: "Variants", description: "Generating A/B/C creative options", icon: "🔀" },
]

interface PipelineStatusProps {
  currentStage: PipelineStage
  completedStages: PipelineStage[]
  stageOutputs?: Record<string, unknown>
  error?: string
}

export default function PipelineStatusView({
  currentStage,
  completedStages,
  stageOutputs,
  error,
}: PipelineStatusProps) {
  return (
    <div className="max-w-2xl mx-auto p-8 bg-zinc-950 min-h-screen">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-3xl font-bold mb-2 accent-gradient-text"
      >
        Building Your Campaign
      </motion.h2>
      <p className="text-zinc-400 mb-10">Watch your ads come to life</p>

      <div className="space-y-4">
        <AnimatePresence>
          {STAGES.map((stage, i) => {
            const isComplete = completedStages.includes(stage.key)
            const isCurrent = currentStage === stage.key
            const isPending = !isComplete && !isCurrent

            return (
              <motion.div
                key={stage.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all border ${
                  isCurrent
                    ? "bg-zinc-900 border-eds-50 border-2 glow-sm shadow-lg shadow-eds-50/20"
                    : isComplete
                    ? "bg-zinc-900 border-zinc-800"
                    : "bg-zinc-900/40 border-zinc-800 opacity-50"
                }`}
              >
                {/* Status Indicator */}
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                  {isComplete ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                  ) : isCurrent ? (
                    <div
                      className="w-8 h-8 border-3 border-eds-50 border-t-transparent rounded-full animate-spinner-pipeline"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center text-sm">
                      {stage.icon}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className={`font-semibold ${
                    isCurrent
                      ? "text-zinc-100"
                      : isComplete
                      ? "text-zinc-100"
                      : "text-zinc-500"
                  }`}>
                    {stage.label}
                  </h3>
                  <p className={`text-sm ${
                    isCurrent
                      ? "text-zinc-400"
                      : isComplete
                      ? "text-emerald-400"
                      : "text-zinc-600"
                  }`}>
                    {isCurrent ? stage.description : isComplete ? "Complete" : "Waiting..."}
                  </p>
                </div>

                {/* Live Preview Slot */}
                {isCurrent && stageOutputs && stage.key in stageOutputs && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-xs text-eds-60 font-mono bg-eds-50/10 px-3 py-1 rounded-lg border border-eds-50/20"
                  >
                    Live Preview
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-zinc-900 border border-amber-500/30 rounded-xl"
        >
          <p className="text-amber-400 font-medium">Something went wrong</p>
          <p className="text-amber-300/70 text-sm mt-1">{error}</p>
        </motion.div>
      )}
    </div>
  )
}
