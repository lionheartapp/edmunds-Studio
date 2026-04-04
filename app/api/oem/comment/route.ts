// app/api/oem/comment/route.ts — Add and list comments on OEM campaigns

import { NextResponse } from "next/server"
import { addComment, getComments } from "@/lib/supabase-oem"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.campaignId || !body.authorName || !body.message) {
      return NextResponse.json(
        { error: "Missing campaignId, authorName, or message" },
        { status: 400 }
      )
    }

    if (body.authorName.length > 100) {
      return NextResponse.json(
        { error: "Author name too long (max 100 characters)" },
        { status: 400 }
      )
    }

    if (body.message.length > 1000) {
      return NextResponse.json(
        { error: "Message too long (max 1000 characters)" },
        { status: 400 }
      )
    }

    const comment = await addComment(body.campaignId, body.authorName, body.message)

    if (!comment) {
      return NextResponse.json(
        { error: "Failed to add comment" },
        { status: 500 }
      )
    }

    return NextResponse.json(comment)
  } catch (err) {
    console.error("[api/oem/comment] POST error:", err)
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get("campaignId")

    if (!campaignId) {
      return NextResponse.json(
        { error: "Missing campaignId" },
        { status: 400 }
      )
    }

    const comments = await getComments(campaignId)
    return NextResponse.json({ comments })
  } catch (err) {
    console.error("[api/oem/comment] GET error:", err)
    return NextResponse.json(
      { error: "Failed to load comments" },
      { status: 500 }
    )
  }
}
