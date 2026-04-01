"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import BrandInput from "@/components/BrandInput"

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleBrandSubmit = async (brandName: string) => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/brand-dna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandName }),
      })

      if (!response.ok) throw new Error("Failed to analyze brand")

      const { brandDna } = await response.json()

      // Store in sessionStorage for the next page
      sessionStorage.setItem("adgenai_brand_dna", JSON.stringify(brandDna))
      router.push("/onboard")
    } catch (error) {
      console.error("Brand analysis failed:", error)
      setIsLoading(false)
    }
  }

  return <BrandInput onSubmit={handleBrandSubmit} isLoading={isLoading} />
}
