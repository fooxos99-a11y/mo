import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("documents")
      .select("id, title, created_at, party1_name, party2_name, party1_signature, party2_signature")
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ documents: data })
  } catch (error) {
    console.error("[v0] Error fetching documents:", error)
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, content, party1_name, party1_code, party2_name, party2_code, view_code } = body

    if (!title || !content || !party1_name || !party1_code || !party2_name || !party2_code || !view_code) {
      return NextResponse.json({ error: "All fields are required, including view_code" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("documents")
      .insert({
        title,
        content,
        party1_name,
        party1_code,
        party2_name,
        party2_code,
        view_code,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ document: data })
  } catch (error) {
    console.error("[v0] Error creating document:", error)
    return NextResponse.json({ error: "Failed to create document" }, { status: 500 })
  }
}
