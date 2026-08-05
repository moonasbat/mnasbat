import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// نستقبل التوكنات بعد signInWithIdToken الناجح ونثبّت الجلسة من طرف السيرفر (Set-Cookie حقيقي)
// بدل الاعتماد على كتابة الكوكيز من جافاسكربت المتصفح مباشرة — يضمن إن السيرفر يشوف الجلسة
// فوراً بأي طلب لاحق (مثل proxy.ts) بدون أي سباق بين وصول الكوكيز واستدعاء getUser().
export async function POST(request: NextRequest) {
  const { access_token, refresh_token } = await request.json();
  if (!access_token || !refresh_token) {
    return NextResponse.json({ error: "بيانات الجلسة ناقصة." }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.setSession({ access_token, refresh_token });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
