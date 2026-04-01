"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import BrandInput from "@/components/BrandInput"
import type { UserType } from "@/components/BrandInput"

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleBrandSubmit = async (brandName: string, userType?: UserType) => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/brand-dna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandName }),
      })

      if (!response.ok) throw new Error("Failed to analyze brand")

      const { brandDna, edmundsData } = await response.json()

      // Store brand DNA, Edmunds market data, and user type for downstream pages
      sessionStorage.setItem("eds_brand_dna", JSON.stringify(brandDna))
      if (edmundsData) {
        sessionStorage.setItem("eds_edmunds_market", JSON.stringify(edmundsData))
      }
      if (userType) {
        sessionStorage.setItem("eds_user_type", userType)
      }
      router.push("/onboard")
    } catch (error) {
      console.error("Brand analysis failed:", error)
      setIsLoading(false)
    }
  }

  return <BrandInput onSubmit={handleBrandSubmit} isLoading={isLoading} />
}
