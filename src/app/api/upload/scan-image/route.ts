import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// نرسل الصورة لخدمة PaddleOCR خارجية (منفصلة، تفحص النصوص بالصورة) — لو لقت رقم جوال أو إيميل
// ظاهر بالصورة تطمسه وترجع لنا نسخة معدّلة، فنرفعها فوق نفس الصورة الأصلية بكلاودنري.
// لو الخدمة غير مفعّلة (OCR_SERVICE_URL فاضي) أو صار أي خطأ، نرجّع الصورة الأصلية بدون توقف.
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { url, public_id } = await request.json();
  const ocrServiceUrl = process.env.OCR_SERVICE_URL;
  if (!ocrServiceUrl || !url || !public_id) {
    return NextResponse.json({ blurred: false, url });
  }

  try {
    const res = await fetch(`${ocrServiceUrl.replace(/\/$/, "")}/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_url: url }),
      signal: AbortSignal.timeout(45000),
    });
    if (!res.ok) return NextResponse.json({ blurred: false, url });

    const blurred = res.headers.get("X-Blurred") === "True";
    if (!blurred) return NextResponse.json({ blurred: false, url });

    const buffer = Buffer.from(await res.arrayBuffer());
    const base64 = `data:image/jpeg;base64,${buffer.toString("base64")}`;
    const result = await cloudinary.uploader.upload(base64, {
      public_id,
      overwrite: true,
      invalidate: true,
    });

    return NextResponse.json({ blurred: true, url: result.secure_url });
  } catch {
    return NextResponse.json({ blurred: false, url });
  }
}
