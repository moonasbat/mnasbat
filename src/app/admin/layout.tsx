import { createClient } from "@/lib/supabase/server";
import { isStaff } from "@/lib/permissions";
import { redirect } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { Profile } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!isStaff(profile?.role)) redirect("/");

  return (
    <div className="min-h-screen flex flex-col md:flex-row" dir="rtl">
      <AdminNav role={(profile as Profile).role} displayName={(profile as Profile).display_name} />
      <div className="flex-1 min-w-0 bg-gray-50 min-h-screen flex flex-col">
        <AdminTopbar />
        <main className="flex-1 p-4 md:p-8 overflow-x-auto">{children}</main>
      </div>
    </div>
  );
}
