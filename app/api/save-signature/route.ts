import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { sectionId, signatureData, codeHash } = await request.json()

    if (!sectionId || !signatureData || !codeHash) {
      return NextResponse.json({ error: "جميع البيانات مطلوبة" }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if already signed
    const { data: existing } = await supabase.from("signatures").select("*").eq("section_id", sectionId).single()

    if (existing) {
      return NextResponse.json({ error: "هذا القسم موقع بالفعل" }, { status: 400 })
    }

    // Get IP address
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

    // Save signature
    const { data, error } = await supabase
      .from("signatures")
      .insert({
        section_id: sectionId,
        verification_code_hash: codeHash,
        signature_data: signatureData,
        ip_address: ipAddress,
        is_signed: true,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Supabase error:", error)
      return NextResponse.json({ error: "فشل حفظ التوقيع" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data,
      message: "تم حفظ التوقيع بنجاح",
    })
  } catch (error) {
    console.error("[v0] Error saving signature:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء حفظ التوقيع" }, { status: 500 })
  }
}
