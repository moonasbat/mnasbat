import SendNotificationForm from "@/components/admin/SendNotificationForm";
import PageHeader from "@/components/admin/PageHeader";

export default function AdminNotificationsPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="إرسال إشعار" subtitle="أرسل إشعاراً يصل لكل المستخدمين أو لفئة محددة منهم." />
      <SendNotificationForm />
    </div>
  );
}
