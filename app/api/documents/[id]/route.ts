export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient();
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: "Missing document id" }, { status: 400 });
    }
    const { data, error } = await supabase.from("documents").select("*").eq("id", id).single();
    if (error || !data) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch document" }, { status: 500 });
  }
}
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    // استخراج id من URL
    const url = new URL(request.url);
    const paths = url.pathname.split("/");
    const id = paths[paths.length - 1];
    if (!id) {
      console.error("[DELETE] Missing document id param");
      return NextResponse.json({ error: "Missing document id" }, { status: 400 });
    }
    const { error, data } = await supabase.from("documents").delete().eq("id", id);
    if (error) {
      console.error("[DELETE] Supabase error:", error, "id:", id);
      return NextResponse.json({ error: error.message, details: error.details }, { status: 500 });
    }
    console.log(`[DELETE] Document deleted. id: ${id}, data:`, data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[v0] Error deleting document:", error);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}
