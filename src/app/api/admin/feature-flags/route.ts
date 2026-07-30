import { requireStaff, logAudit } from "@/lib/adminAuth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  const auth = await requireStaff(["super_admin"]);
  if ("error" in auth) return auth.error;
  const { admin, user } = auth;

  const { key, enabled } = await request.json();
  const { error } = await admin.from("feature_flags").update({ enabled }).eq("key", key);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await logAudit(user.id, "feature_flag_toggle", "feature_flag", key, { enabled });
  return NextResponse.json({ ok: true });
}
