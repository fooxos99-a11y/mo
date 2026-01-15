"use client"

import { useEffect, useState } from "react"
import { FileText } from "lucide-react"
import { CreateDocumentDialog } from "@/components/create-document-dialog"
import { DocumentCard } from "@/components/document-card"

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [documents, setDocuments] = useState<any[]>([])

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      const response = await fetch("/api/documents")
      const data = await response.json()
      setDocuments(data.documents || [])
    } catch (error) {
      console.error("[v0] Error loading documents:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col items-center justify-center mt-8 mb-12">
          <h1 className="text-4xl font-bold text-foreground text-center mb-4">نظام التوقيع الإلكتروني</h1>
          <CreateDocumentDialog onDocumentCreated={loadDocuments} />
        </div>

        {/* Documents Grid */}
        {loading ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">جاري التحميل...</p>
          </div>
        ) : !documents || documents.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
              <FileText className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">لا توجد مستندات بعد</h3>
            <p className="text-muted-foreground mb-6">ابدأ بإنشاء مستند جديد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.filter(doc => doc.id && doc.id !== "undefined").map((doc) => (
              <DocumentCard
                key={doc.id}
                id={doc.id}
                title={doc.title}
                party1_name={doc.party1_name}
                party2_name={doc.party2_name}
                party1_signature={doc.party1_signature}
                party2_signature={doc.party2_signature}
                created_at={doc.created_at}
                onDelete={(deletedId) => setDocuments((docs) => docs.filter((d) => d.id !== deletedId))}
              />
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>نظام التوقيع الإلكتروني الآمن - جميع الحقوق محفوظة</p>
        </div>
      </div>
    </div>
  )
}
