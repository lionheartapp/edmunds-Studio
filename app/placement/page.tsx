"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import AdPlacement from "@/components/AdPlacement"
import { BrandDNA, PreBuiltCampaign } from "@/lib/types"

export default function PlacementPage() {
  const router = useRouter()
  const [brandDna, setBrandDna] = useState<BrandDNA | null>(null)
  const [campaign, setCampaign] = useState<PreBuiltCampaign | null>(null)
  const [placed, setPlaced] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const storedDna = sessionStorage.getItem("eds_brand_dna")
    const storedCampaign = sessionStorage.getItem("eds_selected_campaign")

    if (storedDna) {
      setBrandDna(JSON.parse(storedDna))
    } else {
      router.push("/")
      return
    }

    if (storedCampaign) {
      setCampaign(JSON.parse(storedCampaign))
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [router])

  const handlePlace = (config: unknown) => {
    console.log("Placing ad:", config)
    setPlaced(true)
    // After a moment, redirect back to dashboard
    timeoutRef.current = setTimeout(() => {
      router.push("/dashboard")
    }, 3000)
  }

  const handleBack = () => {
    router.push("/dashboard")
  }

  if (!brandDna || !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-eds-50 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {placed ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="min-h-screen flex flex-col items-center justify-center px-6"
          >
            {/* Success checkmark */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.2 }}
              className="w-24 h-24 rounded-full flex items-center justify-center mb-6 bg-gradient-to-br from-eds-50 to-eds-30"
              style={{ boxShadow: "0 0 60px rgba(99,102,241,0.25)" }}
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-bold text-white mb-3"
            >
              Campaign Submitted!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-zinc-400 text-center max-w-md"
            >
              Your &ldquo;{campaign.name}&rdquo; campaign has been submitted to Edmunds for review.
              You&apos;ll receive approval within 24 hours.
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-zinc-600 text-sm mt-6"
            >
              Redirecting to dashboard...
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            key="placement"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AdPlacement
              campaign={{
                name: campaign.name,
                headline: campaign.headline,
                bodyText: campaign.bodyText,
                cta: campaign.cta,
                format: campaign.format,
                thumbnailDesc: campaign.thumbnailDesc,
                platform: campaign.platform,
                targetAudience: campaign.targetAudience,
              }}
              brandColors={{
                primary: brandDna.colors.primary,
                secondary: brandDna.colors.secondary,
                accent: brandDna.colors.accent,
              }}
              brandName={brandDna.name}
              onPlace={handlePlace}
              onBack={handleBack}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
