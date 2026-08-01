import { createClient } from "@/lib/supabase/server";
import { renderNotification } from "@/lib/notificationTemplates";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: flag } = await supabase.from("feature_flags").select("enabled").eq("key", "reviews_enabled").maybeSingle();
  if (flag && flag.enabled === false) {
    return NextResponse.json({ error: "ميزة التقييمات غير متاحة حالياً." }, { status: 403 });
  }

  const { reviewee_id, ad_id, rating, comment } = await request.json();
  if (reviewee_id === user.id) {
    return NextResponse.json({ error: "لا يمكنك تقييم نفسك." }, { status: 400 });
  }
  if (!comment?.trim()) {
    return NextResponse.json({ error: "التعليق مطلوب." }, { status: 400 });
  }
  const ratingNum = Number(rating);
  if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return NextResponse.json({ error: "التقييم يجب أن يكون من 1 إلى 5 نجوم." }, { status: 400 });
  }

  const { data: manualFlag } = await supabase.from("feature_flags").select("enabled").eq("key", "reviews_manual_moderation_enabled").maybeSingle();
  const requiresManualReview = manualFlag ? manualFlag.enabled !== false : true;
  const status = requiresManualReview ? "pending" : "approved";

  const { error } = await supabase.from("reviews").insert({
    reviewer_id: user.id,
    reviewee_id,
    ad_id: ad_id || null,
    rating: ratingNum,
    comment,
    status,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (status === "approved") {
    const { data: profile } = await supabase.from("profiles").select("rating_sum, total_reviews").eq("id", reviewee_id).single();
    if (profile) {
      await supabase
        .from("profiles")
        .update({ rating_sum: (profile.rating_sum ?? 0) + ratingNum, total_reviews: (profile.total_reviews ?? 0) + 1 })
        .eq("id", reviewee_id);
    }
    const { title, body: notifBody } = await renderNotification("REVIEW_APPROVED");
    await supabase.from("notifications").insert({
      user_id: reviewee_id,
      type: "REVIEW_APPROVED",
      title,
      body: notifBody,
    });
  }

  return NextResponse.json({ ok: true });
}
