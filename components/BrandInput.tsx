"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface BrandInputProps {
  onSubmit: (brandName: string) => void
  isLoading?: boolean
}

const QUICK_BRANDS = [
  { name: "Rivian", emoji: "🏔️" },
  { name: "Subaru", emoji: "🌲" },
  { name: "Toyota", emoji: "🚗" },
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
            {/* 3D Orb */}
            <div className="relative w-40 h-40 mb-10">
              {/* Outer glow */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-indigo-500/20 blur-2xl"
              />
              {/* Orb body */}
              <motion.div
                animate={{
                  y: [0, -12, 0],
                }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full"
                style={{
                  background: "radial-gradient(circle at 35% 35%, #818cf8, #6366f1 40%, #4338ca 70%, #312e81 100%)",
                  boxShadow: "0 0 60px rgba(99, 102, 241, 0.4), 0 0 120px rgba(99, 102, 241, 0.15), inset 0 -20px 40px rgba(0,0,0,0.3)",
                }}
              >
                {/* Highlight/shine */}
                <div
                  className="absolute top-4 left-6 w-12 h-8 rounded-full opacity-60"
                  style={{
                    background: "radial-gradient(ellipse, rgba(255,255,255,0.5), transparent)",
                  }}
                />
              </motion.div>
              {/* Shadow underneath */}
              <motion.div
                animate={{
                  scaleX: [1, 0.85, 1],
                  opacity: [0.3, 0.15, 0.3],
                }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-4 rounded-full bg-indigo-500/30 blur-md"
              />
              {/* Orbiting ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                className="absolute inset-[-8px]"
              >
                <div
                  className="w-full h-full rounded-full"
                  style={{
                    border: "2px solid transparent",
                    borderTopColor: "rgba(129, 140, 248, 0.6)",
                    borderRightColor: "rgba(129, 140, 248, 0.2)",
                  }}
                />
              </motion.div>
              {/* Second orbiting ring (opposite direction) */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                className="absolute inset-[-16px]"
              >
                <div
                  className="w-full h-full rounded-full"
                  style={{
                    border: "1.5px solid transparent",
                    borderBottomColor: "rgba(167, 139, 250, 0.4)",
                    borderLeftColor: "rgba(167, 139, 250, 0.1)",
                  }}
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

            {/* Quick brand chips */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-8 flex flex-col items-center gap-3"
            >
              <span className="text-xs text-zinc-600 uppercase tracking-wider">Try a demo</span>
              <div className="flex gap-2">
                {QUICK_BRANDS.map(({ name, emoji }) => (
                  <button
                    key={name}
                    onClick={() => {
                      setBrand(name)
                      onSubmit(name)
                    }}
                    className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800
                             hover:border-zinc-700 hover:bg-zinc-800 text-sm text-zinc-400
                             hover:text-zinc-200 transition-all"
                  >
                    {emoji} {name}
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
