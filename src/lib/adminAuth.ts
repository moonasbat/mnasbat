import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { UserRole } from "@/lib/types";
import { NextResponse } from "next/server";

export async function requireStaff(allowedRoles?: UserRole[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const staffRoles: UserRole[] = ["super_admin", "admin", "moderator", "finance", "support"];

  if (!profile || !staffRoles.includes(profile.role)) {
    return { error: NextResponse.json({ error: "لا تملك صلاحية لتنفيذ هذا الإجراء." }, { status: 403 }) };
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return { error: NextResponse.json({ error: "هذه العملية تحتاج صلاحية أعلى." }, { status: 403 }) };
  }

  return { user, profile, admin: createAdminClient() };
}

export async function logAudit(
  actorId: string,
  action: string,
  targetType?: string,
  targetId?: string,
  metadata?: Record<string, unknown>
) {
  const admin = createAdminClient();
  await admin.from("audit_logs").insert({
    actor_id: actorId,
    action,
    target_type: targetType,
    target_id: targetId,
    metadata: metadata ?? {},
  });
}
