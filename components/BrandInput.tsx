"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export type UserType = "oem" | "dealer-group" | "single-dealer" | null

interface BrandInputProps {
  onSubmit: (brandName: string, userType?: UserType) => void
  isLoading?: boolean
}

const SCENARIOS = [
  {
    type: "oem" as UserType,
    label: "OEM Campaign",
    brand: "Rivian",
    emoji: "🏢",
    desc: "National brand campaign",
  },
  {
    type: "dealer-group" as UserType,
    label: "Dealer Group",
    brand: "Valley Subaru",
    emoji: "🏬",
    desc: "Multi-store consistency",
  },
  {
    type: "single-dealer" as UserType,
    label: "Single Dealer",
    brand: "AutoNation Toyota Tempe",
    emoji: "🚗",
    desc: "Quick local ads",
  },
]

const LOADING_SAYINGS = [
  "Stalking their Instagram aesthetic...",
  "Judging their font choices...",
  "Extracting brand vibes...",
  "Reading their About page so you don't have to...",
  "Analyzing color psychology...",
  "Decoding their marketing DNA...",
  "Cross-referencing competitor strategies...",
  "Sampling their brand voice...",
  "Measuring logo symmetry (just kidding)...",
  "Building your creative brief...",
  "Teaching AI to think like a CMO...",
  "Almost there, this is the fun part...",
  "Crunching pixels and personas...",
  "Scanning the ad universe...",
  "Making your future ads jealous...",
]

