import { requireStaff, logAudit } from "@/lib/adminAuth";
import { renderNotification } from "@/lib/notificationTemplates";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requireStaff(["super_admin", "admin", "moderator", "support"]);
  if ("error" in auth) return auth.error;
  const { admin, user } = auth;

  const { status, resolution_note } = await request.json();
  const { data: report, error } = await admin
    .from("reports")
    .update({ status, resolution_note: resolution_note ?? null, resolved_by: user.id })
    .eq("id", id)
    .select("reporter_id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (["closed", "action_taken"].includes(status) && report) {
    const { title, body } = await renderNotification("REPORT_RESOLVED", {
      resolution_note: resolution_note || "تمت مراجعته واتخاذ الإجراء المناسب.",
    });
    await admin.from("notifications").insert({
      user_id: report.reporter_id,
      type: "REPORT_RESOLVED",
      title,
      body,
    });
  }

  await logAudit(user.id, "report_action", "report", id, { status, resolution_note });
  return NextResponse.json({ ok: true });
}
