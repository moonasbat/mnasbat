"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserRole } from "@/lib/types";
import { ROLE_LABELS } from "@/lib/permissions";

const ROLES: UserRole[] = ["user", "support", "moderator", "finance", "admin", "super_admin"];

export default function AdminUserActions({
  userId,
  isBanned,
  role,
  canChangeRole,
}: {
  userId: string;
  isBanned: boolean;
  role: UserRole;
  canChangeRole: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function act(action: string, extra?: Record<string, unknown>) {
    setLoading(true);
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...extra }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      {isBanned ? (
        <button disabled={loading} onClick={() => act("unban")} className="text-green-600 hover:underline">فك الحظر</button>
      ) : (
        <button disabled={loading} onClick={() => act("ban", { reason: "مخالفة سياسة المنصة" })} className="text-red-600 hover:underline">حظر</button>
      )}
      {canChangeRole && (
        <select
          defaultValue={role}
          disabled={loading}
          onChange={(e) => act("set_role", { role: e.target.value })}
          className="border border-gray-200 rounded-lg px-1.5 py-1 text-xs"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
          ))}
        </select>
      )}
    </div>
  );
}
