import { requireStaff, logAudit } from "@/lib/adminAuth";
import { NextRequest, NextResponse } from "next/server";

const SEGMENT_LABELS: Record<string, string> = {
  all: "جميع المستخدمين",
  active_advertisers: "المعلنون النشطون",
  staff: "الموظفون",
  single: "مستخدم واحد",
};

export async function POST(request: NextRequest) {
  const auth = await requireStaff(["super_admin", "admin", "support"]);
  if ("error" in auth) return auth.error;
  const { admin, user } = auth;

  const { user_id, title, body, segment = "all" } = await request.json();
  if (!title || !body) return NextResponse.json({ error: "العنوان والنص مطلوبان." }, { status: 400 });

  let targetIds: string[] = [];

  if (segment === "single") {
    if (!user_id) return NextResponse.json({ error: "اختر مستخدماً أولاً." }, { status: 400 });
    targetIds = [user_id];
  } else if (segment === "active_advertisers") {
    const { data: ads } = await admin.from("ads").select("user_id").eq("status", "published");
    targetIds = Array.from(new Set((ads ?? []).map((a) => a.user_id)));
  } else if (segment === "staff") {
    const { data: staff } = await admin.from("profiles").select("id").neq("role", "user");
    targetIds = (staff ?? []).map((s) => s.id);
  } else {
    const { data: users } = await admin.from("profiles").select("id");
    targetIds = (users ?? []).map((u) => u.id);
  }

  if (targetIds.length === 0) {
    return NextResponse.json({ error: "ما فيه مستخدمين مطابقين لهذه الفئة." }, { status: 400 });
  }

  const rows = targetIds.map((id) => ({ user_id: id, type: "ADMIN_ANNOUNCEMENT", title, body }));
  await admin.from("notifications").insert(rows);

  await logAudit(user.id, "notification_sent", "notification", segment === "single" ? user_id : undefined, {
    title,
    body,
    segment,
    segmentLabel: SEGMENT_LABELS[segment] ?? segment,
    count: targetIds.length,
  });

  return NextResponse.json({ ok: true, count: targetIds.length });
}
