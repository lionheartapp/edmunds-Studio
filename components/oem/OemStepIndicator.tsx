"use client"

import { useEffect, useState } from "react"

const OEM_STEPS = [
  { label: "Assets", icon: "upload" },
  { label: "Copy", icon: "text" },
  { label: "Preview", icon: "eye" },
  { label: "Intelligence", icon: "brain" },
  { label: "Share", icon: "share" },
] as const

interface OemStepIndicatorProps {
  currentStep: number // 0-indexed
  brandName?: string
}

const StepIcon = ({ icon, size = 12 }: { icon: string; size?: number }) => {
  switch (icon) {
    case "upload":
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 10V3M5 5.5L8 2.5l3 3M3 11v2h10v-2" />
        </svg>
      )
    case "text":
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 4h10M3 8h7M3 12h5" />
        </svg>
      )
    case "eye":
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5Z" />
          <circle cx="8" cy="8" r="2" />
        </svg>
      )
    case "brain":
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 14V8M5 6a3 3 0 0 1 3-3 3 3 0 0 1 3 3M3.5 9A2.5 2.5 0 0 1 5 5M11 5a2.5 2.5 0 0 1 1.5 4M5 11a3 3 0 0 0 3 3 3 3 0 0 0 3-3" />
        </svg>
      )
    case "share":
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="4" r="2" />
          <circle cx="4" cy="8" r="2" />
          <circle cx="12" cy="12" r="2" />
          <path d="M6 7l4-2M6 9l4 2" />
        </svg>
      )
    default:
      return null
  }
}

export default function OemStepIndicator({ currentStep, brandName }: OemStepIndicatorProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <nav
      aria-label="OEM Campaign Progress"
      className={`sticky top-0 z-50 w-full px-6 py-3 transition-shadow duration-300 ${
        scrolled ? "shadow-[0_4px_24px_rgba(0,0,0,0.5)]" : ""
      }`}
      style={{
        background: scrolled ? "rgba(9, 9, 11, 0.92)" : "rgba(9, 9, 11, 0.6)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-6">
        {/* Left: Brand identity */}
        <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
          <div
            className="w-3 h-3 rounded-full bg-eds-50 flex-shrink-0"
            style={{ boxShadow: "0 0 10px rgba(32, 112, 232, 0.4)" }}
          />
          <div className="min-w-0">
            <h2 className="text-base font-bold tracking-tight truncate">
              {brandName || "OEM Campaign"}
            </h2>
            <p className="text-[11px] text-zinc-500">Upload & Preview</p>
          </div>
        </div>

        {/* Right: Step indicators */}
        <ol className="flex items-center gap-1 flex-shrink-0">
          {OEM_STEPS.map((step, i) => {
            const isCompleted = currentStep > i
            const isCurrent = currentStep === i

            return (
              <li key={step.label} className="flex items-center gap-1">
                <div className="flex flex-col items-center gap-1 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                      isCompleted
                        ? "bg-eds-50 border border-eds-50 text-white"
                        : isCurrent
                          ? "bg-eds-50/20 border border-eds-50 text-eds-60"
                          : "bg-zinc-800/50 border border-zinc-700 text-zinc-500"
                    }`}
                  >
                    {isCompleted ? (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 6l3 3 5-5" />
                      </svg>
                    ) : (
                      <StepIcon icon={step.icon} />
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

                {i < OEM_STEPS.length - 1 && (
                  <div
                    className={`h-px w-6 md:w-10 mt-[-14px] transition-colors ${
                      currentStep > i ? "bg-eds-50" : "bg-zinc-700/50"
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
