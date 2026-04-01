"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import BrandDNACard from "@/components/BrandDNACard"
import { BrandDNA } from "@/lib/types"

export default function OnboardPage() {
  const router = useRouter()
  const [brandDna, setBrandDna] = useState<BrandDNA | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem("adgenai_brand_dna")
    if (stored) {
      setBrandDna(JSON.parse(stored))
    } else {
      router.push("/")
    }
  }, [router])

  const handleContinue = () => {
    router.push("/competitors")
  }

  const handleEdit = (field: string) => {
    // TODO: Open inline editor for the field
    console.log("Edit field:", field)
  }

  if (!brandDna) return null

  return (
    <div className="min-h-screen">
      <BrandDNACard brandDna={brandDna} onContinue={handleContinue} onEdit={handleEdit} />
    </div>
  )
}
