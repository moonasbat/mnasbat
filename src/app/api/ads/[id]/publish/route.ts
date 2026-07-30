import { createClient } from "@/lib/supabase/server";
import { COMMISSION_DECLARATION_TEXT } from "@/lib/content";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { accepted } = await request.json();
  if (!accepted) {
    return NextResponse.json(
      { error: "يجب الموافقة على إقرار الالتزام بالعمولة حتى تتمكن من نشر الإعلان." },
      { status: 400 }
    );
  }

  const { data: ad } = await supabase.from("ads").select("id, user_id").eq("id", id).single();
  if (!ad || ad.user_id !== user.id) {
    return NextResponse.json({ error: "لا تملك صلاحية لتنفيذ هذا الإجراء." }, { status: 403 });
  }

  const { count: imagesCount } = await supabase
    .from("ad_images")
    .select("id", { count: "exact", head: true })
    .eq("ad_id", id);

  if (imagesCount && imagesCount > 10) {
    return NextResponse.json({ error: "يمكنك إضافة 10 صور كحد أقصى." }, { status: 400 });
  }

  // حفظ نسخة الإقرار — تاريخ ووقت الموافقة ومعرف الإعلان والمستخدم (القسم 8)
  await supabase.from("commission_declarations").insert({
    ad_id: id,
    user_id: user.id,
    text_version: COMMISSION_DECLARATION_TEXT.join("\n"),
  });

  const { data: reviewFlag } = await supabase
    .from("feature_flags")
    .select("enabled")
    .eq("key", "manual_review_enabled")
    .maybeSingle();

  const needsReview = reviewFlag?.enabled ?? true;

  const { data: settings } = await supabase.from("admin_settings").select("key,value").eq("key", "ad_duration_days").maybeSingle();
  const durationDays = Number(settings?.value ?? 60);

  const updates: Record<string, unknown> = needsReview
    ? { status: "pending_review" }
    : {
        status: "published",
        published_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + durationDays * 86400000).toISOString(),
      };

  const { error } = await supabase.from("ads").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true, status: updates.status });
}
