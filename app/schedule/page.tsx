"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import ScheduleCalendar from "@/components/ScheduleCalendar"
import { ScheduleSlot } from "@/lib/types"

// Claude pre-fills optimal posting times
const DEFAULT_SLOTS: ScheduleSlot[] = [
  {
    platform: "instagram_feed",
    variantId: "v1",
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    caption: "",
    hashtags: [],
    status: "draft",
  },
  {
    platform: "instagram_story",
    variantId: "v1",
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000 + 3600000).toISOString(),
    caption: "",
    hashtags: [],
    status: "draft",
  },
  {
    platform: "tiktok",
    variantId: "v1",
    scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    caption: "",
    hashtags: [],
    status: "draft",
  },
  {
    platform: "facebook_feed",
    variantId: "v2",
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000 + 7200000).toISOString(),
    caption: "",
    hashtags: [],
    status: "draft",
  },
]

export default function SchedulePage() {
  const router = useRouter()
  const [slots, setSlots] = useState<ScheduleSlot[]>(DEFAULT_SLOTS)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleUpdateSlot = (index: number, updates: Partial<ScheduleSlot>) => {
    setSlots((prev) =>
      prev.map((slot, i) => (i === index ? { ...slot, ...updates } : slot))
    )
  }

  const handleScheduleAll = () => {
    setSlots((prev) => prev.map((slot) => ({ ...slot, status: "scheduled" as const })))
    timeoutRef.current = setTimeout(() => router.push("/dashboard"), 1000)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <ScheduleCalendar
        slots={slots}
        onUpdateSlot={handleUpdateSlot}
        onScheduleAll={handleScheduleAll}
      />
    </div>
  )
}
