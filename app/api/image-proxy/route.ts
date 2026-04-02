// app/api/image-proxy/route.ts — Proxy images from Edmunds media CDN
// Avoids CORS blocks when loading edmunds-media.com images from the browser.

import { NextRequest, NextResponse } from "next/server"

const ALLOWED_HOSTS = ["media.ed.edmunds-media.com"]

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url")

  if (!url) {
    return NextResponse.json({ error: "url parameter required" }, { status: 400 })
  }

  try {
    const parsed = new URL(url)

    if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
      return NextResponse.json({ error: "host not allowed" }, { status: 403 })
    }

    const response = await fetch(url, {
      headers: { "User-Agent": "Edmunds-Studio/1.0" },
    })

    if (!response.ok) {
      return new NextResponse(null, { status: response.status })
    }

    const buffer = await response.arrayBuffer()
    const contentType = response.headers.get("content-type") || "image/jpeg"

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    })
  } catch (err) {
    console.error("[image-proxy] Error:", err instanceof Error ? err.message : err)
    return new NextResponse(null, { status: 502 })
  }
}
