// app/api/oem/upload/route.ts — Upload OEM creative assets to Supabase Storage

import { NextResponse } from "next/server"
import { uploadOemAsset } from "@/lib/supabase-oem"

export const maxDuration = 30

const ALLOWED_TYPES: Record<string, string[]> = {
  logo: ["image/png", "image/jpeg", "image/svg+xml", "image/webp"],
  image: ["image/png", "image/jpeg", "image/webp"],
  video: ["video/mp4", "video/webm"],
}

const MAX_SIZES: Record<string, number> = {
  logo: 10 * 1024 * 1024, // 10MB
  image: 10 * 1024 * 1024,
  video: 50 * 1024 * 1024, // 50MB
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const type = formData.get("type") as string | null

    if (!file || !type) {
      return NextResponse.json(
        { error: "Missing file or type" },
        { status: 400 }
      )
    }

    if (!["logo", "image", "video"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type. Must be logo, image, or video." },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ALLOWED_TYPES[type]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Allowed: ${allowedTypes.join(", ")}` },
        { status: 400 }
      )
    }

    // Validate file size
    const maxSize = MAX_SIZES[type]
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum: ${maxSize / (1024 * 1024)}MB` },
        { status: 400 }
      )
    }

    // Generate a unique path
    const fileId = crypto.randomUUID().slice(0, 12)
    const ext = file.name.split(".").pop() || "bin"
    const path = `${fileId}/${type}_${Date.now()}.${ext}`

    // Upload to Supabase Storage
    const buffer = Buffer.from(await file.arrayBuffer())
    const url = await uploadOemAsset(buffer, path, file.type)

    if (!url) {
      return NextResponse.json(
        { error: "Upload failed — check Supabase configuration" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      url,
      fileId,
      type,
    })
  } catch (err) {
    console.error("[api/oem/upload] Error:", err)
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    )
  }
}
