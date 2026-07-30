import { requireStaff, logAudit } from "@/lib/adminAuth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  const auth = await requireStaff(["super_admin"]);
  if ("error" in auth) return auth.error;
  const { admin, user } = auth;

  const { key, value } = await request.json();
  const { error } = await admin.from("admin_settings").update({ value: String(value) }).eq("key", key);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await logAudit(user.id, "setting_update", "admin_setting", key, { value });
  return NextResponse.json({ ok: true });
}
