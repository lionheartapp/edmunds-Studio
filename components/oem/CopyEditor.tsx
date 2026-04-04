"use client"

import { useState, useCallback } from "react"
import type { OemCopy } from "@/lib/oem-types"

interface CopyEditorProps {
  copy: OemCopy
  onCopyChange: (copy: OemCopy) => void
  onNext: () => void
  onBack: () => void
}

const LIMITS = {
  brandName: 60,
  headline: 90,
  cta: 30,
  bodyText: 250,
} as const

export default function CopyEditor({ copy, onCopyChange, onNext, onBack }: CopyEditorProps) {
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const handleChange = useCallback((field: keyof OemCopy, value: string) => {
    const limit = LIMITS[field]
    const trimmed = value.slice(0, limit)
    onCopyChange({ ...copy, [field]: trimmed })
  }, [copy, onCopyChange])

  const handleBlur = useCallback((field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }, [])

  const errors: Partial<Record<keyof OemCopy, string>> = {}
  if (touched.brandName && !copy.brandName.trim()) errors.brandName = "Brand name is required"
  if (touched.headline && !copy.headline.trim()) errors.headline = "Headline is required"
  if (touched.cta && !copy.cta.trim()) errors.cta = "CTA text is required"
  if (touched.bodyText && !copy.bodyText.trim()) errors.bodyText = "Body text is required"

  const canProceed =
    copy.brandName.trim().length > 0 &&
    copy.headline.trim().length > 0 &&
    copy.cta.trim().length > 0 &&
    copy.bodyText.trim().length > 0

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Enter Your Copy</h2>
        <p className="text-zinc-400 text-sm">
          Add the headline, CTA, and body text your agency prepared. We&apos;ll preview them in Edmunds ad formats.
        </p>
      </div>

      <div className="space-y-6">
        {/* Brand Name */}
        <CopyField
          label="Brand Name"
          required
          value={copy.brandName}
          onChange={(v) => handleChange("brandName", v)}
          onBlur={() => handleBlur("brandName")}
          placeholder="e.g. Ford, Toyota, Rivian"
          maxLength={LIMITS.brandName}
          error={errors.brandName}
        />

        {/* Headline */}
        <CopyField
          label="Headline"
          required
          value={copy.headline}
          onChange={(v) => handleChange("headline", v)}
          onBlur={() => handleBlur("headline")}
          placeholder="e.g. The All-New 2026 Ford Explorer"
          maxLength={LIMITS.headline}
          error={errors.headline}
        />

        {/* CTA */}
        <CopyField
          label="CTA Text"
          required
          value={copy.cta}
          onChange={(v) => handleChange("cta", v)}
          onBlur={() => handleBlur("cta")}
          placeholder="e.g. Build & Price Yours"
          maxLength={LIMITS.cta}
          error={errors.cta}
          hint="Short, action-oriented — this will be scored by our AI"
        />

        {/* Body Text */}
        <CopyField
          label="Body Text"
          required
          value={copy.bodyText}
          onChange={(v) => handleChange("bodyText", v)}
          onBlur={() => handleBlur("bodyText")}
          placeholder="e.g. Starting at $36,000. Available with hybrid powertrain and BlueCruise hands-free driving."
          maxLength={LIMITS.bodyText}
          multiline
          error={errors.bodyText}
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-zinc-200 border border-zinc-700 hover:border-zinc-500 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            canProceed
              ? "bg-eds-50 hover:bg-eds-60 text-white shadow-lg shadow-eds-50/20"
              : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
          }`}
        >
          Next: Preview Ads →
        </button>
      </div>
    </div>
  )
}

// ─── Copy Field ─────────────────────────────────────────────

function CopyField({
  label,
  required,
  value,
  onChange,
  onBlur,
  placeholder,
  maxLength,
  multiline,
  error,
  hint,
}: {
  label: string
  required?: boolean
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  placeholder: string
  maxLength: number
  multiline?: boolean
  error?: string
  hint?: string
}) {
  const charCount = value.length
  const nearLimit = charCount > maxLength * 0.85
  const atLimit = charCount >= maxLength

  const inputClasses = `w-full bg-zinc-900/50 border rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 transition-colors focus:outline-none focus:border-eds-50 focus:ring-1 focus:ring-eds-50/30 ${
    error ? "border-red-500/50" : "border-zinc-700 hover:border-zinc-500"
  }`

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium text-zinc-300">
          {label} {required && <span className="text-eds-50">*</span>}
        </label>
        <span
          className={`text-xs tabular-nums ${
            atLimit ? "text-red-400" : nearLimit ? "text-amber-400" : "text-zinc-600"
          }`}
        >
          {charCount}/{maxLength}
        </span>
      </div>
      {hint && <p className="text-xs text-zinc-500">{hint}</p>}
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={3}
          className={`${inputClasses} resize-none`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          maxLength={maxLength}
          className={inputClasses}
        />
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
