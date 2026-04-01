"use client"

import { useState } from "react"
import { motion } from "framer-motion"

interface BrandInputProps {
  onSubmit: (brandName: string) => void
  isLoading?: boolean
}

export default function BrandInput({ onSubmit, isLoading }: BrandInputProps) {
  const [brand, setBrand] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (brand.trim()) {
      onSubmit(brand.trim())
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col items-center justify-center min-h-screen px-6"
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-2 text-sm font-medium tracking-widest uppercase text-gray-400"
      >
        AdGenAI
      </motion.div>

      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-4xl md:text-5xl font-bold text-center mb-12 tracking-tight"
      >
        What brand are you
        <br />
        creating ads for?
      </motion.h1>

      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Rivian, Toyota, Valley Subaru..."
            className="w-full px-6 py-4 text-lg rounded-2xl border-2 border-gray-200
                     focus:border-blue-500 focus:outline-none transition-colors
                     placeholder:text-gray-300"
            autoFocus
            disabled={isLoading}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6"
        >
          <button
            type="submit"
            disabled={!brand.trim() || isLoading}
            className="w-full py-4 px-8 bg-blue-600 text-white font-semibold rounded-2xl
                     hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed
                     transition-all duration-200 text-lg"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                Analyzing...
              </span>
            ) : (
              "Analyze Brand →"
            )}
          </button>
        </motion.div>
      </form>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="mt-8 text-sm text-gray-400"
      >
        Enter a brand name or company domain
      </motion.p>
    </motion.div>
  )
}
