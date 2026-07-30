import { requireStaff, logAudit } from "@/lib/adminAuth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const auth = await requireStaff(["super_admin", "admin", "support"]);
  if ("error" in auth) return auth.error;
  const { admin, user } = auth;

  const { user_id, title, body } = await request.json();
  if (!title || !body) return NextResponse.json({ error: "العنوان والنص مطلوبان." }, { status: 400 });

  if (user_id) {
    await admin.from("notifications").insert({ user_id, type: "ADMIN_ANNOUNCEMENT", title, body });
  } else {
    const { data: users } = await admin.from("profiles").select("id");
    const rows = (users ?? []).map((u) => ({ user_id: u.id, type: "ADMIN_ANNOUNCEMENT", title, body }));
    if (rows.length) await admin.from("notifications").insert(rows);
  }

  await logAudit(user.id, "notification_sent", "notification", user_id ?? undefined, { title, broadcast: !user_id });
  return NextResponse.json({ ok: true });
}
