"use client"

import { usePathname } from "next/navigation"

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

  return (
    <nav aria-label="Progress" className="w-full px-6 py-4 relative z-20">
      <ol className="flex items-center justify-center gap-1 max-w-2xl mx-auto">
        {STEPS.map((step, i) => {
          const isCompleted = currentIndex > i
          const isCurrent = currentIndex === i

          return (
            <li key={step.path} className="flex items-center gap-1 flex-1">
              {/* Step dot + label */}
              <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
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
                  className={`text-[10px] tracking-wide truncate max-w-full ${
                    isCurrent ? "text-eds-60 font-semibold" : isCompleted ? "text-zinc-400" : "text-zinc-600"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line (skip after last step) */}
              {i < STEPS.length - 1 && (
                <div
                  className={`h-px flex-1 min-w-4 mt-[-18px] transition-colors ${
                    currentIndex > i ? "bg-eds-50" : "bg-zinc-700/50"
                  }`}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
