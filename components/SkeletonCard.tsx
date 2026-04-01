"use client"

interface SkeletonCardProps {
  className?: string
  lines?: number
}

export default function SkeletonCard({ className = "", lines = 3 }: SkeletonCardProps) {
  return (
    <div
      className={`relative rounded-2xl border border-white/[0.04] p-5 overflow-hidden ${className}`}
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Shimmer overlay */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_ease-in-out_infinite]"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)",
        }}
      />

      {/* Skeleton lines */}
      <div className="space-y-3">
        <div className="h-3 w-24 rounded bg-zinc-800 animate-pulse" />
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-2.5 rounded bg-zinc-800/60 animate-pulse"
            style={{ width: `${85 - i * 15}%`, animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  )
}
