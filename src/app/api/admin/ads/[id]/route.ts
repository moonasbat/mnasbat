import { requireStaff, logAudit } from "@/lib/adminAuth";
import { grantReferralRewardIfApplicable } from "@/lib/referral";
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
    const allowed = ["title", "description", "category_id", "city", "price"];
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

  if (updatedAd && action === "approve") {
    await grantReferralRewardIfApplicable(admin, updatedAd.user_id);
  }

  await logAudit(user.id, `ad_${action}`, "ad", id, { reason });
  return NextResponse.json({ ok: true });
}
