import { requireStaff, logAudit } from "@/lib/adminAuth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requireStaff(["super_admin", "admin", "moderator"]);
  if ("error" in auth) return auth.error;
  const { admin, user } = auth;

  const { status } = await request.json();
  if (!["visible", "hidden", "removed"].includes(status)) {
    return NextResponse.json({ error: "حالة غير معروفة." }, { status: 400 });
  }

  const { error } = await admin.from("comments").update({ status }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await logAudit(user.id, "comment_remove", "comment", id, { status });
  return NextResponse.json({ ok: true });
}
