import { requireStaff, logAudit } from "@/lib/adminAuth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  const auth = await requireStaff(["super_admin", "admin"]);
  if ("error" in auth) return auth.error;
  const { admin, user } = auth;

  const { key, title, body } = await request.json();
  if (!key || !title?.trim() || !body?.trim()) {
    return NextResponse.json({ error: "العنوان والنص مطلوبان." }, { status: 400 });
  }

  const { error } = await admin
    .from("notification_templates")
    .update({ title: title.trim(), body: body.trim(), updated_at: new Date().toISOString() })
    .eq("key", key);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await logAudit(user.id, "notification_template_update", "notification_template", key, { title, body });
  return NextResponse.json({ ok: true });
}
