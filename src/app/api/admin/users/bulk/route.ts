import { requireStaff, logAudit } from "@/lib/adminAuth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const auth = await requireStaff(["super_admin", "admin"]);
  if ("error" in auth) return auth.error;
  const { admin, user } = auth;

  const { action, ids, reason } = await request.json();
  if (!Array.isArray(ids) || ids.length === 0) return NextResponse.json({ error: "ما فيه عناصر محددة." }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if (action === "ban") {
    updates.is_banned = true;
    updates.ban_reason = reason ?? null;
  } else if (action === "unban") {
    updates.is_banned = false;
    updates.ban_reason = null;
  } else {
    return NextResponse.json({ error: "إجراء غير معروف." }, { status: 400 });
  }

  const { error } = await admin.from("profiles").update(updates).in("id", ids);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await admin.from("notifications").insert(
    ids.map((id: string) => ({
      user_id: id,
      type: action === "ban" ? "ACCOUNT_BANNED" : "ACCOUNT_UNBANNED",
      title: action === "ban" ? "تم إيقاف حسابك" : "تم إعادة تفعيل حسابك",
      body: action === "ban" ? `تم إيقاف حسابك. السبب: ${reason ?? "غير محدد"}.` : "تمت إعادة تفعيل حسابك ويمكنك استخدام المنصة بشكل طبيعي.",
    }))
  );

  await logAudit(user.id, `user_${action}`, "user", undefined, { reason, bulk: true, count: ids.length });
  return NextResponse.json({ ok: true, count: ids.length });
}
