"use client"

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export default function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load this data. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      className="relative rounded-2xl border border-red-500/20 p-8 text-center overflow-hidden"
      style={{
        background: "linear-gradient(135deg, rgba(239,68,68,0.05) 0%, rgba(239,68,68,0.02) 100%)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-zinc-200 mb-1">{title}</h3>
      <p className="text-sm text-zinc-400 mb-5">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-5 py-2.5 bg-red-500/15 hover:bg-red-500/25 text-red-300 text-sm font-medium rounded-lg border border-red-500/20 transition-colors"
        >
          Retry
        </button>
      )}
    </div>
  )
}
