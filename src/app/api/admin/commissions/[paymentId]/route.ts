import { requireStaff, logAudit } from "@/lib/adminAuth";
import { renderNotification } from "@/lib/notificationTemplates";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ paymentId: string }> }) {
  const { paymentId } = await params;
  const auth = await requireStaff(["super_admin", "admin", "finance"]);
  if ("error" in auth) return auth.error;
  const { admin, user } = auth;

  const { action, reason } = await request.json();

  const { data: payment } = await admin
    .from("commission_payments")
    .select("id, obligation_id, commission_obligations(user_id, ad_id)")
    .eq("id", paymentId)
    .single();

  if (!payment) return NextResponse.json({ error: "الإيصال غير موجود." }, { status: 404 });

  if (action === "approve") {
    await admin.from("commission_payments").update({ status: "approved", reviewed_by: user.id }).eq("id", paymentId);
    await admin.from("commission_obligations").update({ status: "approved" }).eq("id", payment.obligation_id);

    const obligation = (payment as unknown as { commission_obligations: { user_id: string; ad_id: string | null } }).commission_obligations;
    const ownerId = obligation.user_id;

    // منح المزايا بعد الاعتماد فقط — القسم 53 (قابلة للتعطيل من لوحة التحكم عبر commission_perks_enabled)
    const { data: perksFlag } = await admin.from("feature_flags").select("enabled").eq("key", "commission_perks_enabled").maybeSingle();
    const perksEnabled = perksFlag ? perksFlag.enabled : true;

    if (perksEnabled) {
      await admin.from("feature_entitlements").insert([
        { user_id: ownerId, feature_key: "commission_badge", source: "commission_payment", reason: "اعتماد إيصال عمولة" },
        { user_id: ownerId, feature_key: "boosted_visibility", source: "commission_payment", reason: "اعتماد إيصال عمولة" },
      ]);

      if (obligation.ad_id) {
        await admin
          .from("ads")
          .update({ is_featured: true, featured_until: new Date(Date.now() + 14 * 86400000).toISOString() })
          .eq("id", obligation.ad_id);
      }
    }

    const { title, body: notifBody } = await renderNotification("COMMISSION_RECEIPT_APPROVED");
    await admin.from("notifications").insert({
      user_id: ownerId,
      type: "COMMISSION_RECEIPT_APPROVED",
      title,
      body: notifBody,
    });
  } else if (action === "reject") {
    if (!reason) return NextResponse.json({ error: "سبب الرفض مطلوب." }, { status: 400 });
    await admin.from("commission_payments").update({ status: "rejected", rejection_reason: reason, reviewed_by: user.id }).eq("id", paymentId);
    await admin.from("commission_obligations").update({ status: "due" }).eq("id", payment.obligation_id);

    const ownerId = (payment as unknown as { commission_obligations: { user_id: string } }).commission_obligations.user_id;
    const { title, body: notifBody } = await renderNotification("COMMISSION_RECEIPT_REJECTED", { reason });
    await admin.from("notifications").insert({
      user_id: ownerId,
      type: "COMMISSION_RECEIPT_REJECTED",
      title,
      body: notifBody,
    });
  } else if (action === "needs_info") {
    await admin.from("commission_payments").update({ status: "needs_info", reviewed_by: user.id }).eq("id", paymentId);
  } else {
    return NextResponse.json({ error: "إجراء غير معروف." }, { status: 400 });
  }

  await logAudit(user.id, `commission_payment_${action}`, "commission_payment", paymentId, { reason });
  return NextResponse.json({ ok: true });
}
