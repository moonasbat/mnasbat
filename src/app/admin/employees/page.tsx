import { createAdminClient } from "@/lib/supabase/admin";
import { Profile } from "@/lib/types";
import { ROLE_LABELS } from "@/lib/permissions";
import AdminUserActions from "@/components/admin/AdminUserActions";

export default async function AdminEmployeesPage() {
  const admin = createAdminClient();
  const { data: staff } = await admin.from("profiles").select("*").neq("role", "user").order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">الموظفون والصلاحيات</h1>
      <p className="text-sm text-gray-500">
        لتحويل مستخدم إلى موظف، ابحث عنه في صفحة المستخدمين وغيّر دوره من القائمة.
      </p>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs">
            <tr>
              <th className="text-right px-4 py-3">الاسم</th>
              <th className="text-right px-4 py-3">الدور</th>
              <th className="text-right px-4 py-3">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(staff as Profile[])?.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3">{u.display_name}</td>
                <td className="px-4 py-3 text-gray-500">{ROLE_LABELS[u.role]}</td>
                <td className="px-4 py-3"><AdminUserActions userId={u.id} isBanned={u.is_banned} role={u.role} canChangeRole /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!staff || staff.length === 0) && <p className="text-center text-sm text-gray-400 py-10">لا يوجد موظفون بعد.</p>}
      </div>
    </div>
  );
}
