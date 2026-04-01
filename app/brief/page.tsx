"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import BriefForm from "@/components/BriefForm"
import { BrandDNA } from "@/lib/types"
import type { UserType } from "@/components/BrandInput"

export default function BriefPage() {
  const router = useRouter()
  const [brandDna, setBrandDna] = useState<BrandDNA | null>(null)
  const [userType, setUserType] = useState<UserType>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem("adgenai_brand_dna")
    const storedType = sessionStorage.getItem("adgenai_user_type") as UserType
    if (stored) {
      setBrandDna(JSON.parse(stored))
      setUserType(storedType)
    } else {
      router.push("/")
    }
  }, [router])

  const handleSubmit = async (description: string) => {
    setIsLoading(true)
    sessionStorage.setItem("adgenai_campaign_description", description)
    router.push("/pipeline")
  }

  if (!brandDna) return null

  return (
    <div className="min-h-screen flex items-center justify-center">
      <BriefForm
        brandName={brandDna.name}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        userType={userType}
      />
    </div>
  )
}
