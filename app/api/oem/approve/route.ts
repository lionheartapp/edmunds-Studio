// app/api/oem/approve/route.ts — Approve an OEM campaign

import { NextResponse } from "next/server"
import { approveCampaign } from "@/lib/supabase-oem"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.campaignId || !body.approverName) {
      return NextResponse.json(
        { error: "Missing campaignId or approverName" },
        { status: 400 }
      )
    }

    if (body.approverName.length > 100) {
      return NextResponse.json(
        { error: "Approver name too long (max 100 characters)" },
        { status: 400 }
      )
    }

    const success = await approveCampaign(body.campaignId, body.approverName)

    if (!success) {
      return NextResponse.json(
        { error: "Failed to approve campaign" },
        { status: 500 }
      )
    }

    return NextResponse.json({ approved: true })
  } catch (err) {
    console.error("[api/oem/approve] Error:", err)
    return NextResponse.json(
      { error: "Approval failed" },
      { status: 500 }
    )
  }
}
