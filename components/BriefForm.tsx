"use client"

import { useState } from "react"
import { motion } from "framer-motion"

type BriefMode = "talk" | "form" | "import"

interface BriefFormProps {
  brandName: string
  onSubmit: (description: string) => void
  isLoading?: boolean
}

export default function BriefForm({ brandName, onSubmit, isLoading }: BriefFormProps) {
  const [mode, setMode] = useState<BriefMode>("talk")
  const [description, setDescription] = useState("")

  // Quick form fields
  const [product, setProduct] = useState("")
  const [audience, setAudience] = useState("")
  const [goal, setGoal] = useState("")
  const [tone, setTone] = useState("")
  const [offer, setOffer] = useState("")

  const handleSubmit = () => {
    if (mode === "form") {
      const formDescription = [
        product && `Product: ${product}`,
        audience && `Target audience: ${audience}`,
        goal && `Campaign goal: ${goal}`,
        tone && `Tone: ${tone}`,
        offer && `Key offer: ${offer}`,
      ]
        .filter(Boolean)
        .join(". ")
      onSubmit(formDescription)
    } else {
      onSubmit(description)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto p-8"
    >
      <h2 className="text-3xl font-bold mb-2">Campaign Brief</h2>
      <p className="text-gray-500 mb-8">
        Tell us about the campaign for {brandName}
      </p>

      {/* Mode Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-8">
        {(
          [
            { key: "talk", label: "Just Talk" },
            { key: "form", label: "Quick Form" },
            { key: "import", label: "Import" },
          ] as const
        ).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              mode === key
                ? "bg-white shadow-sm text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Talk Mode */}
      {mode === "talk" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={`Describe the campaign in your own words...\n\nExample: "Summer clearance event for the 2025 R1T. Targeting adventure-loving millennials. Need Instagram and TikTok ads. Highlight the $5,000 off promotion and 0% APR financing."`}
            rows={6}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200
                     focus:border-blue-500 focus:outline-none transition-colors
                     placeholder:text-gray-300 resize-none"
          />
        </motion.div>
      )}

      {/* Form Mode */}
      {mode === "form" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <FormField label="Product / Vehicle" value={product} onChange={setProduct} placeholder="2025 Rivian R1T Adventure" />
          <FormField label="Target Audience" value={audience} onChange={setAudience} placeholder="Adventure-loving millennials, 28-42" />
          <FormField label="Campaign Goal" value={goal} onChange={setGoal} placeholder="Drive test drive bookings" />
          <FormField label="Tone" value={tone} onChange={setTone} placeholder="Bold, adventurous, premium" />
          <FormField label="Key Offer" value={offer} onChange={setOffer} placeholder="$5,000 off + 0% APR for 60 months" />
        </motion.div>
      )}

      {/* Import Mode */}
      {mode === "import" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center"
        >
          <p className="text-gray-400 mb-4">
            Drop a PDF brief or paste a URL
          </p>
          <input
            type="text"
            placeholder="Paste URL to existing brief..."
            className="w-full px-4 py-3 rounded-lg border border-gray-200
                     focus:border-blue-500 focus:outline-none text-center"
            onChange={(e) => setDescription(e.target.value)}
          />
        </motion.div>
      )}

      {/* Submit */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full mt-8 py-4 bg-blue-600 text-white font-semibold rounded-2xl
                 hover:bg-blue-700 disabled:opacity-40 transition-all text-lg"
      >
        {isLoading ? "Generating..." : "Generate Campaign →"}
      </motion.button>
    </motion.div>
  )
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border border-gray-200
                 focus:border-blue-500 focus:outline-none transition-colors
                 placeholder:text-gray-300"
      />
    </div>
  )
}
