import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// نموذج بلاغ الصفقة/الإقرار — القسم 48-49
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ad_id, deal_value, deal_type, in_platform, notes } = await request.json();

  const { data: ad } = await supabase.from("ads").select("id, user_id").eq("id", ad_id).single();
  if (!ad || ad.user_id !== user.id) {
    return NextResponse.json({ error: "لا تملك صلاحية لتنفيذ هذا الإجراء." }, { status: 403 });
  }

  const { data: rateSetting } = await supabase.from("admin_settings").select("value").eq("key", "commission_rate").maybeSingle();
  const rate = Number(rateSetting?.value ?? 5);
  const value = Number(deal_value) || 0;
  const amount = Math.round((value * rate) / 100 * 100) / 100;

  const { data: obligation, error } = await supabase
    .from("commission_obligations")
    .insert({
      ad_id,
      user_id: user.id,
      deal_value: value || null,
      deal_type: deal_type || null,
      in_platform: in_platform ?? true,
      rate,
      amount,
      notes: notes || null,
      status: "due",
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ id: obligation.id });
}
