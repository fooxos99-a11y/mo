"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, CheckCircle2, Clock, Trash2, Eye } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface DocumentCardProps {
  id: string
  title: string
  party1_name: string
  party2_name: string
  party1_signature: string | null
  party2_signature: string | null
  created_at: string
  onDelete?: (id: string) => void
}

export function DocumentCard({
  id,
  title,
  party1_name,
  party2_name,
  party1_signature,
  party2_signature,
  created_at,
  onDelete,
}: DocumentCardProps) {
  const [deleting, setDeleting] = useState(false);
  const createdDate = new Date(created_at).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const bothSigned = party1_signature && party2_signature
  const partiallySigned = (party1_signature && !party2_signature) || (!party1_signature && party2_signature)

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!window.confirm("هل أنت متأكد أنك تريد حذف هذا المستند نهائياً؟ لا يمكن التراجع!")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      if (res.ok && onDelete) onDelete(id);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Link href={`/document/${id}`} passHref legacyBehavior>
      <a style={{ textDecoration: 'none' }}>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full group relative" style={{ position: 'relative' }}>
          <CardHeader>
            {/* زر الحذف */}
            <button
              onClick={handleDelete}
              title="حذف المستند"
              className="absolute left-3 top-3 z-10 p-1 rounded-full bg-red-50 hover:bg-red-100 text-red-600 opacity-0 group-hover:opacity-100 transition"
              disabled={deleting}
            >
              <Trash2 className="w-5 h-5" />
            </button>
            {/* زر العرض */}
            <a
              href={`/document/${id}?readOnly=1`}
              title="عرض المستند"
              className="absolute right-3 top-3 z-10 p-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 opacity-0 group-hover:opacity-100 transition"
              onClick={e => { e.preventDefault(); e.stopPropagation(); window.open(`/document/${id}?readOnly=1`, '_blank'); }}
            >
              <Eye className="w-5 h-5" />
            </a>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg leading-tight" dir="rtl">
                  {title}
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between" dir="rtl">
                <span className="text-muted-foreground">الطرف الأول:</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{party1_name}</span>
                  {party1_signature ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-amber-500" />
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between" dir="rtl">
                <span className="text-muted-foreground">الطرف الثاني:</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{party2_name}</span>
                  {party2_signature ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-amber-500" />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground" dir="rtl">
              {createdDate}
            </span>
            {bothSigned ? (
              <Badge variant="default" className="bg-green-500">
                مكتمل
              </Badge>
            ) : partiallySigned ? (
              <Badge variant="secondary" className="bg-amber-500 text-white">
                قيد التوقيع
              </Badge>
            ) : (
              <Badge variant="outline">بانتظار التوقيع</Badge>
            )}
          </CardFooter>
        </Card>
      </a>
    </Link>
  );
}
