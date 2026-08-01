import SendNotificationForm from "@/components/admin/SendNotificationForm";
import NotificationTemplatesManager from "@/components/admin/NotificationTemplatesManager";
import PageHeader from "@/components/admin/PageHeader";
import { createAdminClient } from "@/lib/supabase/admin";
import { AuditLog } from "@/lib/types";
import { formatRelativeTime } from "@/lib/formatTime";
import EmptyState from "@/components/admin/EmptyState";
import { Bell } from "lucide-react";

export default async function AdminNotificationsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const activeTab = tab === "templates" ? "templates" : "send";

  const admin = createAdminClient();

  if (activeTab === "templates") {
    const { data: templates } = await admin.from("notification_templates").select("*").order("category");
    return (
      <div className="space-y-6">
        <PageHeader title="الإشعارات" subtitle="أرسل إشعاراً لفئة محددة من المستخدمين، أو عدّل نصوص الإشعارات التلقائية للموقع." />
        <NotificationTabs active="templates" />
        <NotificationTemplatesManager templates={templates ?? []} />
      </div>
    );
  }

  const { data: logs } = await admin
    .from("audit_logs")
    .select("*, profiles(display_name)")
    .eq("action", "notification_sent")
    .order("created_at", { ascending: false })
    .limit(20);

  const history = (logs ?? []) as (AuditLog & { profiles: { display_name: string } | null })[];

  return (
    <div className="space-y-6">
      <PageHeader title="الإشعارات" subtitle="أرسل إشعاراً لفئة محددة من المستخدمين، أو عدّل نصوص الإشعارات التلقائية للموقع." />
      <NotificationTabs active="send" />
      <SendNotificationForm />

      <div>
        <p className="text-sm font-bold text-gray-700 mb-2.5">سجل الإشعارات المرسلة</p>
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          {history.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {history.map((l) => {
                const meta = (l.metadata ?? {}) as Record<string, unknown>;
                return (
                  <div key={l.id} className="px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-gray-900">{String(meta.title ?? "")}</p>
                      <span className="text-xs text-gray-400 shrink-0">{formatRelativeTime(l.created_at)}</span>
                    </div>
                    {meta.body ? <p className="text-sm text-gray-600 mt-1">{String(meta.body)}</p> : null}
                    <p className="text-xs text-gray-400 mt-1">
                      {String(meta.segmentLabel ?? "جميع المستخدمين")} · {String(meta.count ?? "—")} مستلم · بواسطة {l.profiles?.display_name ?? "النظام"}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState icon={Bell} title="ما أرسلت أي إشعار بعد" />
          )}
        </div>
      </div>
    </div>
  );
}

function NotificationTabs({ active }: { active: "send" | "templates" }) {
  return (
    <div className="flex flex-wrap gap-2">
      <a
        href="/admin/notifications"
        className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${active === "send" ? "bg-[#6D28D9] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"}`}
      >
        الإرسال
      </a>
      <a
        href="/admin/notifications?tab=templates"
        className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${active === "templates" ? "bg-[#6D28D9] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"}`}
      >
        قوالب النصوص
      </a>
    </div>
  );
}
