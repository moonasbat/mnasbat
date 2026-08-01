import { requireStaff, logAudit } from "@/lib/adminAuth";
import { renderNotification } from "@/lib/notificationTemplates";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const auth = await requireStaff(["super_admin", "admin", "moderator"]);
  if ("error" in auth) return auth.error;
  const { admin, user } = auth;

  const { action, ids, reason } = await request.json();
  if (!Array.isArray(ids) || ids.length === 0) return NextResponse.json({ error: "ما فيه عناصر محددة." }, { status: 400 });

  const updates: Record<string, unknown> = {};
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

  const { data: updatedAds, error } = await admin.from("ads").update(updates).in("id", ids).select("id, user_id, title");
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (updatedAds && (action === "approve" || action === "reject")) {
    const rows = await Promise.all(
      updatedAds.map(async (ad) => {
        const { title, body } = await renderNotification(action === "approve" ? "AD_APPROVED" : "AD_REJECTED", {
          ad_title: ad.title,
          reason: reason ?? "",
        });
        return {
          user_id: ad.user_id,
          type: action === "approve" ? "AD_APPROVED" : "AD_REJECTED",
          title,
          body,
          related_id: ad.id,
        };
      })
    );
    await admin.from("notifications").insert(rows);
  }

  await logAudit(user.id, `ad_${action}`, "ad", undefined, { reason, bulk: true, count: ids.length });
  return NextResponse.json({ ok: true, count: ids.length });
}
