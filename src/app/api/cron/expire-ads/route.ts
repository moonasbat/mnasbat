import { createAdminClient } from "@/lib/supabase/admin";
import { NOTIFICATIONS_CONTENT } from "@/lib/content";
import { NextRequest, NextResponse } from "next/server";

const REMINDER_DAYS_BEFORE_EXPIRY = 3;

// يُستدعى يومياً عبر Vercel Cron (راجع vercel.json) — ينبّه بقرب الانتهاء، ثم يحوّل الإعلانات المنتهية فعلاً
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = new Date();
  const reminderCutoff = new Date(now.getTime() + REMINDER_DAYS_BEFORE_EXPIRY * 86400000);

  const { data: expiringSoon } = await admin
    .from("ads")
    .select("id, title, user_id, expires_at")
    .eq("status", "published")
    .is("expiry_reminder_sent_at", null)
    .lt("expires_at", reminderCutoff.toISOString())
    .gt("expires_at", now.toISOString());

  if (expiringSoon && expiringSoon.length > 0) {
    await admin.from("notifications").insert(
      expiringSoon.map((ad) => ({
        user_id: ad.user_id,
        type: "AD_EXPIRING_SOON",
        title: NOTIFICATIONS_CONTENT.adExpiringSoonTitle,
        body: NOTIFICATIONS_CONTENT.adExpiringSoonBody(
          ad.title,
          Math.max(1, Math.ceil((new Date(ad.expires_at as string).getTime() - now.getTime()) / 86400000))
        ),
        related_id: ad.id,
      }))
    );
    await admin
      .from("ads")
      .update({ expiry_reminder_sent_at: now.toISOString() })
      .in("id", expiringSoon.map((ad) => ad.id));
  }

  const { data: expired, error } = await admin
    .from("ads")
    .update({ status: "expired" })
    .eq("status", "published")
    .lt("expires_at", now.toISOString())
    .select("id, title, user_id");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (expired && expired.length > 0) {
    await admin.from("notifications").insert(
      expired.map((ad) => ({
        user_id: ad.user_id,
        type: "AD_EXPIRED",
        title: NOTIFICATIONS_CONTENT.adExpiredTitle,
        body: NOTIFICATIONS_CONTENT.adExpiredBody(ad.title),
        related_id: ad.id,
      }))
    );
  }

  return NextResponse.json({ ok: true, expiringSoon: expiringSoon?.length ?? 0, expired: expired?.length ?? 0 });
}
