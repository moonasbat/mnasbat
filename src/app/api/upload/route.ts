import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB — نفس روح حدود صور الملف الشخصي في تويتر ونحوها

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const type = (formData.get("type") as string | null) ?? "ad";
  if (!file) return NextResponse.json({ error: "لم يتم إرسال ملف" }, { status: 400 });

  // رفض أي فيديو أو ملف غير مدعوم — لا نثق باسم الملف، نتحقق من الـ MIME الفعلي
  if (!ALLOWED_MIME.includes(file.type)) {
    if (file.type.startsWith("video/")) {
      return NextResponse.json({ error: "الفيديو غير مسموح في الإعلانات." }, { status: 400 });
    }
    return NextResponse.json({ error: "الصورة غير مدعومة." }, { status: 400 });
  }

  const isAvatar = type === "avatar";

  if (file.size > (isAvatar ? MAX_AVATAR_SIZE : MAX_SIZE)) {
    return NextResponse.json(
      { error: isAvatar ? "حجم الصورة كبير — الحد الأقصى 5 ميقابايت." : "الصورة غير مدعومة." },
      { status: 400 }
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    const isReceipt = type === "receipt";
    let applyWatermark = false;
    if (!isReceipt && !isAvatar) {
      const { data: flag } = await supabase.from("feature_flags").select("enabled").eq("key", "watermark_enabled").maybeSingle();
      applyWatermark = flag ? flag.enabled : true;
    }

    const transformation = isAvatar
      ? [{ width: 512, height: 512, crop: "fill", gravity: "auto", quality: "auto", fetch_format: "auto" }]
      : isReceipt
        ? [{ width: 1600, height: 1600, crop: "limit", quality: "auto", fetch_format: "auto" }]
        : applyWatermark
          ? [
              { width: 1600, height: 1600, crop: "limit", quality: "auto", fetch_format: "auto" },
              {
                overlay: { font_family: "Arial", font_size: 40, font_weight: "bold", text: "مناسبات" },
                color: "#FFFFFF",
                opacity: 60,
                gravity: "south_east",
                x: 20,
                y: 20,
              },
            ]
          : [{ width: 1600, height: 1600, crop: "limit", quality: "auto", fetch_format: "auto" }];

    const result = await cloudinary.uploader.upload(base64, {
      folder: isAvatar ? "mnasbat/avatars" : isReceipt ? "mnasbat/receipts" : "mnasbat/ads",
      transformation,
    });

    return NextResponse.json({
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch {
    return NextResponse.json({ error: "تعذر رفع الصورة. حاول مرة أخرى." }, { status: 500 });
  }
}
