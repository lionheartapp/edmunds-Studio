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
    brand: "",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 3v18" /><path d="M3 9h6" /><path d="M3 15h6" />
      </svg>
    ),
    desc: "Launch a national brand campaign",
    example: "e.g. Rivian, Ford, Toyota USA",
    color: "#818cf8",
    inputPrompt: "What OEM are you running for?",
    inputPlaceholder: "e.g. Rivian, Toyota, Ford",
    submitLabel: "Analyze Brand →",
  },
  {
    type: "dealer-group" as UserType,
    label: "Dealer Group",
    brand: "",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18" /><path d="M5 21V7l8-4v18" /><path d="M19 21V11l-6-4" />
        <path d="M9 9h1" /><path d="M9 13h1" /><path d="M9 17h1" />
      </svg>
    ),
    desc: "Consistent ads across all your stores",
    example: "e.g. Valley Subaru, AutoNation Honda",
    color: "#a78bfa",
    inputPrompt: "What's your dealer group name?",
    inputPlaceholder: "e.g. Valley Subaru, AutoNation Honda",
    submitLabel: "Analyze Dealer Group →",
  },
  {
    type: "single-dealer" as UserType,
    label: "Single Dealer",
    brand: "",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2.7-3.4A2 2 0 0 0 13.7 6H10" />
        <path d="M5 17h-2c-.6 0-1-.4-1-1v-3c0-.9.7-1.7 1.5-1.9L6 10l2.7-3.4A2 2 0 0 1 10.3 6H14" />
        <circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" />
      </svg>
    ),
    desc: "Quick local ads, no experience needed",
    example: "e.g. your dealership name",
    color: "#c084fc",
    inputPrompt: "What's the name of your dealership?",
    inputPlaceholder: "e.g. AutoNation Toyota Tempe",
    submitLabel: "Analyze My Dealership →",
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
  "Building your creative brief...",
  "Crunching pixels and personas...",
  "Scanning the ad universe...",
  "Making your future ads jealous...",
]

