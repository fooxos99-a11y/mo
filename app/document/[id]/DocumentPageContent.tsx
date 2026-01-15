
"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SignatureCanvas } from "@/components/signature-canvas";
import { Lock } from "lucide-react";

interface DocumentData {
  id: string
  title: string
  content: string
  party1_name: string
  party2_name: string
  party1_signature: string | null
  party2_signature: string | null
  party1_full_name: string | null
  party2_full_name: string | null
}
export default function DocumentPageContent({ id, party1_name, party2_name, readOnly }: { id: string, party1_name?: string, party2_name?: string, readOnly?: boolean }) {
  // حماية من id غير معرف
  if (!id || id === "undefined") {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-700 text-xl font-bold">
        حدث خطأ: رقم المستند غير معرف. يرجى العودة للصفحة الرئيسية والمحاولة من جديد.
      </div>
    );
  }

  // Log مرئي للتشخيص
  // يظهر رقم المستند في أعلى الصفحة (للتأكد من وصول id)
  const debugId = (
    <div
      className="debug-id-print-hide"
      style={{position:'fixed',top:0,left:0,zIndex:9999,background:'#eee',color:'#333',padding:'4px 12px',fontSize:13,borderBottom:'1px solid #aaa',borderRight:'1px solid #aaa'}}>
      <b>ID:</b> {id}
    </div>
  );
  const router = useRouter();
  const [createdDate, setCreatedDate] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [document, setDocument] = useState<DocumentData | null>(null);
  const [party, setParty] = useState<"party1" | "party2" | null>(null);
  const [partyName, setPartyName] = useState("");
  const [signature, setSignature] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [fullName, setFullName] = useState("");
  const [showAlreadySigned, setShowAlreadySigned] = useState(false);
  const [fetched, setFetched] = useState(false); // for readOnly
  // وضع العرض فقط
  const [viewOnlyMode, setViewOnlyMode] = useState(false);

  // عند أول تحميل، إذا لم يوجد اسم في المستند، استخدم الاسم القادم من props
  useEffect(() => {
    if (document && (!document.party1_name || !document.party2_name)) {
      setDocument((prev) => prev ? {
        ...prev,
        party1_name: prev.party1_name || party1_name || "",
        party2_name: prev.party2_name || party2_name || ""
      } : prev)
    }
    // تعيين التاريخ في العميل فقط
    setCreatedDate(new Date().toLocaleDateString("ar-SA"));
  }, [document, party1_name, party2_name]);

  useEffect(() => {
    if (isVerified && document) {
      if (party === "party1" && document.party1_signature) {
        setSignature(document.party1_signature);
        if (document.party1_full_name) {
          setFullName(document.party1_full_name);
        }
      } else if (party === "party2" && document.party2_signature) {
        setSignature(document.party2_signature);
        if (document.party2_full_name) {
          setFullName(document.party2_full_name);
        }
      }
    }
  }, [isVerified, document, party]);

  // جلب المستند في وضع readOnly
  useEffect(() => {
    if (readOnly && !fetched) {
      fetch(`/api/documents/${id}`)
        .then(res => res.json())
        .then(data => {
          setDocument(data);
          setFetched(true);
        });
    }
  }, [id, readOnly, fetched]);

  const handleVerify = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/documents/${id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verificationCode }),
      });
      const data = await response.json();
      if (data.valid) {
        if (data.viewOnly) {
          setViewOnlyMode(true);
          setDocument(data.document);
        } else {
          // إذا كان أي من الطرفين قد وقع بالفعل بنفس رمز التحقق، امنع الدخول
          if ((data.party === "party1" && data.document.party1_signature) || (data.party === "party2" && data.document.party2_signature)) {
            setShowAlreadySigned(true);
            setIsVerified(false);
            setError("تم رفض الدخول: لقد قمت بالتوقيع مسبقاً ولا يمكنك الدخول مرة أخرى.");
            return;
          }
          setIsVerified(true);
          setDocument(data.document);
          setParty(data.party);
          setPartyName(data.partyName);
        }
      } else {
        setError("رمز التحقق غير صحيح أو رمز العرض غير صحيح");
      }
    } catch (err) {
      setError("حدث خطأ أثناء التحقق");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSignature = async (signatureData: string) => {

    // لا يتحقق من الاسم الكامل إطلاقاً، فقط يوقع
    let usedFullName = "";

    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/documents/${id}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ party, signature: signatureData }),
      })

      if (response.ok) {
        setSignature(signatureData)
        const updatedDoc = await response.json()
        setDocument(updatedDoc.document)
        setError("")
        // إعادة التوجيه بعد الحفظ
        setTimeout(() => {
          router.replace("/");
        }, 1000);
      } else {
        const errorData = await response.json();
        if (errorData?.error === "Already signed") {
          setError("لا يمكنك التعديل")
        } else {
          setError("فشل في حفظ التوقيع")
        }
      }
    } catch (err) {
      console.error("[v0] Signature error:", err)
      setError("حدث خطأ أثناء حفظ التوقيع")
    } finally {
      setLoading(false)
    }
  }

  if (viewOnlyMode && !document) {
    return <>
      {debugId}
      <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>
    </>;
  }
  if (!readOnly && !isVerified && !viewOnlyMode) {
    return (
      <>
        {debugId}
        <div className="min-h-screen bg-white flex items-center justify-center p-4">
          <div className="max-w-md w-full border-2 border-slate-300 rounded-lg p-8 shadow-sm">
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="p-3 bg-slate-100 rounded-full">
                <Lock className="h-8 w-8 text-slate-700" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">التحقق من الهوية</h1>
            </div>
            <p className="text-center text-slate-600 mb-6" dir="rtl">
              يرجى إدخال رمز التحقق الخاص بك (للتوقيع أو العرض فقط)
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-slate-900">
                  رمز التحقق
                </Label>
                <Input
                  id="code"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="أدخل رمز التحقق أو العرض فقط"
                  dir="ltr"
                  className="text-center text-lg tracking-wider border-slate-300"
                />
              </div>
              <Button
                onClick={handleVerify}
                disabled={loading || !verificationCode}
                className="w-full bg-slate-900 hover:bg-slate-800"
              >
                {loading ? "جاري التحقق..." : "تحقق"}
              </Button>
              {error && <p className="text-sm text-red-600 text-center">{error}</p>}
            </div>
          </div>
        </div>
      </>
    );
  }

  // عرض المستند مباشرة بعد التحقق أو في وضع readOnly أو viewOnly
  if (((isVerified && document) || readOnly || viewOnlyMode) && document) {
    return (
      <>
        {debugId}
        <div className="min-h-screen bg-slate-100 py-8 print:bg-white print:py-0 flex flex-col min-w-full">
          {/* إخفاء عناصر غير مرغوبة عند الطباعة */}
          <style>{`
            @media print {
              header, footer, .print\\:hidden, .no-print, .print-hide, .print-hidden {
                display: none !important;
              }
              /* إخفاء التاريخ العلوي إذا كان موجودًا */
              .created-date-top, .date-top, .text-sm.text-slate-600 {
                display: none !important;
              }
              /* إخفاء روابط أو أزرار */
              a, button, .print-hide-link {
                display: none !important;
              }
              /* إخفاء رقم الصفحة الافتراضي */
              .debug-id-print-hide {
                display: none !important;
              }
              @page {
                margin: 0;
                size: A4;
              }
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          `}</style>
          <div className="mx-auto bg-white shadow-lg print:shadow-none" style={{ width: "210mm", minHeight: "297mm", padding: "20mm", position: 'relative' }}>
            {/* Document Header */}
            <div className="text-center mb-8 border-b-2 border-slate-900 pb-6">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{document.title}</h1>
            </div>

            {/* Document Content */}
            <div className="mb-12 text-slate-900 leading-relaxed" dir="rtl">
              <div
                className="text-justify break-words"
                style={{ fontSize: "12pt", lineHeight: "1.8", whiteSpace: "pre-line", wordBreak: "break-word", overflowWrap: "break-word" }}
              >
                {document.content}
              </div>
            </div>

            {/* التواقيع في أسفل الصفحة */}
            <div style={{ position: 'absolute', left: 0, bottom: 60, width: '100%', display: 'flex', justifyContent: 'space-between', padding: '0 10mm' }}>
              {/* الطرف الأول */}
              <div style={{ minWidth: 180, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="mb-1" style={{ textAlign: 'center' }}>
                  <span className="text-slate-900 text-base font-semibold">
                    اسم الطرف الأول: {document.party1_full_name || document.party1_name || party1_name}
                  </span>
                </div>
                <div>
                  {party === "party1" && !document.party1_signature ? (
                    <SignatureCanvas
                      onSave={handleSaveSignature}
                      onClear={() => setSignature(null)}
                      disabled={loading}
                      compact={true}
                    />
                  ) : document.party1_signature ? (
                    <img
                      src={document.party1_signature || "/placeholder.svg"}
                      alt="Party 1 signature"
                      style={{ maxHeight: '60px', maxWidth: '180px', objectFit: 'contain', display: 'block', margin: '0 auto' }}
                    />
                  ) : null}
                </div>
                {party === "party1" && error && <p className="text-xs text-red-600 mt-2 text-center">{error}</p>}
              </div>

              {/* الطرف الثاني */}
              <div style={{ minWidth: 180, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="mb-1" style={{ textAlign: 'center' }}>
                  <span className="text-slate-900 text-base font-semibold">
                    اسم الطرف الثاني: {document.party2_full_name || document.party2_name || party2_name}
                  </span>
                </div>
                <div>
                  {party === "party2" && !document.party2_signature ? (
                    <SignatureCanvas
                      onSave={handleSaveSignature}
                      onClear={() => setSignature(null)}
                      disabled={loading}
                      compact={true}
                    />
                  ) : document.party2_signature ? (
                    <img
                      src={document.party2_signature || "/placeholder.svg"}
                      alt="Party 2 signature"
                      style={{ maxHeight: '60px', maxWidth: '180px', objectFit: 'contain', display: 'block', margin: '0 auto' }}
                    />
                  ) : null}
                </div>
                {party === "party2" && error && <p className="text-xs text-red-600 mt-2 text-center">{error}</p>}
              </div>
            </div>

            {/* التاريخ في أسفل الصفحة */}
            {createdDate && (
              <div style={{ position: 'absolute', bottom: 10, left: 0, width: '100%', textAlign: 'center', fontSize: '13px', color: '#666' }}>
                تاريخ الإنشاء: {createdDate}
              </div>
            )}

            {/* زر الطباعة أصبح خارج الورقة */}
          </div>
        </div>
        {/* زر الطباعة خارج الورقة */}
        <div className="w-full flex justify-center mt-8 print:hidden">
          <Button onClick={() => window.print()} className="bg-slate-900 hover:bg-slate-800 px-8 py-3 text-lg rounded-lg shadow-md">
            طباعة المستند
          </Button>
        </div>
      </>
    );
  }
  // لا يوجد حالة أخرى: إظهار رسالة خطأ أو تحميل
  return null;
}
