import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// إعدادات عامة يقرأها الهيدر ولوحة المستخدم (اسم المنصة، إظهار تبويب العمولة/الإحالة) — قابلة للتعديل من لوحة التحكم بدون إعادة نشر
export async function GET() {
  const supabase = await createClient();
  const [{ data: nameRow }, { data: flagRow }, { data: referralFlagRow }] = await Promise.all([
    supabase.from("admin_settings").select("value").eq("key", "platform_name").maybeSingle(),
    supabase.from("feature_flags").select("enabled").eq("key", "commission_tab_enabled").maybeSingle(),
    supabase.from("feature_flags").select("enabled").eq("key", "referral_program_enabled").maybeSingle(),
  ]);
  return NextResponse.json({
    platform_name: nameRow?.value?.trim() || "مناسبات",
    commission_tab_enabled: flagRow?.enabled !== false,
    referral_program_enabled: referralFlagRow?.enabled !== false,
  });
}
