import { requireStaff, logAudit } from "@/lib/adminAuth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requireStaff(["super_admin", "admin", "moderator", "support"]);
  if ("error" in auth) return auth.error;
  const { admin, user } = auth;

  const { status, resolution_note } = await request.json();
  const { error } = await admin
    .from("reports")
    .update({ status, resolution_note: resolution_note ?? null, resolved_by: user.id })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await logAudit(user.id, "report_action", "report", id, { status, resolution_note });
  return NextResponse.json({ ok: true });
}
