import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limit = await checkRateLimit({
    supabase,
    settingKey: "rate_limit_ads_per_day",
    table: "ads",
    userIdColumn: "user_id",
    userId: user.id,
    windowMs: 24 * 60 * 60 * 1000,
  });
  if (!limit.ok) return NextResponse.json({ error: limit.error }, { status: 429 });

  const body = await request.json();
  const { title, description, category_id, city, price, whatsapp, messages_enabled, comments_enabled } = body;

  if (!title?.trim()) return NextResponse.json({ error: "يرجى كتابة عنوان الإعلان." }, { status: 400 });
  if (!description?.trim()) return NextResponse.json({ error: "يرجى كتابة وصف الإعلان." }, { status: 400 });
  if (!category_id) return NextResponse.json({ error: "يرجى اختيار التصنيف." }, { status: 400 });
  if (price !== undefined && price !== null && price !== "" && (isNaN(Number(price)) || Number(price) < 0)) {
    return NextResponse.json({ error: "السعر غير صالح." }, { status: 400 });
  }

  const { data: ad, error } = await supabase
    .from("ads")
    .insert({
      user_id: user.id,
      title,
      description,
      category_id,
      city: city || null,
      price: price ? Number(price) : null,
      whatsapp: whatsapp || null,
      messages_enabled: messages_enabled ?? true,
      comments_enabled: comments_enabled ?? true,
      status: "draft",
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ id: ad.id });
}
