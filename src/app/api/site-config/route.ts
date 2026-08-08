import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// إعدادات عامة يقرأها الهيدر (اسم المنصة، إظهار تبويب العمولة) — قابلة للتعديل من لوحة التحكم بدون إعادة نشر
export async function GET() {
  const supabase = await createClient();
  const [{ data: nameRow }, { data: flagRow }] = await Promise.all([
    supabase.from("admin_settings").select("value").eq("key", "platform_name").maybeSingle(),
    supabase.from("feature_flags").select("enabled").eq("key", "commission_tab_enabled").maybeSingle(),
  ]);
  return NextResponse.json({
    platform_name: nameRow?.value?.trim() || "مناسبات",
    commission_tab_enabled: flagRow?.enabled !== false,
  });
}
