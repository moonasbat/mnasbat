import { createAdminClient } from "@/lib/supabase/admin";
import { Wrench } from "lucide-react";

export default async function MaintenancePage() {
  const admin = createAdminClient();
  const { data } = await admin.from("admin_settings").select("value").eq("key", "maintenance_message").maybeSingle();
  const message = data?.value?.trim() || "الموقع تحت الصيانة حالياً، سنعود قريباً.";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-full bg-purple-50 text-[#6D28D9] flex items-center justify-center mx-auto mb-5">
          <Wrench size={28} />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">مناسبات</h1>
        <p className="text-gray-500">{message}</p>
      </div>
    </div>
  );
}
