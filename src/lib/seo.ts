// ثوابت السيو المشتركة — مصدر واحد لاسم الموقع والرابط الأساسي يُستخدم في كل generateMetadata والبيانات الهيكلية (JSON-LD)
export const SITE_NAME = "مناسبات";
export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://moonasbat.com";
export const SITE_DESCRIPTION = "سوق إعلانات متخصص بكل ما يخص المناسبات في السعودية — قاعات، تصوير، ضيافة، ديكور، وأكثر.";

export function absoluteUrl(path: string) {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
