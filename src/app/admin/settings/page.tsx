import { createAdminClient } from "@/lib/supabase/admin";
import AdminSettingsForm from "@/components/admin/AdminSettingsForm";
import { AdminSettings, FeatureFlags } from "@/lib/types";
import PageHeader from "@/components/admin/PageHeader";

export default async function AdminSettingsPage() {
  const admin = createAdminClient();
  const [{ data: settingsRows }, { data: flagRows }] = await Promise.all([
    admin.from("admin_settings").select("key,value"),
    admin.from("feature_flags").select("key,enabled,label"),
  ]);

  const settings: AdminSettings = {};
  (settingsRows ?? []).forEach((r) => (settings[r.key] = r.value));

  const flags: FeatureFlags = {};
  const flagLabels: Record<string, string> = {};
  (flagRows ?? []).forEach((r) => {
    flags[r.key] = r.enabled;
    flagLabels[r.key] = r.label ?? r.key;
  });

  return (
    <div className="space-y-4">
      <PageHeader title="الإعدادات" subtitle="كل التبديلات هنا تُطبَّق فوراً على الموقع بدون الحاجة لأي تعديل تقني." />
      <AdminSettingsForm settings={settings} flags={flags} flagLabels={flagLabels} />
    </div>
  );
}
