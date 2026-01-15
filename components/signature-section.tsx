"use client"

import { useState } from "react"
import { SignatureCanvas } from "./signature-canvas"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Lock, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SignatureSectionProps {
  sectionId: "party_a" | "party_b"
  title: string
  existingSignature?: string
}

export function SignatureSection({ sectionId, title, existingSignature }: SignatureSectionProps) {
  const [code, setCode] = useState("")
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [isSigned, setIsSigned] = useState(!!existingSignature)
  const [codeHash, setCodeHash] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const handleVerifyCode = async () => {
    if (!code.trim()) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال رمز التحقق",
        variant: "destructive",
      })
      return
    }

    setIsVerifying(true)
    try {
      const response = await fetch("/api/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, sectionId }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setIsUnlocked(true)
        setCodeHash(data.codeHash)
        toast({
          title: "نجاح",
          description: data.message || "تم فتح القسم بنجاح",
        })
      } else {
        toast({
          title: "خطأ",
          description: data.error || "رمز التحقق غير صحيح",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Verification error:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء التحقق من الرمز",
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleSaveSignature = async (signatureData: string) => {
    setIsSaving(true)
    try {
      const response = await fetch("/api/save-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionId, signatureData, codeHash }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setIsSigned(true)
        setIsUnlocked(false)
        toast({
          title: "نجاح",
          description: data.message || "تم حفظ التوقيع بنجاح",
        })
      } else {
        toast({
          title: "خطأ",
          description: data.error || "فشل حفظ التوقيع",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Save error:", error)
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ التوقيع",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isSigned) {
    return (
      <Card className="p-6 bg-green-50 border-green-200">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
          <h3 className="text-lg font-semibold text-green-900">{title}</h3>
        </div>
        {existingSignature && (
          <div className="border-2 border-green-300 rounded-lg p-4 bg-white">
            <img src={existingSignature || "/placeholder.svg"} alt="التوقيع المحفوظ" className="max-w-full h-auto" />
          </div>
        )}
        <p className="text-sm text-green-700 mt-4">تم التوقيع بنجاح ✓</p>
      </Card>
    )
  }

  if (!isUnlocked) {
    return (
      <Card className="p-6 bg-muted/50 relative">
        <div className="flex items-center gap-3 mb-4">
          <Lock className="h-6 w-6 text-muted-foreground" />
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="أدخل رمز التحقق"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleVerifyCode()}
              className="flex-1"
              dir="rtl"
            />
            <Button onClick={handleVerifyCode} disabled={isVerifying}>
              {isVerifying ? "جاري التحقق..." : "فتح القسم"}
            </Button>
          </div>
          <div className="h-48 border-2 border-dashed border-border rounded-lg bg-background/50 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">أدخل الرمز لفتح قسم التوقيع</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 border-primary/50 bg-primary/5">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
          <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <SignatureCanvas onSave={handleSaveSignature} onClear={() => {}} disabled={isSaving} />
      {isSaving && <p className="text-sm text-muted-foreground mt-2">جاري الحفظ...</p>}
    </Card>
  )
}
