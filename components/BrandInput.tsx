"use client"

import { useState } from "react"
import { motion } from "framer-motion"

interface BrandInputProps {
  onSubmit: (brandName: string) => void
  isLoading?: boolean
}

const QUICK_BRANDS = [
  { name: "Rivian", emoji: "🏔️" },
  { name: "Subaru", emoji: "🌲" },
  { name: "Toyota", emoji: "🚗" },
]

export default function BrandInput({ onSubmit, isLoading }: BrandInputProps) {
  const [brand, setBrand] = useState("")

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

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
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

        {/* Input */}
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
              className="w-full px-5 py-4 text-base rounded-xl bg-zinc-900 border border-zinc-800
                       focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
                       placeholder:text-zinc-600 transition-all"
              autoFocus
              disabled={isLoading}
            />
            {brand.trim() && !isLoading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium
                           rounded-lg transition-colors"
                >
                  Analyze →
                </button>
              </motion.div>
            )}
          </motion.div>

          {/* Full width submit button for when typing */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4"
          >
            <button
              type="submit"
              disabled={!brand.trim() || isLoading}
              className="w-full py-3.5 px-8 bg-indigo-600 text-white font-semibold rounded-xl
                       hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed
                       transition-all duration-200 glow-sm"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-3">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Analyzing brand intelligence...
                </span>
              ) : (
                "Analyze Brand"
              )}
            </button>
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
                disabled={isLoading}
                className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800
                         hover:border-zinc-700 hover:bg-zinc-800 text-sm text-zinc-400
                         hover:text-zinc-200 transition-all disabled:opacity-40"
              >
                {emoji} {name}
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
