import { createAdminClient } from "@/lib/supabase/admin";
import { renderNotification } from "@/lib/notificationTemplates";
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

  const { data: settingsRows } = await admin
    .from("admin_settings")
    .select("key, value")
    .in("key", ["ad_renewal_cooldown_days", "ad_deletion_grace_days"]);
  const renewalCooldownDays = Number(settingsRows?.find((s) => s.key === "ad_renewal_cooldown_days")?.value || 5);
  const deletionGraceDays = Number(settingsRows?.find((s) => s.key === "ad_deletion_grace_days")?.value || 30);

  // إشعار مباشر بمجرد ما تنتهي مهلة "أقل فترة بين تجديد وآخر" — يخبر المعلن إنه يقدر يجدد إعلانه الآن
  const cooldownCutoff = new Date(now.getTime() - renewalCooldownDays * 86400000);
  const { data: renewalAvailable } = await admin
    .from("ads")
    .select("id, title, user_id")
    .eq("status", "published")
    .is("renewal_reminder_sent_at", null)
    .lt("published_at", cooldownCutoff.toISOString());

  if (renewalAvailable && renewalAvailable.length > 0) {
    const rows = await Promise.all(
      renewalAvailable.map(async (ad) => {
        const { title, body } = await renderNotification("AD_RENEWAL_AVAILABLE", { ad_title: ad.title });
        return { user_id: ad.user_id, type: "AD_RENEWAL_AVAILABLE", title, body, related_id: ad.id };
      })
    );
    await admin.from("notifications").insert(rows);
    await admin
      .from("ads")
      .update({ renewal_reminder_sent_at: now.toISOString() })
      .in("id", renewalAvailable.map((ad) => ad.id));
  }

  const { data: expiringSoon } = await admin
    .from("ads")
    .select("id, title, user_id, expires_at")
    .eq("status", "published")
    .is("expiry_reminder_sent_at", null)
    .lt("expires_at", reminderCutoff.toISOString())
    .gt("expires_at", now.toISOString());

  if (expiringSoon && expiringSoon.length > 0) {
    const rows = await Promise.all(
      expiringSoon.map(async (ad) => {
        const days = Math.max(1, Math.ceil((new Date(ad.expires_at as string).getTime() - now.getTime()) / 86400000));
        const { title, body } = await renderNotification("AD_EXPIRING_SOON", { ad_title: ad.title, days });
        return { user_id: ad.user_id, type: "AD_EXPIRING_SOON", title, body, related_id: ad.id };
      })
    );
    await admin.from("notifications").insert(rows);
    await admin
      .from("ads")
      .update({ expiry_reminder_sent_at: now.toISOString() })
      .in("id", expiringSoon.map((ad) => ad.id));
  }

  // المرحلة الأولى: الإعلانات المنشورة اللي انتهت مدتها (30 يوم) ولم تُجدَّد — تُخفى عن الزوار (status=expired)
  // بدل الحذف الفوري، وتُمهَل 30 يوم إضافية للتجديد قبل الحذف النهائي بالمرحلة الثانية أدناه
  const { data: toExpire } = await admin
    .from("ads")
    .select("id, title, user_id")
    .eq("status", "published")
    .lt("expires_at", now.toISOString());

  if (toExpire && toExpire.length > 0) {
    const rows = await Promise.all(
      toExpire.map(async (ad) => {
        const { title, body } = await renderNotification("AD_EXPIRED", { ad_title: ad.title });
        return { user_id: ad.user_id, type: "AD_EXPIRED", title, body };
      })
    );
    await admin.from("notifications").insert(rows);
    await admin.from("ads").update({ status: "expired" }).in("id", toExpire.map((ad) => ad.id));
  }

  // المرحلة الثانية: الإعلانات اللي صارت "منتهية" من 30 يوم إضافية ولم تُجدَّد نهائياً — تُحذف من قاعدة البيانات فعلياً
  // commission_obligations.ad_id يتحول لـ null تلقائياً (on delete set null) ويبقى السجل المالي محفوظاً
  // وباقي الجداول المرتبطة (صور، تعليقات، مفضلة، محادثات) تُحذف معه بالكامل
  const graceCutoff = new Date(now.getTime() - deletionGraceDays * 86400000);
  const { data: toDelete } = await admin
    .from("ads")
    .select("id, title, user_id")
    .eq("status", "expired")
    .lt("expires_at", graceCutoff.toISOString());

  if (toDelete && toDelete.length > 0) {
    const rows = await Promise.all(
      toDelete.map(async (ad) => {
        const { title, body } = await renderNotification("AD_PERMANENTLY_DELETED", { ad_title: ad.title });
        return { user_id: ad.user_id, type: "AD_PERMANENTLY_DELETED", title, body };
      })
    );
    await admin.from("notifications").insert(rows);
    await admin.from("ads").delete().in("id", toDelete.map((ad) => ad.id));
  }

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
    renewalAvailable: renewalAvailable?.length ?? 0,
    expiringSoon: expiringSoon?.length ?? 0,
    expired: toExpire?.length ?? 0,
    permanentlyDeleted: toDelete?.length ?? 0,
    unfeatured: unfeatured?.length ?? 0,
  });
}
