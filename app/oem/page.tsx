"use client"

import { useState, useCallback } from "react"
import OemStepIndicator from "@/components/oem/OemStepIndicator"
import AssetUploader from "@/components/oem/AssetUploader"
import CopyEditor from "@/components/oem/CopyEditor"
import AdPreviewGrid from "@/components/oem/AdPreviewGrid"
import CtaScorecard from "@/components/oem/CtaScorecard"
import OptimizationPanel from "@/components/oem/OptimizationPanel"
import CompetitorIntel from "@/components/oem/CompetitorIntel"
import SharePanel from "@/components/oem/SharePanel"
import type {
  OemAssets,
  OemCopy,
  BrandColors,
  CtaSuggestion,
  OptimizationSet,
  CompetitorIntelData,
} from "@/lib/oem-types"

interface WizardState {
  step: number
  assets: OemAssets
  copy: OemCopy
  brandColors?: BrandColors
  ctaSuggestions?: CtaSuggestion[]
  optimizations?: OptimizationSet
  competitorIntel?: CompetitorIntelData
  campaignId?: string
  shareUrl?: string
}

const INITIAL_STATE: WizardState = {
  step: 0,
  assets: { logoUrl: "", imageUrls: [] },
  copy: { headline: "", cta: "", bodyText: "", brandName: "" },
}

export default function OemPage() {
  const [state, setState] = useState<WizardState>(INITIAL_STATE)

  const setStep = useCallback((step: number) => {
    setState((prev) => ({ ...prev, step }))
  }, [])

  const setAssets = useCallback((assets: OemAssets) => {
    setState((prev) => ({ ...prev, assets }))
  }, [])

  const setCopy = useCallback((copy: OemCopy) => {
    setState((prev) => ({ ...prev, copy }))
  }, [])

  const handleCtaApply = useCallback((cta: string) => {
    setState((prev) => ({
      ...prev,
      copy: { ...prev.copy, cta },
    }))
  }, [])

  const handleIntelligenceLoaded = useCallback((data: {
    ctaSuggestions?: CtaSuggestion[]
    optimizations?: OptimizationSet
    competitorIntel?: CompetitorIntelData
  }) => {
    setState((prev) => ({
      ...prev,
      ctaSuggestions: data.ctaSuggestions ?? prev.ctaSuggestions,
      optimizations: data.optimizations ?? prev.optimizations,
      competitorIntel: data.competitorIntel ?? prev.competitorIntel,
    }))
  }, [])

  const handleCampaignSaved = useCallback((campaignId: string, shareUrl: string) => {
    setState((prev) => ({ ...prev, campaignId, shareUrl }))
  }, [])

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <OemStepIndicator currentStep={state.step} brandName={state.copy.brandName || undefined} />

      <main className="max-w-4xl mx-auto px-6 py-10">
        {state.step === 0 && (
          <AssetUploader
            assets={state.assets}
            onAssetsChange={setAssets}
            onNext={() => setStep(1)}
          />
        )}

        {state.step === 1 && (
          <CopyEditor
            copy={state.copy}
            onCopyChange={setCopy}
            onNext={() => setStep(2)}
            onBack={() => setStep(0)}
          />
        )}

        {state.step === 2 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-2">Preview Your Ads</h2>
              <p className="text-zinc-400 text-sm">
                Your assets rendered in all 5 Edmunds display ad formats. Click any preview to expand.
              </p>
            </div>
            <AdPreviewGrid
              assets={state.assets}
              copy={state.copy}
              brandColors={state.brandColors}
            />
            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-zinc-200 border border-zinc-700 hover:border-zinc-500 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-eds-50 hover:bg-eds-60 text-white shadow-lg shadow-eds-50/20 transition-all"
              >
                Next: AI Intelligence →
              </button>
            </div>
          </div>
        )}

        {state.step === 3 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-2">AI Intelligence</h2>
              <p className="text-zinc-400 text-sm">
                Data-backed CTA scoring, demographic insights, and competitive intelligence.
              </p>
            </div>

            <CtaScorecard
              cta={state.copy.cta}
              brandName={state.copy.brandName}
              onApplyCta={handleCtaApply}
              onLoaded={(suggestions) => handleIntelligenceLoaded({ ctaSuggestions: suggestions })}
            />

            <OptimizationPanel
              copy={state.copy}
              brandName={state.copy.brandName}
              onLoaded={(optimizations) => handleIntelligenceLoaded({ optimizations })}
            />

            <CompetitorIntel
              brandName={state.copy.brandName}
              onLoaded={(competitorIntel) => handleIntelligenceLoaded({ competitorIntel })}
            />

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-zinc-200 border border-zinc-700 hover:border-zinc-500 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-eds-50 hover:bg-eds-60 text-white shadow-lg shadow-eds-50/20 transition-all"
              >
                Next: Save & Share →
              </button>
            </div>
          </div>
        )}

        {state.step === 4 && (
          <SharePanel
            assets={state.assets}
            copy={state.copy}
            brandColors={state.brandColors}
            ctaSuggestions={state.ctaSuggestions}
            optimizations={state.optimizations}
            competitorIntel={state.competitorIntel}
            campaignId={state.campaignId}
            shareUrl={state.shareUrl}
            onSaved={handleCampaignSaved}
            onBack={() => setStep(3)}
          />
        )}
      </main>
    </div>
  )
}
