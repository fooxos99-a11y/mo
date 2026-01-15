import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { headers } from "next/headers"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const { party, signature, fullName } = body

    if (!party || !signature) {
      return NextResponse.json({ error: "Party and signature are required" }, { status: 400 })
    }

    // Get IP address
    const headersList = await headers()
    const ip = headersList.get("x-forwarded-for")?.split(",")[0] || headersList.get("x-real-ip") || "unknown"

    const supabase = await createClient()
    // جلب المستند أولاً
    const { data: document, error: fetchError } = await supabase.from("documents").select("party1_signature, party2_signature").eq("id", id).single();
    if (fetchError || !document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }
    if (
      (party === "party1" && document.party1_signature) ||
      (party === "party2" && document.party2_signature)
    ) {
      return NextResponse.json({ error: "Already signed" }, { status: 400 });
    }

    const updateData =
      party === "party1"
        ? {
            party1_signature: signature,
            party1_full_name: fullName ?? "",
            party1_signed_at: new Date().toISOString(),
            party1_ip: ip,
          }
        : {
            party2_signature: signature,
            party2_full_name: fullName ?? "",
            party2_signed_at: new Date().toISOString(),
            party2_ip: ip,
          }

    const { data, error } = await supabase.from("documents").update(updateData).eq("id", id).select().single()
    if (error) {
      console.error("[SIGN] Supabase error:", error, "id:", id, "updateData:", updateData);
      return NextResponse.json({ error: error.message, details: error.details }, { status: 500 });
    }
    if (!data) {
      console.error("[SIGN] No document found to update. id:", id);
      return NextResponse.json({ error: "No document found to update" }, { status: 404 });
    }
    return NextResponse.json({ success: true, document: data })
  } catch (error) {
    console.error("[v0] Error saving signature:", error)
    return NextResponse.json({ error: "Failed to save signature" }, { status: 500 })
  }
}
