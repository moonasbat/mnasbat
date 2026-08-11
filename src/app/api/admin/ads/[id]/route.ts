import { requireStaff, logAudit } from "@/lib/adminAuth";
import { renderNotification } from "@/lib/notificationTemplates";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requireStaff(["super_admin", "admin", "moderator"]);
  if ("error" in auth) return auth.error;
  const { admin, user } = auth;

  const { action, reason, fields } = await request.json();
  const updates: Record<string, unknown> = {};

  if (action === "edit") {
    const allowed = ["title", "description", "category_id", "city", "price", "whatsapp", "messages_enabled", "comments_enabled"];
    const editUpdates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (fields && key in fields) editUpdates[key] = fields[key];
    }
    if (Object.keys(editUpdates).length === 0) {
      return NextResponse.json({ error: "ما فيه أي تعديل." }, { status: 400 });
    }
    const { error } = await admin.from("ads").update(editUpdates).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    await logAudit(user.id, "ad_edit", "ad", id, editUpdates);
    return NextResponse.json({ ok: true });
  }

  if (action === "renew") {
    // تجديد إداري — بدون قيد فترة الانتظار اللي تُفرض على صاحب الإعلان، الأدمن يقدر يجدده فوراً بأي وقت
    const { data: settings } = await admin
      .from("admin_settings")
      .select("key, value")
      .in("key", ["ad_renewal_duration_days", "ad_duration_days"]);
    const renewalValue = settings?.find((s) => s.key === "ad_renewal_duration_days")?.value;
    const baseValue = settings?.find((s) => s.key === "ad_duration_days")?.value;
    const durationDays = Number(renewalValue || baseValue || 60);
    const now = new Date().toISOString();
    const { error } = await admin
      .from("ads")
      .update({
        status: "published",
        published_at: now,
        expires_at: new Date(Date.now() + durationDays * 86400000).toISOString(),
        expiry_reminder_sent_at: null,
        renewal_reminder_sent_at: null,
      })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    await logAudit(user.id, "ad_renew", "ad", id);
    return NextResponse.json({ ok: true });
  }

  if (action === "add_image") {
    const { url, public_id } = fields ?? {};
    if (!url || !public_id) return NextResponse.json({ error: "بيانات الصورة ناقصة." }, { status: 400 });
    const { count } = await admin.from("ad_images").select("id", { count: "exact", head: true }).eq("ad_id", id);
    const { data: inserted, error } = await admin
      .from("ad_images")
      .insert({ ad_id: id, url, cloudinary_public_id: public_id, sort_order: count ?? 0 })
      .select("id, url")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    await logAudit(user.id, "ad_image_add", "ad", id);
    return NextResponse.json({ ok: true, image: inserted });
  }

  if (action === "remove_image") {
    const { imageId } = fields ?? {};
    if (!imageId) return NextResponse.json({ error: "معرّف الصورة مطلوب." }, { status: 400 });
    const { error } = await admin.from("ad_images").delete().eq("id", imageId).eq("ad_id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    await logAudit(user.id, "ad_image_remove", "ad", id, { imageId });
    return NextResponse.json({ ok: true });
  }

  if (action === "approve") {
    const { data: settings } = await admin.from("admin_settings").select("value").eq("key", "ad_duration_days").maybeSingle();
    const durationDays = Number(settings?.value ?? 60);
    updates.status = "published";
    updates.published_at = new Date().toISOString();
    updates.expires_at = new Date(Date.now() + durationDays * 86400000).toISOString();
    updates.expiry_reminder_sent_at = null;
  } else if (action === "reject") {
    if (!reason) return NextResponse.json({ error: "سبب الرفض مطلوب." }, { status: 400 });
    updates.status = "rejected";
    updates.rejection_reason = reason;
  } else if (action === "pause") {
    updates.status = "paused";
  } else if (action === "remove") {
    updates.status = "removed";
  } else {
    return NextResponse.json({ error: "إجراء غير معروف." }, { status: 400 });
  }

  const { data: updatedAd, error } = await admin.from("ads").update(updates).eq("id", id).select("user_id, title").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (updatedAd && (action === "approve" || action === "reject")) {
    const { title, body } = await renderNotification(action === "approve" ? "AD_APPROVED" : "AD_REJECTED", {
      ad_title: updatedAd.title,
      reason: reason ?? "",
    });
    await admin.from("notifications").insert({
      user_id: updatedAd.user_id,
      type: action === "approve" ? "AD_APPROVED" : "AD_REJECTED",
      title,
      body,
      related_id: id,
    });
  }

  await logAudit(user.id, `ad_${action}`, "ad", id, { reason });
  return NextResponse.json({ ok: true });
}

// حذف نهائي حقيقي من قاعدة البيانات — غير "إزالة" (تعليق كـ removed مع بقاء السجل). مقصور على
// admin/super_admin فقط (ليس moderator) لأنه إجراء لا رجعة فيه
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requireStaff(["super_admin", "admin"]);
  if ("error" in auth) return auth.error;
  const { admin, user } = auth;

  const { data: ad } = await admin.from("ads").select("title, user_id").eq("id", id).maybeSingle();
  if (!ad) return NextResponse.json({ error: "الإعلان غير موجود." }, { status: 404 });

  const { error } = await admin.from("ads").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await logAudit(user.id, "ad_hard_delete", "ad", id, { title: ad.title, owner_id: ad.user_id });
  return NextResponse.json({ ok: true });
}
