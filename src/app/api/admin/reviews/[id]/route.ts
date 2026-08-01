import { requireStaff, logAudit } from "@/lib/adminAuth";
import { renderNotification } from "@/lib/notificationTemplates";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requireStaff(["super_admin", "admin", "moderator"]);
  if ("error" in auth) return auth.error;
  const { admin, user } = auth;

  const { status } = await request.json();
  const { data: review } = await admin.from("reviews").select("reviewee_id, rating").eq("id", id).single();
  if (!review) return NextResponse.json({ error: "غير موجود." }, { status: 404 });

  await admin.from("reviews").update({ status }).eq("id", id);

  if (status === "approved" || status === "rejected") {
    const { title, body } = await renderNotification(status === "approved" ? "REVIEW_APPROVED" : "REVIEW_REJECTED");
    await admin.from("notifications").insert({
      user_id: review.reviewee_id,
      type: status === "approved" ? "REVIEW_APPROVED" : "REVIEW_REJECTED",
      title,
      body,
    });
  }

  if (status === "approved") {
    const { data: profile } = await admin.from("profiles").select("rating_sum, total_reviews").eq("id", review.reviewee_id).single();
    if (profile) {
      await admin
        .from("profiles")
        .update({
          rating_sum: (profile.rating_sum ?? 0) + review.rating,
          total_reviews: (profile.total_reviews ?? 0) + 1,
        })
        .eq("id", review.reviewee_id);
    }
  }

  await logAudit(user.id, "review_moderated", "review", id, { status });
  return NextResponse.json({ ok: true });
}
