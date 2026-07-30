import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// نموذج بلاغ الصفقة/الإقرار — القسم 48-49
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ad_id, ad_reference_text, deal_value, deal_type, in_platform, notes, receipt_url, transfer_name, transfer_date } = await request.json();

  if (!ad_id && !ad_reference_text?.trim()) {
    return NextResponse.json({ error: "اختر الإعلان أو صف الإعلان القديم." }, { status: 400 });
  }

  if (ad_id) {
    const { data: ad } = await supabase.from("ads").select("id, user_id").eq("id", ad_id).single();
    if (!ad || ad.user_id !== user.id) {
      return NextResponse.json({ error: "لا تملك صلاحية لتنفيذ هذا الإجراء." }, { status: 403 });
    }
  }

  const { data: rateSetting } = await supabase.from("admin_settings").select("value").eq("key", "commission_rate").maybeSingle();
  const rate = Number(rateSetting?.value ?? 5);
  const value = Number(deal_value) || 0;
  const amount = Math.round((value * rate) / 100 * 100) / 100;

  const { data: obligation, error } = await supabase
    .from("commission_obligations")
    .insert({
      ad_id: ad_id || null,
      ad_reference_text: ad_reference_text || null,
      user_id: user.id,
      deal_value: value || null,
      deal_type: deal_type || null,
      in_platform: in_platform ?? true,
      rate,
      amount,
      notes: notes || null,
      status: receipt_url ? "receipt_submitted" : "due",
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // رفع الإيصال بنفس الخطوة إذا تم إرفاقه — يدمج تسجيل الصفقة والدفع في نموذج واحد
  if (receipt_url) {
    await supabase.from("commission_payments").insert({
      obligation_id: obligation.id,
      receipt_url,
      transfer_name: transfer_name || null,
      transfer_date: transfer_date || null,
      status: "pending",
    });
  }

  return NextResponse.json({ id: obligation.id });
}
