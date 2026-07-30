import { requireStaff, logAudit } from "@/lib/adminAuth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await requireStaff(["super_admin", "admin", "moderator"]);
  if ("error" in auth) return auth.error;
  const { admin, user } = auth;

  const { status } = await request.json();
  const { data: review } = await admin.from("reviews").select("reviewee_id, is_positive").eq("id", id).single();
  if (!review) return NextResponse.json({ error: "غير موجود." }, { status: 404 });

  await admin.from("reviews").update({ status }).eq("id", id);

  if (status === "approved" || status === "rejected") {
    await admin.from("notifications").insert({
      user_id: review.reviewee_id,
      type: status === "approved" ? "REVIEW_APPROVED" : "REVIEW_REJECTED",
      title: status === "approved" ? "تقييم جديد على ملفك" : "تم رفض تقييم",
      body:
        status === "approved"
          ? "تمت الموافقة على تقييم جديد وتم نشره على ملفك الشخصي."
          : "تم رفض أحد التقييمات المقدمة على ملفك الشخصي.",
    });
  }

  if (status === "approved") {
    const field = review.is_positive ? "positive_reviews" : "negative_reviews";
    const { data: profile } = await admin.from("profiles").select(`${field}, total_reviews`).eq("id", review.reviewee_id).single();
    if (profile) {
      await admin
        .from("profiles")
        .update({
          [field]: ((profile as unknown as Record<string, number>)[field] ?? 0) + 1,
          total_reviews: ((profile as unknown as Record<string, number>).total_reviews ?? 0) + 1,
        })
        .eq("id", review.reviewee_id);
    }
  }

  await logAudit(user.id, "review_moderated", "review", id, { status });
  return NextResponse.json({ ok: true });
}
