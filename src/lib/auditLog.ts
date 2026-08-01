import { AuditLog } from "@/lib/types";
import { SETTING_LABELS } from "@/lib/adminSettingsMeta";
import { ROLE_LABELS } from "@/lib/permissions";

// صياغة عربية كاملة لكل نوع إجراء مسجّل — بلا أي كلمة إنجليزية أو مصطلح تقني تظهر للمالك
const ACTION_VERBS: Record<string, string> = {
  user_ban: "حظر مستخدماً",
  user_unban: "ألغى حظر مستخدم",
  user_set_role: "غيّر دور مستخدم",
  ad_approve: "اعتمد إعلاناً",
  ad_reject: "رفض إعلاناً",
  ad_pause: "أوقف إعلاناً",
  ad_remove: "حذف إعلاناً",
  ad_edit: "عدّل بيانات إعلان",
  commission_payment_approve: "اعتمد إيصال عمولة",
  commission_payment_reject: "رفض إيصال عمولة",
  commission_payment_needs_info: "طلب معلومات إضافية عن إيصال عمولة",
  category_create: "أضاف تصنيفاً جديداً",
  category_update: "عدّل تصنيفاً",
  category_delete: "حذف تصنيفاً",
  feature_flag_toggle: "غيّر حالة ميزة",
  notification_sent: "أرسل إشعاراً",
  report_action: "عالج بلاغاً",
  review_moderated: "راجع تقييماً",
  setting_update: "غيّر إعداداً",
};

const COMMENT_STATUS_LABELS: Record<string, string> = {
  visible: "أعاد إظهار تعليق",
  hidden: "أخفى تعليقاً",
  removed: "حذف تعليقاً",
};

export function formatAuditAction(
  log: Pick<AuditLog, "action" | "target_id" | "metadata">,
  flagLabels: Record<string, string> = {}
): string {
  const meta = (log.metadata ?? {}) as Record<string, unknown>;
  const verb = ACTION_VERBS[log.action] ?? "نفّذ إجراءً إدارياً";
  const bulkSuffix = meta.bulk && typeof meta.count === "number" ? ` (${meta.count} عنصر دفعة واحدة)` : "";

  switch (log.action) {
    case "setting_update": {
      const label = SETTING_LABELS[log.target_id ?? ""] ?? "إعداد";
      return `${verb} «${label}» إلى «${meta.value ?? "—"}»`;
    }
    case "feature_flag_toggle": {
      const label = flagLabels[log.target_id ?? ""] ?? "ميزة";
      return `${verb} «${label}» إلى ${meta.enabled ? "مفعّلة" : "معطّلة"}`;
    }
    case "user_set_role": {
      const role = meta.role as string | undefined;
      return `${verb} إلى «${role ? ROLE_LABELS[role as keyof typeof ROLE_LABELS] ?? role : "—"}»`;
    }
    case "user_ban":
      return (meta.reason ? `${verb} — السبب: ${meta.reason}` : verb) + bulkSuffix;
    case "ad_reject":
    case "commission_payment_reject":
      return (meta.reason ? `${verb} — السبب: ${meta.reason}` : verb) + bulkSuffix;
    case "ad_approve":
    case "ad_pause":
    case "ad_remove":
    case "user_unban":
      return verb + bulkSuffix;
    case "report_action":
      return meta.status ? `${verb} — الحالة: ${resolveReportStatus(meta.status as string)}` : verb;
    case "category_create":
    case "category_update":
      return meta.name ? `${verb} «${meta.name}»` : verb;
    case "notification_sent": {
      const segmentLabel = (meta.segmentLabel as string | undefined) ?? (meta.broadcast ? "جميع المستخدمين" : "مستخدم واحد");
      const count = meta.count as number | undefined;
      return `${verb} «${meta.title ?? ""}» إلى ${segmentLabel}${count ? ` (${count} مستلم)` : ""}`;
    }
    case "comment_remove": {
      const status = meta.status as string | undefined;
      return status ? COMMENT_STATUS_LABELS[status] ?? verb : verb;
    }
    default:
      return verb;
  }
}

export const TARGET_TYPE_LABELS: Record<string, string> = {
  user: "مستخدم",
  ad: "إعلان",
  commission_payment: "إيصال عمولة",
  category: "تصنيف",
  feature_flag: "ميزة",
  notification: "إشعار",
  report: "بلاغ",
  review: "تقييم",
  admin_setting: "إعداد",
  comment: "تعليق",
};

export const TARGET_TYPE_COLORS: Record<string, "gray" | "green" | "red" | "amber" | "blue" | "purple"> = {
  user: "blue",
  ad: "purple",
  commission_payment: "green",
  category: "gray",
  feature_flag: "amber",
  notification: "blue",
  report: "red",
  review: "amber",
  admin_setting: "gray",
  comment: "gray",
};

function resolveReportStatus(status: string) {
  const labels: Record<string, string> = {
    new: "جديد",
    in_review: "قيد المراجعة",
    needs_info: "يحتاج معلومات",
    closed: "مغلق",
    action_taken: "إجراء متخذ",
  };
  return labels[status] ?? status;
}
