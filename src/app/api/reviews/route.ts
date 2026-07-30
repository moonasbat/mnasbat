import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { reviewee_id, ad_id, is_positive, comment } = await request.json();
  if (reviewee_id === user.id) {
    return NextResponse.json({ error: "لا يمكنك تقييم نفسك." }, { status: 400 });
  }
  if (!comment?.trim()) {
    return NextResponse.json({ error: "التعليق مطلوب." }, { status: 400 });
  }

  const { error } = await supabase.from("reviews").insert({
    reviewer_id: user.id,
    reviewee_id,
    ad_id: ad_id || null,
    is_positive,
    comment,
    status: "pending",
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
