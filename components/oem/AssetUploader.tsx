"use client"

import { useState, useCallback, useRef } from "react"
import type { OemAssets } from "@/lib/oem-types"

interface AssetUploaderProps {
  assets: OemAssets
  onAssetsChange: (assets: OemAssets) => void
  onNext: () => void
}

const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024 // 50MB
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"]
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm"]

interface UploadState {
  uploading: boolean
  error: string | null
}

export default function AssetUploader({ assets, onAssetsChange, onNext }: AssetUploaderProps) {
  const [logoState, setLogoState] = useState<UploadState>({ uploading: false, error: null })
  const [imagesState, setImagesState] = useState<UploadState>({ uploading: false, error: null })
  const [videoState, setVideoState] = useState<UploadState>({ uploading: false, error: null })
  const logoInputRef = useRef<HTMLInputElement>(null)
  const imagesInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const uploadFile = useCallback(async (file: File, type: "logo" | "image" | "video"): Promise<string | null> => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("type", type)

    try {
      const response = await fetch("/api/oem/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: "Upload failed" }))
        throw new Error(err.error || "Upload failed")
      }

      const data = await response.json()
      return data.url
    } catch (err) {
      console.error(`[AssetUploader] ${type} upload failed:`, err)
      throw err
    }
  }, [])

  const handleLogoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setLogoState({ uploading: false, error: "Logo must be PNG, JPG, SVG, or WebP" })
      return
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setLogoState({ uploading: false, error: "Logo must be under 10MB" })
      return
    }

    setLogoState({ uploading: true, error: null })
    try {
      const url = await uploadFile(file, "logo")
      if (url) {
        onAssetsChange({ ...assets, logoUrl: url })
      }
      setLogoState({ uploading: false, error: null })
    } catch (err) {
      setLogoState({ uploading: false, error: err instanceof Error ? err.message : "Upload failed" })
    }
  }, [assets, onAssetsChange, uploadFile])

  const handleImagesUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const totalImages = assets.imageUrls.length + files.length
    if (totalImages > 5) {
      setImagesState({ uploading: false, error: "Maximum 5 vehicle images" })
      return
    }

    for (const file of Array.from(files)) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setImagesState({ uploading: false, error: "Images must be PNG, JPG, SVG, or WebP" })
        return
      }
      if (file.size > MAX_IMAGE_SIZE) {
        setImagesState({ uploading: false, error: "Each image must be under 10MB" })
        return
      }
    }

    setImagesState({ uploading: true, error: null })
    try {
      const urls: string[] = []
      for (const file of Array.from(files)) {
        const url = await uploadFile(file, "image")
        if (url) urls.push(url)
      }
      onAssetsChange({ ...assets, imageUrls: [...assets.imageUrls, ...urls] })
      setImagesState({ uploading: false, error: null })
    } catch (err) {
      setImagesState({ uploading: false, error: err instanceof Error ? err.message : "Upload failed" })
    }
  }, [assets, onAssetsChange, uploadFile])

  const handleVideoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      setVideoState({ uploading: false, error: "Video must be MP4 or WebM" })
      return
    }
    if (file.size > MAX_VIDEO_SIZE) {
      setVideoState({ uploading: false, error: "Video must be under 50MB" })
      return
    }

    setVideoState({ uploading: true, error: null })
    try {
      const url = await uploadFile(file, "video")
      if (url) {
        onAssetsChange({ ...assets, videoUrl: url })
      }
      setVideoState({ uploading: false, error: null })
    } catch (err) {
      setVideoState({ uploading: false, error: err instanceof Error ? err.message : "Upload failed" })
    }
  }, [assets, onAssetsChange, uploadFile])

  const removeImage = useCallback((index: number) => {
    onAssetsChange({
      ...assets,
      imageUrls: assets.imageUrls.filter((_, i) => i !== index),
    })
  }, [assets, onAssetsChange])

  const removeLogo = useCallback(() => {
    onAssetsChange({ ...assets, logoUrl: "" })
  }, [assets, onAssetsChange])

  const removeVideo = useCallback(() => {
    onAssetsChange({ ...assets, videoUrl: undefined })
  }, [assets, onAssetsChange])

  const canProceed = assets.logoUrl && assets.imageUrls.length >= 1

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Upload Your Assets</h2>
        <p className="text-zinc-400 text-sm">
          Upload your agency-prepared creative assets. We&apos;ll render them into real Edmunds ad formats.
        </p>
      </div>

      {/* Logo Upload */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-zinc-300">
          Brand Logo <span className="text-eds-50">*</span>
        </label>
        {assets.logoUrl ? (
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center p-2 overflow-hidden">
              <img src={assets.logoUrl} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <button
              onClick={removeLogo}
              className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
            >
              Remove
            </button>
          </div>
        ) : (
          <DropZone
            onClick={() => logoInputRef.current?.click()}
            uploading={logoState.uploading}
            error={logoState.error}
            label="Drop your logo here"
            sublabel="SVG, PNG, JPG, or WebP — max 10MB"
          />
        )}
        <input
          ref={logoInputRef}
          type="file"
          accept=".svg,.png,.jpg,.jpeg,.webp"
          className="hidden"
          onChange={handleLogoUpload}
        />
      </div>

      {/* Vehicle Images Upload */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-zinc-300">
          Vehicle Images <span className="text-eds-50">*</span>
          <span className="text-zinc-500 font-normal ml-2">({assets.imageUrls.length}/5)</span>
        </label>
        {assets.imageUrls.length > 0 && (
          <div className="flex gap-3 flex-wrap">
            {assets.imageUrls.map((url, i) => (
              <div key={i} className="relative group">
                <div className="w-28 h-20 rounded-lg bg-zinc-800 border border-zinc-700 overflow-hidden">
                  <img src={url} alt={`Vehicle ${i + 1}`} className="w-full h-full object-cover" />
                </div>
                <button
                  onClick={() => removeImage(i)}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500/90 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        {assets.imageUrls.length < 5 && (
          <DropZone
            onClick={() => imagesInputRef.current?.click()}
            uploading={imagesState.uploading}
            error={imagesState.error}
            label="Drop vehicle images here"
            sublabel={`PNG, JPG, or WebP — max 10MB each (${5 - assets.imageUrls.length} remaining)`}
          />
        )}
        <input
          ref={imagesInputRef}
          type="file"
          accept=".png,.jpg,.jpeg,.webp"
          multiple
          className="hidden"
          onChange={handleImagesUpload}
        />
      </div>

      {/* Video Upload (Optional) */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-zinc-300">
          Video <span className="text-zinc-500 font-normal">(optional)</span>
        </label>
        {assets.videoUrl ? (
          <div className="flex items-center gap-4">
            <div className="w-40 h-24 rounded-lg bg-zinc-800 border border-zinc-700 overflow-hidden">
              <video src={assets.videoUrl} className="w-full h-full object-cover" muted />
            </div>
            <button
              onClick={removeVideo}
              className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
            >
              Remove
            </button>
          </div>
        ) : (
          <DropZone
            onClick={() => videoInputRef.current?.click()}
            uploading={videoState.uploading}
            error={videoState.error}
            label="Drop a video here"
            sublabel="MP4 or WebM — max 50MB"
            compact
          />
        )}
        <input
          ref={videoInputRef}
          type="file"
          accept=".mp4,.webm"
          className="hidden"
          onChange={handleVideoUpload}
        />
      </div>

      {/* Next button */}
      <div className="flex justify-end pt-4">
        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            canProceed
              ? "bg-eds-50 hover:bg-eds-60 text-white shadow-lg shadow-eds-50/20"
              : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
          }`}
        >
          Next: Enter Copy →
        </button>
      </div>
    </div>
  )
}

// ─── Drop Zone ──────────────────────────────────────────────

function DropZone({
  onClick,
  uploading,
  error,
  label,
  sublabel,
  compact,
}: {
  onClick: () => void
  uploading: boolean
  error: string | null
  label: string
  sublabel: string
  compact?: boolean
}) {
  const [dragOver, setDragOver] = useState(false)

  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          // Trigger the hidden input's change handler via the files
          const input = e.currentTarget.parentElement?.querySelector("input[type=file]") as HTMLInputElement | null
          if (input && e.dataTransfer.files.length > 0) {
            const dt = new DataTransfer()
            for (const f of Array.from(e.dataTransfer.files)) dt.items.add(f)
            input.files = dt.files
            input.dispatchEvent(new Event("change", { bubbles: true }))
          }
        }}
        disabled={uploading}
        className={`w-full border-2 border-dashed rounded-xl transition-colors text-center cursor-pointer ${
          compact ? "py-4 px-6" : "py-8 px-6"
        } ${
          dragOver
            ? "border-eds-50 bg-eds-50/5"
            : "border-zinc-700 hover:border-zinc-500 bg-zinc-900/50"
        } ${uploading ? "opacity-60 cursor-wait" : ""}`}
      >
        {uploading ? (
          <div className="flex items-center justify-center gap-2 text-zinc-400">
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" opacity="0.3" />
              <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="text-sm">Uploading...</span>
          </div>
        ) : (
          <>
            <svg className="w-6 h-6 mx-auto mb-2 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 16V8M9 11l3-3 3 3M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
            </svg>
            <p className="text-sm text-zinc-300">{label}</p>
            <p className="text-xs text-zinc-500 mt-1">{sublabel}</p>
          </>
        )}
      </button>
      {error && (
        <p className="text-xs text-red-400 mt-2">{error}</p>
      )}
    </div>
  )
}
