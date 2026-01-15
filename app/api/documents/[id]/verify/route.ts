import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { code } = body

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: document, error } = await supabase.from("documents").select("*").eq("id", id).single()

    if (error || !document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    // Log القيم الفعلية للمقارنة
    console.log("[VERIFY] code received:", code)
    console.log("[VERIFY] party1_code:", document.party1_code)
    console.log("[VERIFY] party2_code:", document.party2_code)
    console.log("[VERIFY] view_code:", document.view_code)

    // Check which party the code belongs to
    if (document.party1_code === code) {
      return NextResponse.json({
        valid: true,
        party: "party1",
        partyName: document.party1_name,
        document: {
          id: document.id,
          title: document.title,
          content: document.content,
          party1_name: document.party1_name,
          party2_name: document.party2_name,
        },
      })
    } else if (document.party2_code === code) {
      return NextResponse.json({
        valid: true,
        party: "party2",
        partyName: document.party2_name,
        document: {
          id: document.id,
          title: document.title,
          content: document.content,
          party1_name: document.party1_name,
          party2_name: document.party2_name,
        },
      })
    } else if (document.view_code === code) {
      // رمز العرض فقط
      return NextResponse.json({
        valid: true,
        party: null,
        partyName: null,
        viewOnly: true,
        document: {
          id: document.id,
          title: document.title,
          content: document.content,
          party1_name: document.party1_name,
          party2_name: document.party2_name,
          party1_signature: document.party1_signature,
          party2_signature: document.party2_signature,
          party1_full_name: document.party1_full_name,
          party2_full_name: document.party2_full_name,
        },
      })
    } else {
      // طباعة القيم للمقارنة عند الفشل
      console.error("[VERIFY][FAIL] code received:", code, "party1_code:", document.party1_code, "party2_code:", document.party2_code, "view_code:", document.view_code);
      return NextResponse.json({ valid: false, error: "Invalid verification code" }, { status: 401 })
    }
  } catch (error) {
    console.error("[v0] Error verifying code:", error)
    return NextResponse.json({ error: "Failed to verify code" }, { status: 500 })
  }
}
