import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: flag } = await supabase.from("feature_flags").select("enabled").eq("key", "contact_form_enabled").maybeSingle();
  if (flag && flag.enabled === false) {
    return NextResponse.json({ error: "نموذج التواصل غير متاح حالياً." }, { status: 403 });
  }

  const { name, email, message, recaptchaToken } = await request.json();
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "يرجى تعبئة جميع الحقول." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "البريد الإلكتروني غير صحيح." }, { status: 400 });
  }
  if (message.length > 2000) {
    return NextResponse.json({ error: "الرسالة طويلة جداً." }, { status: 400 });
  }

  const admin = createAdminClient();

  // حماية reCAPTCHA — تُفعَّل تلقائياً فقط إذا كان المفتاح السري مضبوطاً من لوحة التحكم
  const { data: secretSetting } = await admin.from("admin_settings").select("value").eq("key", "recaptcha_secret_key").maybeSingle();
  const recaptchaSecret = secretSetting?.value?.trim();
  if (recaptchaSecret) {
    if (!recaptchaToken) {
      return NextResponse.json({ error: "تعذر التحقق من أنك لست روبوتاً. أعد المحاولة." }, { status: 400 });
    }
    try {
      const verifyRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `secret=${encodeURIComponent(recaptchaSecret)}&response=${encodeURIComponent(recaptchaToken)}`,
      });
      const verifyData = await verifyRes.json();
      if (!verifyData.success || (typeof verifyData.score === "number" && verifyData.score < 0.5)) {
        return NextResponse.json({ error: "تعذر التحقق من أنك لست روبوتاً. أعد المحاولة." }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: "تعذر التحقق من الحماية. حاول مرة أخرى." }, { status: 500 });
    }
  }
  const { data: staff } = await admin.from("profiles").select("id").eq("role", "super_admin");
  if (staff && staff.length > 0) {
    await admin.from("notifications").insert(
      staff.map((s) => ({
        user_id: s.id,
        type: "CONTACT_MESSAGE",
        title: `رسالة تواصل من ${name}`,
        body: `${message}\n\nللرد: ${email}`,
      }))
    );
  }

  return NextResponse.json({ ok: true });
}
