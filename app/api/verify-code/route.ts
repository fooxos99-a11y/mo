import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { hashCode } from "@/lib/hash"

export async function POST(request: NextRequest) {
  try {
    const { code, sectionId } = await request.json()

    if (!code || !sectionId) {
      return NextResponse.json({ error: "الرمز ومعرف القسم مطلوبان" }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if section already signed
    const { data: existingSignature } = await supabase
      .from("signatures")
      .select("*")
      .eq("section_id", sectionId)
      .single()

    if (existingSignature) {
      return NextResponse.json({ error: "هذا القسم موقع بالفعل" }, { status: 400 })
    }

    // Hash the provided code
    const codeHash = await hashCode(code)

    // For demo purposes, we'll accept any code and store its hash
    // In production, you'd verify against pre-stored hashes
    return NextResponse.json({
      success: true,
      codeHash,
      message: "تم التحقق من الرمز بنجاح",
    })
  } catch (error) {
    console.error("[v0] Error verifying code:", error)
    return NextResponse.json({ error: "حدث خطأ أثناء التحقق من الرمز" }, { status: 500 })
  }
}
