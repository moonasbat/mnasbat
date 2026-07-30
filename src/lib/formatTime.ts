// كل التواريخ ميلادية دائماً — locale "ar-SA" الافتراضي يعرض التقويم الهجري، لذا نفرض gregory صراحة
const GREGORIAN_LOCALE = "ar-SA-u-ca-gregory";

export function formatGregorianDate(date: string | Date) {
  return new Date(date).toLocaleDateString(GREGORIAN_LOCALE, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatGregorianDateTime(date: string | Date) {
  return new Date(date).toLocaleString(GREGORIAN_LOCALE, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// "منذ 23 دقيقة" / "منذ 6 ساعات" / "منذ 3 أيام" ثم يتحول لتاريخ كامل بعد شهر
export function formatRelativeTime(date: string | Date) {
  const d = new Date(date);
  const now = Date.now();
  const diffSec = Math.max(0, Math.floor((now - d.getTime()) / 1000));

  if (diffSec < 60) return "الآن";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `منذ ${diffMin} ${diffMin === 1 ? "دقيقة" : diffMin === 2 ? "دقيقتين" : diffMin <= 10 ? "دقائق" : "دقيقة"}`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `منذ ${diffHour} ${diffHour === 1 ? "ساعة" : diffHour === 2 ? "ساعتين" : diffHour <= 10 ? "ساعات" : "ساعة"}`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `منذ ${diffDay} ${diffDay === 1 ? "يوم" : diffDay === 2 ? "يومين" : diffDay <= 10 ? "أيام" : "يوماً"}`;

  return formatGregorianDate(d);
}
