"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import type { UserType } from "@/components/BrandInput"

type BriefMode = "talk" | "form"

interface BriefFormProps {
  brandName: string
  onSubmit: (description: string) => void
  isLoading?: boolean
  userType?: UserType
}

// Scenario-specific configuration
const SCENARIO_CONFIG: Record<string, {
  defaultMode: BriefMode
  heading: string
  subtitle: string
  talkPlaceholder: string
  formFields: { label: string; placeholder: string; key: string }[]
}> = {
  oem: {
    defaultMode: "form",
    heading: "OEM Campaign Brief",
    subtitle: "Full creative control with brand compliance built in",
    talkPlaceholder: `Describe the national campaign...\n\nExample: "Q3 brand awareness push for the R1T lineup. Target: outdoor enthusiasts 28-45. Channels: YouTube pre-roll, Instagram Stories, TikTok. Key message: adventure meets sustainability. Include $5,000 loyalty bonus for existing owners."`,
    formFields: [
      { label: "Campaign Name", placeholder: "Q3 Adventure Series — R1T Launch", key: "campaign" },
      { label: "Vehicle / Product Line", placeholder: "2025 Rivian R1T Adventure Package", key: "product" },
      { label: "Target Audience", placeholder: "Outdoor enthusiasts, 28-45, HHI $120K+", key: "audience" },
      { label: "Campaign Goal", placeholder: "Brand awareness + test drive bookings", key: "goal" },
      { label: "Key Message / Offer", placeholder: "$5,000 loyalty bonus for existing EV owners", key: "offer" },
      { label: "Platforms", placeholder: "YouTube, Instagram, TikTok, Display", key: "platforms" },
      { label: "Brand Tone", placeholder: "Bold, adventurous, premium, sustainable", key: "tone" },
    ],
  },
  "dealer-group": {
    defaultMode: "form",
    heading: "Dealer Group Campaign",
    subtitle: "Consistent brand-compliant ads across all your locations",
    talkPlaceholder: `Describe what you need across your stores...\n\nExample: "End-of-year clearance across all 12 Valley Subaru locations. Need consistent social ads that feel on-brand but include each store's local info. Push the 0% APR on remaining 2024 Outbacks and Foresters."`,
    formFields: [
      { label: "Promotion / Event", placeholder: "Year-end clearance event", key: "campaign" },
      { label: "Vehicles to Feature", placeholder: "2024 Outback, 2024 Forester, 2025 Crosstrek", key: "product" },
      { label: "Target Market", placeholder: "Families, outdoor active, 30-55", key: "audience" },
      { label: "Number of Locations", placeholder: "12 stores across Arizona", key: "locations" },
      { label: "Key Offer / Incentive", placeholder: "0% APR for 72 months + $2,500 off MSRP", key: "offer" },
      { label: "Platforms", placeholder: "Facebook, Instagram, Google Display", key: "platforms" },
    ],
  },
  "single-dealer": {
    defaultMode: "talk",
    heading: "What do you want to promote?",
    subtitle: "Just tell us in plain English — we'll handle the rest",
    talkPlaceholder: `Just describe it like you'd text a friend...\n\nExamples:\n• "We got a bunch of 2024 Camrys we need to move. 0% financing."\n• "Grand opening this Saturday, free hot dogs, test drives"\n• "New Tacomas just hit the lot, want something for TikTok"`,
    formFields: [
      { label: "What are you promoting?", placeholder: "2024 Camry clearance", key: "product" },
      { label: "Any special offer?", placeholder: "0% APR + free maintenance for a year", key: "offer" },
      { label: "When does it end?", placeholder: "End of month", key: "deadline" },
    ],
  },
}

const DEFAULT_CONFIG = SCENARIO_CONFIG["single-dealer"]

export default function BriefForm({ brandName, onSubmit, isLoading, userType }: BriefFormProps) {
  const config = (userType && SCENARIO_CONFIG[userType]) || DEFAULT_CONFIG
  const [mode, setMode] = useState<BriefMode>(config.defaultMode)
  const [description, setDescription] = useState("")
  const [formValues, setFormValues] = useState<Record<string, string>>({})

  // Update default mode when userType changes
  useEffect(() => {
    if (userType && SCENARIO_CONFIG[userType]) {
      setMode(SCENARIO_CONFIG[userType].defaultMode)
    }
  }, [userType])

  const updateField = (key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = () => {
    if (mode === "form") {
      const formDescription = config.formFields
        .map((f) => formValues[f.key] && `${f.label}: ${formValues[f.key]}`)
        .filter(Boolean)
        .join(". ")
      onSubmit(formDescription)
    } else {
      onSubmit(description)
    }
  }

  const hasContent = mode === "form"
    ? Object.values(formValues).some((v) => v.trim())
    : description.trim().length > 0

  return (
    <div className="relative min-h-screen py-12 px-6">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-eds-50/5 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-2xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-eds-50" />
            <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
              Step 2 · {brandName}
            </span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">{config.heading}</h2>
          <p className="text-zinc-500 mt-1">{config.subtitle}</p>
        </div>

        {/* Mode Tabs */}
        <div className="flex gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-xl mb-8">
          {(
            [
              { key: "talk", label: "Just Talk", icon: "💬" },
              { key: "form", label: "Quick Form", icon: "📋" },
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
              placeholder={config.talkPlaceholder}
              rows={7}
              className="w-full px-4 py-4 rounded-xl bg-zinc-900 border border-zinc-800
                       focus:border-eds-50 focus:ring-2 focus:ring-eds-50/20
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
            {config.formFields.map((field) => (
              <FormField
                key={field.key}
                label={field.label}
                value={formValues[field.key] || ""}
                onChange={(v) => updateField(field.key, v)}
                placeholder={field.placeholder}
              />
            ))}
          </motion.div>
        )}

        {/* Submit */}
        <motion.button
          whileHover={{ scale: 1.005 }}
          whileTap={{ scale: 0.995 }}
          onClick={handleSubmit}
          disabled={isLoading || !hasContent}
          className="w-full mt-8 py-4 bg-eds-50 hover:bg-eds-50 text-white font-semibold
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
                 focus:border-eds-50 focus:ring-2 focus:ring-eds-50/20
                 placeholder:text-zinc-600 text-sm"
      />
    </div>
  )
}
