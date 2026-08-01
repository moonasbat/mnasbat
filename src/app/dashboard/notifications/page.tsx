import { createClient } from "@/lib/supabase/server";
import { Notification } from "@/lib/types";
import { AUTH_CONTENT } from "@/lib/content";
import { formatRelativeTime } from "@/lib/formatTime";
import { resolveNotificationLink } from "@/lib/notificationLink";
import Link from "next/link";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(50);

  // مجرد فتح صفحة الإشعارات يعتبرها "مقروءة" — بدون الحاجة لضغط زر إضافي
  const hasUnread = (notifications ?? []).some((n) => !n.is_read);
  if (hasUnread) {
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user!.id).eq("is_read", false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">{AUTH_CONTENT.navNotifications}</h1>
      </div>

      {notifications && notifications.length > 0 ? (
        <div className="space-y-2">
          {(notifications as Notification[]).map((n) => {
            const href = resolveNotificationLink(n.type, n.related_id);
            const body = (
              <div className={`rounded-2xl p-4 border ${n.is_read ? "bg-white border-gray-100" : "bg-purple-50 border-purple-100"} ${href ? "hover:border-[#6D28D9] transition-colors" : ""}`}>
                <p className="text-sm font-medium text-gray-900">{n.title}</p>
                <p className="text-sm text-gray-600 mt-0.5">{n.body}</p>
                <p className="text-xs text-gray-400 mt-1">{formatRelativeTime(n.created_at)}</p>
              </div>
            );
            return href ? (
              <Link key={n.id} href={href} className="block">
                {body}
              </Link>
            ) : (
              <div key={n.id}>{body}</div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-16">لا توجد إشعارات حتى الآن.</p>
      )}
    </div>
  );
}
