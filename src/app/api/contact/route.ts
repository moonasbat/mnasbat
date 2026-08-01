import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: flag } = await supabase.from("feature_flags").select("enabled").eq("key", "contact_form_enabled").maybeSingle();
  if (flag && flag.enabled === false) {
    return NextResponse.json({ error: "نموذج التواصل غير متاح حالياً." }, { status: 403 });
  }

  const { name, email, message } = await request.json();
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