export default function BrandInput({ onSubmit, isLoading }: BrandInputProps) {
  const [selectedScenario, setSelectedScenario] = useState<typeof SCENARIOS[0] | null>(null)
  const [brand, setBrand] = useState("")
  const [sayingIndex, setSayingIndex] = useState(0)

  useEffect(() => {
    if (!isLoading) { setSayingIndex(0); return }
    setSayingIndex(Math.floor(Math.random() * LOADING_SAYINGS.length))
    const interval = setInterval(() => {
      setSayingIndex((prev) => (prev + 1) % LOADING_SAYINGS.length)
    }, 2800)
    return () => clearInterval(interval)
  }, [isLoading])

  const handleScenarioClick = (scenario: typeof SCENARIOS[0]) => {
    setSelectedScenario(scenario)
    setBrand("")
  }

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (brand.trim()) {
      onSubmit(brand.trim(), selectedScenario?.type)
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
              <motion.div
                animate={{ scale: [1, 1.3, 1.1, 1.25, 1], opacity: [0.2, 0.5, 0.3, 0.45, 0.2] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                className="absolute inset-[-20px] rounded-full bg-indigo-500/20 blur-3xl"
              />
              <motion.div
                animate={{ y: [0, -14, -4, -18, 0], x: [0, 6, -4, 8, 0], rotate: [0, 3, -2, 4, 0] }}
                transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
                className="absolute inset-0"
              >
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
                  <motion.div
                    animate={{ x: [0, 10, -5, 15, 0], y: [0, -8, 5, -12, 0], opacity: [0.5, 0.7, 0.4, 0.65, 0.5] }}
                    transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                    className="absolute top-3 left-5 w-16 h-10 rounded-full"
                    style={{ background: "radial-gradient(ellipse, rgba(255,255,255,0.6), transparent)" }}
                  />
                  <motion.div
                    animate={{ x: [0, -15, 10, -8, 0], y: [0, 12, -8, 15, 0], opacity: [0.15, 0.3, 0.1, 0.25, 0.15] }}
                    transition={{ repeat: Infinity, duration: 9, ease: "easeInOut" }}
                    className="absolute bottom-4 right-4 w-20 h-20 rounded-full"
                    style={{ background: "radial-gradient(circle, rgba(167, 139, 250, 0.5), transparent 70%)" }}
                  />
                </motion.div>
              </motion.div>
              <motion.div
                animate={{ scaleX: [1, 0.8, 0.9, 0.75, 1], opacity: [0.25, 0.12, 0.2, 0.1, 0.25], x: [0, 6, -4, 8, 0] }}
                transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
                className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-28 h-5 rounded-full bg-indigo-500/30 blur-lg"
              />
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 5, ease: "linear" }} className="absolute inset-[-12px]">
                <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="absolute top-0 left-1/2 w-2 h-2 rounded-full bg-indigo-400" style={{ boxShadow: "0 0 8px rgba(129, 140, 248, 0.8)" }} />
              </motion.div>
              <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 8, ease: "linear" }} className="absolute inset-[-20px]">
                <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="absolute bottom-0 right-1/4 w-1.5 h-1.5 rounded-full bg-purple-400" style={{ boxShadow: "0 0 6px rgba(167, 139, 250, 0.7)" }} />
              </motion.div>
            </div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xl font-semibold text-zinc-200 mb-3">
              Analyzing <span className="accent-gradient-text">{brand}</span>
            </motion.p>
            <div className="h-6 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.p key={sayingIndex} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }} className="text-sm text-zinc-500 text-center">
                  {LOADING_SAYINGS[sayingIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          </motion.div>

        ) : !selectedScenario?.type || selectedScenario.brand ? (
          /* ── Scenario Selection ─────────────────────── */
          <motion.div
            key="select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative z-10 flex flex-col items-center w-full max-w-2xl"
          >
            {/* Logo */}
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
                Edmunds<span className="accent-gradient-text">Studio</span>
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-5xl font-bold text-center mb-3 tracking-tight leading-tight"
            >
              How are you
              <br />
              <span className="accent-gradient-text">using Edmunds Studio?</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-zinc-500 mb-10 text-center"
            >
              Pick your scenario — we&apos;ll tailor the experience
            </motion.p>

            {/* Scenario Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
              {SCENARIOS.map((scenario, i) => (
                <motion.button
                  key={scenario.type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  whileHover={{ y: -4, borderColor: `${scenario.color}40` }}
                  onClick={() => handleScenarioClick(scenario)}
                  className="relative flex flex-col items-start text-left p-5 rounded-2xl border border-white/[0.04] overflow-hidden transition-all group"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                    backdropFilter: "blur(12px)",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.04)",
                  }}
                >
                  {/* Top highlight */}
                  <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${scenario.color}15, transparent)` }} />

                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors"
                    style={{
                      backgroundColor: `${scenario.color}15`,
                      color: scenario.color,
                    }}
                  >
                    {scenario.icon}
                  </div>
                  <span className="text-base font-semibold text-zinc-100 mb-1 group-hover:text-white transition-colors">
                    {scenario.label}
                  </span>
                  <span className="text-sm text-zinc-500 mb-3">{scenario.desc}</span>
                  <span className="text-xs text-zinc-600">{scenario.example}</span>

                  {/* Hover glow */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    style={{ background: `radial-gradient(circle at 50% 120%, ${scenario.color}08, transparent 70%)` }}
                  />
                </motion.button>
              ))}
            </div>

            {/* Custom brand input — subtle, secondary */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-8 w-full"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 h-px bg-zinc-800" />
                <span className="text-xs text-zinc-600 uppercase tracking-wider">or enter any brand</span>
                <div className="flex-1 h-px bg-zinc-800" />
              </div>
              <form onSubmit={handleCustomSubmit} className="relative">
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="Type a brand name..."
                  className="w-full px-5 py-3.5 pr-28 text-sm rounded-xl bg-zinc-900/50 border border-zinc-800
                           focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
                           placeholder:text-zinc-600 transition-all"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <button
                    type="submit"
                    disabled={!brand.trim()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium
                             rounded-lg transition-all disabled:opacity-0 disabled:pointer-events-none"
                  >
                    Analyze →
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>

        ) : (
          /* ── Custom Brand Input for Single Dealer ──── */
          <motion.div
            key="custom-input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 flex flex-col items-center w-full max-w-lg"
          >
            <motion.button
              onClick={() => setSelectedScenario(null)}
              className="mb-6 text-sm text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-2"
            >
              ← Back
            </motion.button>

            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{ backgroundColor: `${selectedScenario.color}15`, color: selectedScenario.color }}
            >
              {selectedScenario.icon}
            </div>

            <h2 className="text-2xl font-bold text-center mb-2">
              {selectedScenario.label}
            </h2>
            <p className="text-zinc-500 text-center mb-8">
              {selectedScenario.inputPrompt}
            </p>

            <form onSubmit={handleCustomSubmit} className="w-full">
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder={selectedScenario.inputPlaceholder}
                className="w-full px-5 py-4 text-base rounded-xl bg-zinc-900 border border-zinc-800
                         focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
                         placeholder:text-zinc-600 transition-all"
                autoFocus
              />
              <button
                type="submit"
                disabled={!brand.trim()}
                className="w-full mt-4 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl
                         disabled:opacity-30 disabled:cursor-not-allowed transition-all glow-sm"
              >
                {selectedScenario.submitLabel}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
