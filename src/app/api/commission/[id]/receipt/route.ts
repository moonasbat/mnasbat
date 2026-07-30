import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { receipt_url, transfer_name, transfer_date } = await request.json();
  if (!receipt_url) return NextResponse.json({ error: "يرجى رفع إيصال التحويل." }, { status: 400 });

  const { data: obligation } = await supabase
    .from("commission_obligations")
    .select("id, user_id")
    .eq("id", id)
    .single();

  if (!obligation || obligation.user_id !== user.id) {
    return NextResponse.json({ error: "لا تملك صلاحية لتنفيذ هذا الإجراء." }, { status: 403 });
  }

  const { error } = await supabase.from("commission_payments").insert({
    obligation_id: id,
    receipt_url,
    transfer_name: transfer_name || null,
    transfer_date: transfer_date || null,
    status: "pending",
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await supabase.from("commission_obligations").update({ status: "receipt_submitted" }).eq("id", id);

  return NextResponse.json({ ok: true });
}
