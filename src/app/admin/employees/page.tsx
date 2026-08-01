import { createAdminClient } from "@/lib/supabase/admin";
import { Profile } from "@/lib/types";
import { ROLE_LABELS } from "@/lib/permissions";
import AdminUserActions from "@/components/admin/AdminUserActions";
import PageHeader from "@/components/admin/PageHeader";
import Badge from "@/components/admin/Badge";
import EmptyState from "@/components/admin/EmptyState";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";

export default async function AdminEmployeesPage() {
  const admin = createAdminClient();
  const { data: staff } = await admin.from("profiles").select("*").neq("role", "user").order("created_at", { ascending: false });

  const list = staff as Profile[] | null;

  return (
    <div className="space-y-4">
      <PageHeader
        title="الموظفون والصلاحيات"
        subtitle="لتحويل مستخدم إلى موظف، ابحث عنه في صفحة المستخدمين وغيّر دوره من القائمة."
      />

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {list && list.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr>
                <th className="text-right px-4 py-3 font-medium">الاسم</th>
                <th className="text-right px-4 py-3 font-medium">الدور</th>
                <th className="text-right px-4 py-3 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {list.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    <Link href={`/admin/users/${u.id}`} className="hover:underline">{u.display_name}</Link>
                  </td>
                  <td className="px-4 py-3"><Badge color="purple">{ROLE_LABELS[u.role]}</Badge></td>
                  <td className="px-4 py-3"><AdminUserActions userId={u.id} isBanned={u.is_banned} role={u.role} canChangeRole /></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState icon={ShieldCheck} title="لا يوجد موظفون بعد" />
        )}
      </div>
    </div>
  );
}
