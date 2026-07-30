import SendNotificationForm from "@/components/admin/SendNotificationForm";

export default function AdminNotificationsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">إرسال إشعار</h1>
      <SendNotificationForm />
    </div>
  );
}
