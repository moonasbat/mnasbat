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

  // الإعلانات المنشورة اللي انتهت مدتها ولم تُجدَّد (التجديد يحرّك expires_at للمستقبل فيخرجها من هذا الاستعلام)
  // تُحذف نهائياً بدل تعليقها كـ"منتهي" — commission_obligations.ad_id يتحول لـ null تلقائياً (on delete set null)
  // ويبقى السجل المالي محفوظاً، وباقي الجداول المرتبطة (صور، تعليقات، مفضلة، محادثات) تُحذف معه بالكامل
  const { data: toExpire } = await admin
    .from("ads")
    .select("id, title, user_id")
    .eq("status", "published")
    .lt("expires_at", now.toISOString());

  if (toExpire && toExpire.length > 0) {
    await admin.from("notifications").insert(
      toExpire.map((ad) => ({
        user_id: ad.user_id,
        type: "AD_EXPIRED",
        title: NOTIFICATIONS_CONTENT.adExpiredTitle,
        body: NOTIFICATIONS_CONTENT.adExpiredBody(ad.title),
      }))
    );
    await admin.from("ads").delete().in("id", toExpire.map((ad) => ad.id));
  }

  const expired = toExpire;

  // إلغاء تمييز الإعلانات التي انتهت مدة تمييزها (featured_until) — كانت تبقى مميزة للأبد بدون هذا الفحص
  const { data: unfeatured } = await admin
    .from("ads")
    .update({ is_featured: false })
    .eq("is_featured", true)
    .not("featured_until", "is", null)
    .lt("featured_until", now.toISOString())
    .select("id");

  return NextResponse.json({
    ok: true,
    expiringSoon: expiringSoon?.length ?? 0,
    expired: expired?.length ?? 0,
    unfeatured: unfeatured?.length ?? 0,
  });
}
