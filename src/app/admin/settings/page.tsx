import { createAdminClient } from "@/lib/supabase/admin";
import AdminSettingsForm from "@/components/admin/AdminSettingsForm";
import { AdminSettings, FeatureFlags } from "@/lib/types";

export default async function AdminSettingsPage() {
  const admin = createAdminClient();
  const [{ data: settingsRows }, { data: flagRows }] = await Promise.all([
    admin.from("admin_settings").select("key,value"),
    admin.from("feature_flags").select("key,enabled"),
  ]);

  const settings: AdminSettings = {};
  (settingsRows ?? []).forEach((r) => (settings[r.key] = r.value));

  const flags: FeatureFlags = {};
  (flagRows ?? []).forEach((r) => (flags[r.key] = r.enabled));

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">الإعدادات</h1>
      <AdminSettingsForm settings={settings} flags={flags} />
    </div>
  );
}
