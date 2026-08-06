import { createClient } from "@/lib/supabase/server";
import { redactContactInfo } from "@/lib/redactContact";
import { NextRequest, NextResponse } from "next/server";

const RENEW_COOLDOWN_DAYS = 5;

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { action } = body;
  const { data: ad } = await supabase.from("ads").select("id, user_id, status, created_at, published_at").eq("id", id).single();
  if (!ad || ad.user_id !== user.id) {
    return NextResponse.json({ error: "لا تملك صلاحية لتنفيذ هذا الإجراء." }, { status: 403 });
  }

  if (action === "update") {
    // التعديل مفتوح بدون حد زمني. علامة "تم تعديله" تُسجَّل فقط لو الإعلان منشور فعلاً —
    // أثناء إنشاء إعلان جديد (وهو لسا مسودة) نستخدم نفس هذا الإجراء لحفظ بيانات الخطوات،
    // وهذا مو تعديلاً حقيقياً بعد النشر، فما نبي نوسمه كذا
    const { title, description, category_id, city, price, whatsapp, messages_enabled, comments_enabled } = body;
    if (!title?.trim()) return NextResponse.json({ error: "يرجى كتابة عنوان الإعلان." }, { status: 400 });
    if (!description?.trim()) return NextResponse.json({ error: "يرجى كتابة وصف الإعلان." }, { status: 400 });
    if (!category_id) return NextResponse.json({ error: "يرجى اختيار التصنيف." }, { status: 400 });
    if (price !== undefined && price !== null && price !== "" && (isNaN(Number(price)) || Number(price) < 0)) {
      return NextResponse.json({ error: "السعر غير صالح." }, { status: 400 });
    }
    const hasWhatsapp = !!whatsapp;
    const willAllowMessages = messages_enabled ?? true;
    if (!hasWhatsapp && !willAllowMessages) {
      return NextResponse.json(
        { error: "يجب تفعيل التواصل عبر واتساب أو السماح بالرسائل الخاصة — وسيلة تواصل واحدة على الأقل مطلوبة." },
        { status: 400 }
      );
    }
    // نخفي أي رقم جوال أو إيميل يُكتب بالعنوان أو الوصف — التواصل الفعلي لازم يصير عبر الرسائل
    // الخاصة أو واتساب داخل الموقع بس (حفاظاً على تتبع العمولة)
    const { error } = await supabase
      .from("ads")
      .update({
        title: redactContactInfo(title).redacted,
        description: redactContactInfo(description).redacted,
        category_id, city: city || null,
        price: price ? Number(price) : null, whatsapp: whatsapp || null,
        messages_enabled: messages_enabled ?? true, comments_enabled: comments_enabled ?? true,
        ...(ad.status !== "draft" ? { edited_at: new Date().toISOString() } : {}),
      })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } else if (action === "renew") {
    const { data: flag } = await supabase.from("feature_flags").select("enabled").eq("key", "ad_renewal_enabled").maybeSingle();
    if (flag && flag.enabled === false) {
      return NextResponse.json({ error: "تجديد الإعلانات غير متاح حالياً." }, { status: 403 });
    }
    // التجديد مسموح مرة كل 5 أيام فقط — نمنع التلاعب بالترتيب عبر تجديد متكرر
    if (ad.published_at) {
      const cooldownMs = RENEW_COOLDOWN_DAYS * 86400000;
      const elapsedMs = Date.now() - new Date(ad.published_at as unknown as string).getTime();
      if (elapsedMs < cooldownMs) {
        const remainingMs = cooldownMs - elapsedMs;
        const remainingDays = Math.floor(remainingMs / 86400000);
        const remainingHours = Math.ceil((remainingMs - remainingDays * 86400000) / 3600000);
        const remainingText =
          remainingDays > 0
            ? `${remainingDays} ${remainingDays === 1 ? "يوم" : "أيام"}`
            : `${remainingHours} ${remainingHours === 1 ? "ساعة" : "ساعات"}`;
        return NextResponse.json({ error: `يمكنك تجديد الإعلان بعد ${remainingText}.` }, { status: 403 });
      }
    }
    const { data: settings } = await supabase
      .from("admin_settings")
      .select("key, value")
      .in("key", ["ad_renewal_duration_days", "ad_duration_days"]);
    const renewalValue = settings?.find((s) => s.key === "ad_renewal_duration_days")?.value;
    const baseValue = settings?.find((s) => s.key === "ad_duration_days")?.value;
    const durationDays = Number(renewalValue || baseValue || 60);
    const now = new Date().toISOString();
    await supabase
      .from("ads")
      .update({
        status: "published",
        // تاريخ الإنشاء الأصلي (created_at) يبقى ثابت — بس تاريخ النشر الظاهر يتجدد لـ"الآن"،
        // فينعكس فوراً بالترتيب والعرض بكل مكان (الرئيسية، التصنيف، صفحة الإعلان) بالضبط زي حراج
        published_at: now,
        expires_at: new Date(Date.now() + durationDays * 86400000).toISOString(),
        expiry_reminder_sent_at: null,
      })
      .eq("id", id);
  } else {
    return NextResponse.json({ error: "إجراء غير معروف." }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: ad } = await supabase.from("ads").select("id, user_id").eq("id", id).single();
  if (!ad || ad.user_id !== user.id) {
    return NextResponse.json({ error: "لا تملك صلاحية لتنفيذ هذا الإجراء." }, { status: 403 });
  }

  await supabase.from("ads").delete().eq("id", id);
  return NextResponse.json({ ok: true });
}
