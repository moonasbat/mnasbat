import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// نوقّع طلب الرفع فقط (بدون ما يمر الملف نفسه على سيرفرنا) — المتصفح يرفع مباشرة لكلاودنري
// بعدها بنفس التوقيع. هذا يلغي الرحلة المزدوجة (متصفح ← سيرفرنا ← كلاودنري) اللي كانت تبطّئ الرفع كثير.
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { type } = await request.json().catch(() => ({ type: "ad" }));
  const isAvatar = type === "avatar";
  const isReceipt = type === "receipt";

  let applyWatermark = false;
  if (!isAvatar && !isReceipt) {
    const { data: flag } = await supabase.from("feature_flags").select("enabled").eq("key", "watermark_enabled").maybeSingle();
    applyWatermark = flag ? flag.enabled : true;
  }

  const folder = isAvatar ? "mnasbat/avatars" : isReceipt ? "mnasbat/receipts" : "mnasbat/ads";

  // صور الإعلانات تُحفظ بأبعادها الأصلية كاملة (بدون تصغير) — فقط العلامة المائية تُطبع عليها إن كانت مفعّلة
  const transformation = isAvatar
    ? "c_fill,g_auto,h_512,w_512,q_auto,f_auto"
    : isReceipt
      ? "c_limit,h_1600,w_1600,q_auto,f_auto"
      : applyWatermark
        ? `q_auto,f_auto/l_text:Arial_40_bold:${encodeURIComponent("مناسبات")},co_white,o_60,g_south_east,x_20,y_20`
        : "q_auto,f_auto";

  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request({ folder, timestamp, transformation }, process.env.CLOUDINARY_API_SECRET!);

  return NextResponse.json({
    signature,
    timestamp,
    api_key: process.env.CLOUDINARY_API_KEY,
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    folder,
    transformation,
  });
}
