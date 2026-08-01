import { requireStaff } from "@/lib/adminAuth";
import { NextRequest, NextResponse } from "next/server";

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))];
  return "﻿" + lines.join("\n");
}

export async function GET(request: NextRequest) {
  const auth = await requireStaff(["super_admin", "finance"]);
  if ("error" in auth) return auth.error;
  const { admin } = auth;

  const type = request.nextUrl.searchParams.get("type");
  let rows: Record<string, unknown>[] = [];
  let filename = "export.csv";

  if (type === "users") {
    const { data } = await admin
      .from("profiles")
      .select("id, display_name, username, phone, whatsapp, city, role, is_banned, total_reviews, created_at")
      .order("created_at", { ascending: false });
    rows = data ?? [];
    filename = "users.csv";
  } else if (type === "ads") {
    const { data } = await admin
      .from("ads")
      .select("id, title, status, price, city, views_count, favorites_count, is_featured, published_at, created_at")
      .order("created_at", { ascending: false });
    rows = data ?? [];
    filename = "ads.csv";
  } else if (type === "commissions") {
    const { data } = await admin
      .from("commission_obligations")
      .select("id, ad_id, user_id, deal_value, rate, amount, status, created_at")
      .order("created_at", { ascending: false });
    rows = data ?? [];
    filename = "commissions.csv";
  } else {
    return NextResponse.json({ error: "نوع تصدير غير معروف." }, { status: 400 });
  }

  return new NextResponse(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
