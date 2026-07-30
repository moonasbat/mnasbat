// كل التواريخ ميلادية دائماً وبأرقام إنجليزية — "ar-SA" الافتراضي يعرض التقويم الهجري والأرقام الهندية، نفرض gregory + أرقام لاتينية صراحة
const GREGORIAN_LOCALE = "ar-SA-u-ca-gregory-nu-latn";

// أرقام إنجليزية دائماً (أسعار، عدادات) مع فواصل الآلاف
export function formatNumber(n: number) {
  return n.toLocaleString("en-US");
}

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

function pluralize(n: number, singular: string, dual: string, plural: string, manyOrMore: string) {
  if (n === 1) return singular;
  if (n === 2) return dual;
  if (n <= 10) return `${n} ${plural}`;
  return `${n} ${manyOrMore}`;
}

// "منذ 23 دقيقة" / "منذ ساعتين" / "منذ 3 أيام" ثم يتحول لتاريخ كامل بعد شهر
export function formatRelativeTime(date: string | Date) {
  const d = new Date(date);
  const now = Date.now();
  const diffSec = Math.max(0, Math.floor((now - d.getTime()) / 1000));

  if (diffSec < 60) return "الآن";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `منذ ${pluralize(diffMin, "دقيقة", "دقيقتين", "دقائق", "دقيقة")}`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `منذ ${pluralize(diffHour, "ساعة", "ساعتين", "ساعات", "ساعة")}`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `منذ ${pluralize(diffDay, "يوم", "يومين", "أيام", "يوماً")}`;

  return formatGregorianDate(d);
}