export default function BrandInput({ onSubmit, isLoading }: BrandInputProps) {
  const [brand, setBrand] = useState("")
  const [sayingIndex, setSayingIndex] = useState(0)

  // Rotate through loading sayings
  useEffect(() => {
    if (!isLoading) {
      setSayingIndex(0)
      return
    }
    // Start with a random saying
    setSayingIndex(Math.floor(Math.random() * LOADING_SAYINGS.length))
    const interval = setInterval(() => {
      setSayingIndex((prev) => (prev + 1) % LOADING_SAYINGS.length)
    }, 2800)
    return () => clearInterval(interval)
  }, [isLoading])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (brand.trim()) {
      onSubmit(brand.trim())
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-purple-500/8 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-indigo-500/5 blur-3xl" />
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          /* ── Loading State ─────────────────────────── */
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 flex flex-col items-center"
          >
            {/* Organic Morphing Orb */}
            <div className="relative w-48 h-48 mb-10">
              {/* Pulsing ambient glow */}
              <motion.div
                animate={{
                  scale: [1, 1.3, 1.1, 1.25, 1],
                  opacity: [0.2, 0.5, 0.3, 0.45, 0.2],
                }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                className="absolute inset-[-20px] rounded-full bg-indigo-500/20 blur-3xl"
              />

              {/* Floating + rotating wrapper */}
              <motion.div
                animate={{
                  y: [0, -14, -4, -18, 0],
                  x: [0, 6, -4, 8, 0],
                  rotate: [0, 3, -2, 4, 0],
                }}
                transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                {/* Orb body — morphing blob */}
                <motion.div
                  animate={{
                    borderRadius: [
                      "42% 58% 62% 38% / 45% 55% 45% 55%",
                      "55% 45% 38% 62% / 58% 42% 58% 42%",
                      "38% 62% 55% 45% / 42% 58% 38% 62%",
                      "62% 38% 45% 55% / 55% 45% 62% 38%",
                      "42% 58% 62% 38% / 45% 55% 45% 55%",
                    ],
                    scale: [1, 1.04, 0.98, 1.02, 1],
                  }}
                  transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
                  className="absolute inset-0 overflow-hidden"
                  style={{
                    background: "radial-gradient(circle at 35% 30%, #a5b4fc, #818cf8 25%, #6366f1 45%, #4338ca 70%, #312e81 100%)",
                    boxShadow: "0 0 80px rgba(99, 102, 241, 0.5), 0 0 160px rgba(99, 102, 241, 0.15), inset 0 -30px 50px rgba(0,0,0,0.35)",
                  }}
                >
                  {/* Moving highlight — simulates light source shifting */}
                  <motion.div
                    animate={{
                      x: [0, 10, -5, 15, 0],
                      y: [0, -8, 5, -12, 0],
                      scale: [1, 1.2, 0.9, 1.1, 1],
                      opacity: [0.5, 0.7, 0.4, 0.65, 0.5],
                    }}
                    transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                    className="absolute top-3 left-5 w-16 h-10 rounded-full"
                    style={{
                      background: "radial-gradient(ellipse, rgba(255,255,255,0.6), rgba(255,255,255,0.1) 60%, transparent)",
                    }}
                  />
                  {/* Secondary inner glow that drifts */}
                  <motion.div
                    animate={{
                      x: [0, -15, 10, -8, 0],
                      y: [0, 12, -8, 15, 0],
                      opacity: [0.15, 0.3, 0.1, 0.25, 0.15],
                    }}
                    transition={{ repeat: Infinity, duration: 9, ease: "easeInOut" }}
                    className="absolute bottom-4 right-4 w-20 h-20 rounded-full"
                    style={{
                      background: "radial-gradient(circle, rgba(167, 139, 250, 0.5), transparent 70%)",
                    }}
                  />
                  {/* Subtle surface noise / texture shimmer */}
                  <motion.div
                    animate={{ opacity: [0.03, 0.08, 0.03] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="absolute inset-0"
                    style={{
                      backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
                      mixBlendMode: "overlay",
                    }}
                  />
                </motion.div>
              </motion.div>

              {/* Shadow — morphs with the orb */}
              <motion.div
                animate={{
                  scaleX: [1, 0.8, 0.9, 0.75, 1],
                  scaleY: [1, 1.1, 0.95, 1.05, 1],
                  opacity: [0.25, 0.12, 0.2, 0.1, 0.25],
                  x: [0, 6, -4, 8, 0],
                }}
                transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
                className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-28 h-5 rounded-full bg-indigo-500/30 blur-lg"
              />

              {/* Orbiting particle 1 */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
                className="absolute inset-[-12px]"
              >
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="absolute top-0 left-1/2 w-2 h-2 rounded-full bg-indigo-400"
                  style={{ boxShadow: "0 0 8px rgba(129, 140, 248, 0.8)" }}
                />
              </motion.div>

              {/* Orbiting particle 2 */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                className="absolute inset-[-20px]"
              >
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="absolute bottom-0 right-1/4 w-1.5 h-1.5 rounded-full bg-purple-400"
                  style={{ boxShadow: "0 0 6px rgba(167, 139, 250, 0.7)" }}
                />
              </motion.div>

              {/* Orbiting particle 3 */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                className="absolute inset-[-28px]"
              >
                <motion.div
                  animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                  className="absolute top-1/3 right-0 w-1 h-1 rounded-full bg-indigo-300"
                  style={{ boxShadow: "0 0 4px rgba(165, 180, 252, 0.6)" }}
                />
              </motion.div>
            </div>

            {/* Brand name being analyzed */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-semibold text-zinc-200 mb-3"
            >
              Analyzing <span className="accent-gradient-text">{brand}</span>
            </motion.p>

            {/* Rotating fun sayings */}
            <div className="h-6 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.p
                  key={sayingIndex}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="text-sm text-zinc-500 text-center"
                >
                  {LOADING_SAYINGS[sayingIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          /* ── Input State ───────────────────────────── */
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative z-10 flex flex-col items-center w-full max-w-lg"
          >
            {/* Logo mark */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="mb-8 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <span className="text-lg font-semibold tracking-tight">
                AdGen<span className="accent-gradient-text">AI</span>
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl font-bold text-center mb-3 tracking-tight leading-tight"
            >
              What brand are you
              <br />
              <span className="accent-gradient-text">creating ads for?</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-zinc-500 mb-10 text-center"
            >
              Enter any brand name — we&apos;ll analyze their identity in seconds
            </motion.p>

            {/* Input + single CTA */}
            <form onSubmit={handleSubmit} className="w-full">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="relative"
              >
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Type a brand name..."
                  className="w-full px-5 py-4 pr-32 text-base rounded-xl bg-zinc-900 border border-zinc-800
                           focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
                           placeholder:text-zinc-600 transition-all"
                  autoFocus
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <button
                    type="submit"
                    disabled={!brand.trim()}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold
                             rounded-lg transition-all disabled:opacity-0 disabled:pointer-events-none"
                  >
                    Analyze →
                  </button>
                </div>
              </motion.div>
            </form>

            {/* Scenario chips */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-10 flex flex-col items-center gap-4 w-full"
            >
              <span className="text-xs text-zinc-600 uppercase tracking-wider">Try a demo scenario</span>
              <div className="grid grid-cols-3 gap-3 w-full">
                {SCENARIOS.map(({ type, label, brand: scenarioBrand, emoji, desc }) => (
                  <button
                    key={type}
                    onClick={() => {
                      setBrand(scenarioBrand)
                      onSubmit(scenarioBrand, type)
                    }}
                    className="flex flex-col items-center gap-1.5 px-4 py-4 rounded-xl bg-zinc-900 border border-zinc-800
                             hover:border-indigo-500/30 hover:bg-zinc-800/80 text-sm transition-all group"
                  >
                    <span className="text-xl mb-0.5">{emoji}</span>
                    <span className="text-zinc-200 font-medium group-hover:text-white">{label}</span>
                    <span className="text-[11px] text-zinc-600">{desc}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
