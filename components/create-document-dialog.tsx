"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

export function CreateDocumentDialog({ onDocumentCreated }: { onDocumentCreated?: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    party1_name: "",
    party1_code: "",
    party2_name: "",
    party2_code: "",
    view_code: "",
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to create document")

      const { document } = await response.json()
      setOpen(false)
      setFormData({
        title: "",
        content: "",
        party1_name: "",
        party1_code: "",
        party2_name: "",
        party2_code: "",
        view_code: "",
      })
      if (onDocumentCreated) onDocumentCreated();
    } catch (error) {
      console.error("[v0] Error creating document:", error)
      alert("فشل في إنشاء المستند")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="h-12 gap-2">
          <Plus className="h-5 w-5" />
          إضافة مستند جديد
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>إنشاء مستند جديد</DialogTitle>
          <DialogDescription>أدخل تفاصيل المستند والأطراف المعنية</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">عنوان المستند</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              dir="rtl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">نص المستند</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="min-h-[200px]"
              rows={10}
              required
              dir="rtl"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="party1_name">اسم الطرف الأول</Label>
              <Input
                id="party1_name"
                value={formData.party1_name}
                onChange={(e) => setFormData({ ...formData, party1_name: e.target.value })}
                required
                dir="rtl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="party1_code">رمز الطرف الأول</Label>
              <Input
                id="party1_code"
                value={formData.party1_code}
                onChange={(e) => setFormData({ ...formData, party1_code: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="party2_name">اسم الطرف الثاني</Label>
              <Input
                id="party2_name"
                value={formData.party2_name}
                onChange={(e) => setFormData({ ...formData, party2_name: e.target.value })}
                required
                dir="rtl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="party2_code">رمز الطرف الثاني</Label>
              <Input
                id="party2_code"
                value={formData.party2_code}
                onChange={(e) => setFormData({ ...formData, party2_code: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="view_code">رمز العرض</Label>
            <Input
              id="view_code"
              value={formData.view_code}
              onChange={(e) => setFormData({ ...formData, view_code: e.target.value })}
              dir="ltr"
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "جاري الإنشاء..." : "إنشاء المستند"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
