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
    color: "#4E91F5",
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
    color: "#7AAFFF",
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
  "Analyzing their Instagram aesthetic...",
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
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-eds-50/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-eds-40/8 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-eds-50/5 blur-3xl" />
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
            aria-live="polite"
          >
            {/* Morphing Orb — 3 layers with framer-motion */}
            <div className="relative w-48 h-48 mb-10">
              {/* Layer 1: Outer glow */}
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  borderRadius: ["30% 70% 70% 30% / 30% 30% 70% 70%", "50% 50% 50% 50%", "30% 70% 70% 30% / 30% 30% 70% 70%"],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-[-20px] bg-eds-50/20 blur-3xl"
              />
              {/* Layer 2: Morphing shape */}
              <motion.div
                animate={{
                  scale: [1, 1.06, 1],
                  borderRadius: ["50% 50% 50% 50%", "30% 70% 70% 30% / 30% 30% 70% 70%", "50% 50% 50% 50%"],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
                className="absolute inset-0"
                style={{
                  background: "radial-gradient(circle at 35% 30%, #A3C8FF, #4E91F5 25%, #2070E8 45%, #1358BF 70%, #033E96 100%)",
                  boxShadow: "0 0 80px rgba(32, 112, 232, 0.5), 0 0 160px rgba(32, 112, 232, 0.15), inset 0 -30px 50px rgba(0,0,0,0.35)",
                }}
              />
              {/* Layer 3: Orbiting dot */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-12px]"
              >
                <div
                  className="absolute top-0 left-1/2 w-2.5 h-2.5 rounded-full bg-eds-60"
                  style={{ boxShadow: "0 0 10px rgba(78, 145, 245, 0.8)" }}
                />
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
            {/* Logo — animated blob (matches SectionLoader style) with Edmunds car icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="mb-8 flex items-center gap-3"
            >
              {/* EDS Edmunds car icon — from design system Brand Logos library */}
              <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-eds-50/15 border border-eds-50/25 flex-shrink-0">
                <svg width="22" height="15" viewBox="0 0 260 175" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M252.241 43.348C255.974 43.247 259.154 46.136 259.254 49.861H259.264L259.455 57.12C259.556 60.855 256.668 64.036 252.945 64.137L237.37 65.939C237.423 66.053 237.476 66.179 237.525 66.294L237.571 66.402C241.747 71.788 249.605 86.718 249.605 107.88C249.605 117.153 247.885 128.718 246.5 138.031C245.845 142.438 245.264 146.34 244.977 149.257V162.788C244.977 169.533 239.513 175 232.772 175H216.21C209.469 175 204.005 169.533 204.005 162.788V152.731C186.648 151.14 158.345 150.596 129.9 150.546C101.455 150.596 73.152 151.14 55.795 152.731V162.788C55.795 169.533 50.332 175 43.59 175H27.029C20.287 175 14.824 169.533 14.824 162.788V149.257C14.536 146.34 13.956 142.438 13.3 138.031C11.915 128.718 10.195 117.153 10.195 107.88C10.195 98.346 11.151 90.906 12.862 85.057C13.797 79.429 16.977 72.402 22.219 66.402L22.541 65.647L22.35 65.969L6.513 64.137C2.79 64.026 -0.098 60.845 0.003 57.12L0.184 49.861C0.294 46.136 3.474 43.247 7.197 43.348L22.098 43.76C25.459 43.851 28.135 46.438 28.558 49.67C28.679 50.546 28.89 51.412 29.131 52.267L31.013 48.553C37.09 37.307 45.391 23.797 53.732 15.29C53.732 15.29 61.057 6.299 75.748 3.329L75.828 3.309C88.627 0.581 109.465 -0.124 129.89 0.017C150.315 -0.124 171.153 0.571 183.932 3.299L183.95 3.305C183.971 3.313 183.988 3.319 184.012 3.319C198.702 6.289 206.027 15.28 206.027 15.28C214.369 23.787 222.67 37.307 228.747 48.542L230.427 51.855C230.618 51.14 230.779 50.405 230.88 49.67C231.313 46.438 233.989 43.851 237.34 43.76L252.241 43.348ZM34.585 107.236C35.329 114.726 41.387 120.787 48.873 121.532C58.985 122.538 67.427 114.102 66.42 103.974C65.676 96.484 59.619 90.423 52.133 89.678C42.021 88.671 33.579 97.108 34.585 107.236ZM193.309 107.236C194.054 114.726 200.111 120.787 207.597 121.532C217.709 122.538 226.151 114.102 225.145 103.974C224.4 96.484 218.343 90.423 210.857 89.678C200.745 88.671 192.303 97.108 193.309 107.236ZM62.547 51.975V39.19C62.547 34.861 66.873 31.357 72.226 31.357H95.71C101.063 31.357 105.39 34.861 105.39 39.19V51.965C105.39 52.72 105.249 53.455 104.997 54.15H108.016C111.678 54.14 115.381 54.14 119.124 54.15H140.686C144.429 54.14 148.132 54.14 151.794 54.15H156.604C160.742 54.209 165.145 54.302 167.636 54.355L168.889 54.382C186.628 54.835 203.109 56.053 217.588 59.123C213.946 49.801 206.269 34.851 197.153 25.428C195.543 23.847 189.264 18.229 179.867 16.578C175.289 15.873 158.888 13.427 133.391 13.427H126.409C100.912 13.427 84.511 15.873 79.933 16.578C70.526 18.229 64.257 23.847 62.647 25.428C53.531 34.851 45.854 49.801 42.212 59.123C49.024 57.684 56.288 56.657 63.905 55.922C63.06 54.764 62.547 53.425 62.547 51.975ZM129.729 134.388C132.476 134.297 135.243 133.995 138.02 133.472C157.962 129.716 173.427 115.662 180.259 97.631C170.61 108.625 151.352 114.323 129.729 114.565C108.106 114.313 88.858 108.625 79.199 97.631C86.031 115.662 101.496 129.716 121.438 133.472C124.215 133.985 126.982 134.287 129.729 134.388ZM164.201 28.236H187.675L187.685 28.246C193.038 28.246 197.365 31.749 197.365 36.078V48.854C197.365 49.679 197.164 50.505 196.952 51.119C192.012 45.139 182.101 41.434 175.943 41.434C167.502 41.434 159.875 45.34 154.934 51.32C154.522 50.495 154.522 49.669 154.522 48.844V36.068C154.522 31.739 158.848 28.236 164.201 28.236Z" fill="currentColor" />
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
              Tell us who you are,
              <br />
              <span className="accent-gradient-text">and we'll handle the rest.</span>
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
                  initial={{ opacity: 1, y: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  whileHover={{ y: -4, borderColor: `${scenario.color}40` }}
                  onClick={() => handleScenarioClick(scenario)}
                  className="relative flex flex-col items-start text-left p-5 rounded-2xl border border-white/[0.04] overflow-hidden transition-all group cursor-pointer"
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
                           focus:border-eds-50 focus:ring-2 focus:ring-eds-50/20
                           placeholder:text-zinc-600 transition-all"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <button
                    type="submit"
                    disabled={!brand.trim()}
                    className="px-4 py-2 bg-eds-50 hover:bg-eds-50 text-white text-sm font-medium
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
              aria-label="Go back"
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
                         focus:border-eds-50 focus:ring-2 focus:ring-eds-50/20
                         placeholder:text-zinc-600 transition-all"
                autoFocus
              />
              <button
                type="submit"
                disabled={!brand.trim()}
                className="w-full mt-4 py-3.5 bg-eds-50 hover:bg-eds-50 text-white font-semibold rounded-xl
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
