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
    <div className="relative min-h-screen py-12 px-6">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-2xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500" />
            <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
              Step 2
            </span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Campaign Brief</h2>
          <p className="text-zinc-500 mt-1">
            Tell us about the campaign for <span className="text-zinc-300 font-medium">{brandName}</span>
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="flex gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-xl mb-8">
          {(
            [
              { key: "talk", label: "Just Talk", icon: "💬" },
              { key: "form", label: "Quick Form", icon: "📋" },
              { key: "import", label: "Import", icon: "📎" },
            ] as const
          ).map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setMode(key)}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                mode === key
                  ? "bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <span className="text-xs">{icon}</span>
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
              rows={7}
              className="w-full px-4 py-4 rounded-xl bg-zinc-900 border border-zinc-800
                       focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
                       placeholder:text-zinc-600 resize-none text-sm leading-relaxed"
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
            className="border border-dashed border-zinc-700 rounded-xl p-12 text-center bg-zinc-900/50"
          >
            <div className="text-3xl mb-3">📄</div>
            <p className="text-zinc-500 mb-4 text-sm">
              Drop a PDF brief or paste a URL
            </p>
            <input
              type="text"
              placeholder="Paste URL to existing brief..."
              className="w-full max-w-sm mx-auto px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700
                       focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-center text-sm"
              onChange={(e) => setDescription(e.target.value)}
            />
          </motion.div>
        )}

        {/* Submit */}
        <motion.button
          whileHover={{ scale: 1.005 }}
          whileTap={{ scale: 0.995 }}
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full mt-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold
                   rounded-xl disabled:opacity-30 transition-all glow-sm"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-3">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              />
              Generating creative brief...
            </span>
          ) : (
            "Generate Campaign →"
          )}
        </motion.button>
      </motion.div>
    </div>
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
      <label className="block text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wider">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800
                 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
                 placeholder:text-zinc-600 text-sm"
      />
    </div>
  )
}
