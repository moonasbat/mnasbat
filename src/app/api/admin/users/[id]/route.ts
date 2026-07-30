import { requireStaff, logAudit } from "@/lib/adminAuth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requireStaff(["super_admin", "admin"]);
  if ("error" in auth) return auth.error;
  const { admin, user, profile } = auth;

  const { action, reason, role } = await request.json();
  const updates: Record<string, unknown> = {};

  if (action === "ban") {
    updates.is_banned = true;
    updates.ban_reason = reason ?? null;
  } else if (action === "unban") {
    updates.is_banned = false;
    updates.ban_reason = null;
  } else if (action === "set_role") {
    if (profile.role !== "super_admin") {
      return NextResponse.json({ error: "هذه العملية تحتاج صلاحية أعلى." }, { status: 403 });
    }
    updates.role = role;
  } else {
    return NextResponse.json({ error: "إجراء غير معروف." }, { status: 400 });
  }

  const { error } = await admin.from("profiles").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await logAudit(user.id, `user_${action}`, "user", id, { reason, role });
  return NextResponse.json({ ok: true });
}
