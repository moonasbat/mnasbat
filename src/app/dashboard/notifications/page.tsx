import { createClient } from "@/lib/supabase/server";
import { Notification } from "@/lib/types";
import MarkAllRead from "@/components/dashboard/MarkAllRead";
import { AUTH_CONTENT } from "@/lib/content";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">{AUTH_CONTENT.navNotifications}</h1>
        <MarkAllRead />
      </div>

      {notifications && notifications.length > 0 ? (
        <div className="space-y-2">
          {(notifications as Notification[]).map((n) => (
            <div key={n.id} className={`rounded-2xl p-4 border ${n.is_read ? "bg-white border-gray-100" : "bg-purple-50 border-purple-100"}`}>
              <p className="text-sm font-medium text-gray-900">{n.title}</p>
              <p className="text-sm text-gray-600 mt-0.5">{n.body}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString("ar-SA")}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-16">لا توجد إشعارات حتى الآن.</p>
      )}
    </div>
  );
}
