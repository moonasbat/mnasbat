import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// مرات الظهور: يُستدعى مرة وحدة من كل صفحة قوائم (الرئيسية، البحث) بكل معرّفات الإعلانات
// الظاهرة دفعة وحدة — بدل طلب منفصل لكل بطاقة إعلان
export async function POST(request: NextRequest) {
  const { ad_ids } = await request.json();
  if (!Array.isArray(ad_ids) || ad_ids.length === 0) {
    return NextResponse.json({ error: "ad_ids required" }, { status: 400 });
  }
  const supabase = await createClient();
  await supabase.rpc("increment_ad_impressions", { ad_ids });
  return NextResponse.json({ ok: true });
}
