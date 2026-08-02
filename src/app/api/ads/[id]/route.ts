import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { action } = body;
  const { data: ad } = await supabase.from("ads").select("id, user_id, status, created_at").eq("id", id).single();
  if (!ad || ad.user_id !== user.id) {
    return NextResponse.json({ error: "لا تملك صلاحية لتنفيذ هذا الإجراء." }, { status: 403 });
  }

  if (action === "update") {
    const EDIT_WINDOW_MS = 5 * 60 * 1000;
    const createdAt = new Date(ad.created_at as unknown as string).getTime();
    if (Date.now() - createdAt > EDIT_WINDOW_MS) {
      return NextResponse.json(
        { error: "لا يمكن تعديل الإعلان بعد مرور 5 دقائق من نشره." },
        { status: 403 }
      );
    }

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
    const { error } = await supabase
      .from("ads")
      .update({
        title, description, category_id, city: city || null,
        price: price ? Number(price) : null, whatsapp: whatsapp || null,
        messages_enabled: messages_enabled ?? true, comments_enabled: comments_enabled ?? true,
        edited_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true });
  } else if (action === "pause") {
    await supabase.from("ads").update({ status: "paused" }).eq("id", id);
  } else if (action === "resume") {
    await supabase.from("ads").update({ status: "published" }).eq("id", id);
  } else if (action === "renew") {
    const { data: flag } = await supabase.from("feature_flags").select("enabled").eq("key", "ad_renewal_enabled").maybeSingle();
    if (flag && flag.enabled === false) {
      return NextResponse.json({ error: "تجديد الإعلانات غير متاح حالياً." }, { status: 403 });
    }
    const { data: settings } = await supabase.from("admin_settings").select("value").eq("key", "ad_duration_days").maybeSingle();
    const durationDays = Number(settings?.value ?? 60);
    await supabase
      .from("ads")
      .update({
        status: "published",
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
