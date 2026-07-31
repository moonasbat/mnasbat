import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// إعدادات عامة يقرأها الهيدر (اسم المنصة) — قابلة للتعديل من لوحة التحكم بدون إعادة نشر
export async function GET() {
  const supabase = await createClient();
  const { data } = await supabase.from("admin_settings").select("value").eq("key", "platform_name").maybeSingle();
  return NextResponse.json({ platform_name: data?.value?.trim() || "مناسبات" });
}
