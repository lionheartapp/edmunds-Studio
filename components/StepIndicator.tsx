"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

const STEPS = [
  { label: "Brand DNA", path: "/onboard" },
  { label: "Brief", path: "/brief" },
  { label: "Competitors", path: "/competitors" },
  { label: "Strategy", path: "/strategy" },
  { label: "Dashboard", path: "/dashboard" },
] as const

export default function StepIndicator() {
  const pathname = usePathname()
  const currentIndex = STEPS.findIndex((s) => s.path === pathname)
  const [scrolled, setScrolled] = useState(false)
  const [brand, setBrand] = useState<{ name: string; logoUrl?: string; domain?: string } | null>(null)

  // Read brand info from sessionStorage once on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("eds_brand_dna")
      if (stored) {
        const parsed = JSON.parse(stored)
        setBrand({ name: parsed.name, logoUrl: parsed.logoUrl, domain: parsed.domain })
      }
    } catch {}
  }, [])

  // Track scroll for drop shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <nav
      aria-label="Progress"
      className={`sticky top-0 z-50 w-full px-6 py-3 transition-shadow duration-300 ${
        scrolled ? "shadow-[0_4px_24px_rgba(0,0,0,0.5)]" : ""
      }`}
      style={{
        background: scrolled
          ? "rgba(9, 9, 11, 0.92)"
          : "rgba(9, 9, 11, 0.6)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-6">
        {/* Left: Brand identity */}
        <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
          {brand?.logoUrl ? (
            <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center p-1.5 overflow-hidden flex-shrink-0">
              <img
                src={brand.logoUrl}
                alt={`${brand.name} logo`}
                className="w-full h-full object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
              />
            </div>
          ) : brand ? (
            <div
              className="w-3 h-3 rounded-full bg-eds-50 flex-shrink-0"
              style={{ boxShadow: "0 0 10px rgba(32, 112, 232, 0.4)" }}
            />
          ) : null}
          {brand && (
            <div className="min-w-0">
              <h2 className="text-base font-bold tracking-tight truncate">{brand.name}</h2>
              {brand.domain && (
                <p className="text-[11px] text-zinc-500 truncate">{brand.domain}</p>
              )}
            </div>
          )}
        </div>

        {/* Right: Step indicators */}
        <ol className="flex items-center gap-1 flex-shrink-0">
          {STEPS.map((step, i) => {
            const isCompleted = currentIndex > i
            const isCurrent = currentIndex === i

            return (
              <li key={step.path} className="flex items-center gap-1">
                {/* Step dot + label */}
                <div className="flex flex-col items-center gap-1 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${
                      isCompleted
                        ? "bg-eds-50 border-eds-50 text-white"
                        : isCurrent
                          ? "bg-eds-50/20 border-eds-50 text-eds-60"
                          : "bg-zinc-800/50 border-zinc-700 text-zinc-500"
                    }`}
                  >
                    {isCompleted ? (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 6l3 3 5-5" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span
                    className={`text-[10px] tracking-wide whitespace-nowrap ${
                      isCurrent ? "text-eds-60 font-semibold" : isCompleted ? "text-zinc-400" : "text-zinc-600"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div
                    className={`h-px w-6 md:w-10 mt-[-14px] transition-colors ${
                      currentIndex > i ? "bg-eds-50" : "bg-zinc-700/50"
                    }`}
                  />
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </nav>
  )
}
