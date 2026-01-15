"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, RefreshCw } from "lucide-react"

interface Signature {
  id: string
  section_id: string
  signature_data: string
  signed_at: string
  ip_address: string
  is_signed: boolean
}

export default function AdminPage() {
  const [signatures, setSignatures] = useState<Signature[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSignatures()
  }, [])

  const loadSignatures = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("signatures").select("*").order("signed_at", { ascending: false })

      if (error) {
        console.error("[v0] Error loading signatures:", error)
        return
      }

      setSignatures(data || [])
    } catch (error) {
      console.error("[v0] Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const getSectionTitle = (sectionId: string) => {
    return sectionId === "party_a" ? "الطرف الأول" : "الطرف الثاني"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">لوحة التحكم - التوقيعات</h1>
            <p className="text-muted-foreground mt-2">عرض وإدارة جميع التوقيعات</p>
          </div>
          <Button onClick={loadSignatures} variant="outline" disabled={loading}>
            <RefreshCw className={`h-4 w-4 ml-2 ${loading ? "animate-spin" : ""}`} />
            تحديث
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">جاري التحميل...</p>
          </div>
        ) : signatures.length === 0 ? (
          <Card className="p-12 text-center">
            <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">لا توجد توقيعات حتى الآن</p>
          </Card>
        ) : (
          <div className="grid gap-6">
            {signatures.map((signature) => (
              <Card key={signature.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                    <div>
                      <h3 className="text-lg font-semibold">{getSectionTitle(signature.section_id)}</h3>
                      <p className="text-sm text-muted-foreground">
                        توقيع بتاريخ: {new Date(signature.signed_at).toLocaleString("ar-SA")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>IP: {signature.ip_address}</p>
                  </div>
                </div>

                <div className="border-2 border-border rounded-lg p-4 bg-white">
                  <img
                    src={signature.signature_data || "/placeholder.svg"}
                    alt={`توقيع ${getSectionTitle(signature.section_id)}`}
                    className="max-w-full h-auto"
                  />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
