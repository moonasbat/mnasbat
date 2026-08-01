import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// وضع "غير متاح مؤقتاً" — يوقف كل إعلانات المستخدم المنشورة دفعة واحدة، ويعيدها تلقائياً عند إلغاء الوضع
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { enabled } = await request.json();

  await supabase.from("profiles").update({ vacation_mode: !!enabled }).eq("id", user.id);

  if (enabled) {
    await supabase
      .from("ads")
      .update({ status: "paused", auto_paused_by_vacation: true })
      .eq("user_id", user.id)
      .eq("status", "published");
  } else {
    await supabase
      .from("ads")
      .update({ status: "published", auto_paused_by_vacation: false })
      .eq("user_id", user.id)
      .eq("status", "paused")
      .eq("auto_paused_by_vacation", true);
  }

  return NextResponse.json({ ok: true });
}
