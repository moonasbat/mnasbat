import { createClient } from "@/lib/supabase/server";
import { isStaff } from "@/lib/permissions";
import { redirect } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import { Profile } from "@/lib/types";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!isStaff(profile?.role)) redirect("/");

  return (
    <div className="min-h-screen flex" dir="rtl">
      <AdminNav role={(profile as Profile).role} />
      <main className="flex-1 p-6 md:p-8 bg-gray-50 min-h-screen overflow-x-auto">{children}</main>
    </div>
  );
}
