// يحدّد الرابط اللي يودي له الضغط على كل إشعار حسب نوعه — يرجّع null إذا الإشعار غير تفاعلي (إعلامي فقط)
export function resolveNotificationLink(type: string, relatedId?: string | null): string | null {
  switch (type) {
    case "AD_EXPIRING_SOON":
    case "AD_RENEWAL_AVAILABLE":
    case "AD_APPROVED":
      return relatedId ? `/ads/${relatedId}` : "/dashboard/ads";
    case "AD_REJECTED":
    case "AD_EXPIRED":
      return "/dashboard/ads";
    case "AD_PERMANENTLY_DELETED":
      return "/ads/new";
    case "NEW_COMMENT":
      return relatedId ? `/ads/${relatedId}` : null;
    case "NEW_MESSAGE":
      return relatedId ? `/dashboard/messages?c=${relatedId}` : "/dashboard/messages";
    case "REVIEW_REPLY":
    case "REVIEW_APPROVED":
    case "REVIEW_REJECTED":
      return "/dashboard";
    case "COMMISSION_RECEIPT_APPROVED":
    case "COMMISSION_RECEIPT_REJECTED":
    case "COMMISSION_DUE":
      return "/dashboard/commission";
    default:
      return null;
  }
}
