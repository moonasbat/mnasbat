import { requireStaff, logAudit } from "@/lib/adminAuth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requireStaff(["super_admin", "admin", "moderator"]);
  if ("error" in auth) return auth.error;
  const { admin, user } = auth;

  const { action, reason } = await request.json();
  const updates: Record<string, unknown> = {};

  if (action === "approve") {
    const { data: settings } = await admin.from("admin_settings").select("value").eq("key", "ad_duration_days").maybeSingle();
    const durationDays = Number(settings?.value ?? 60);
    updates.status = "published";
    updates.published_at = new Date().toISOString();
    updates.expires_at = new Date(Date.now() + durationDays * 86400000).toISOString();
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

  const { error } = await admin.from("ads").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await logAudit(user.id, `ad_${action}`, "ad", id, { reason });
  return NextResponse.json({ ok: true });
}
