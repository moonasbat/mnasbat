import { createAdminClient } from "@/lib/supabase/admin";

// نسخة احتياطية تُستخدم فقط لو تعذّر الوصول لقاعدة البيانات أو حُذف قالب بالخطأ —
// المصدر الحقيقي دائماً جدول notification_templates القابل للتعديل من لوحة التحكم
const DEFAULTS: Record<string, { title: string; body: string }> = {
  AD_APPROVED: { title: "تم قبول إعلانك", body: 'تم قبول إعلانك "{ad_title}" ونشره على الموقع.' },
  AD_REJECTED: { title: "تم رفض إعلانك", body: 'تم رفض إعلانك "{ad_title}". السبب: {reason}' },
  AD_EXPIRING_SOON: { title: "إعلانك على وشك الانتهاء", body: 'متبقي {days} أيام على انتهاء إعلانك "{ad_title}". جدده الآن ليستمر ظهوره للمهتمين.' },
  AD_RENEWAL_AVAILABLE: { title: "يمكنك تجديد إعلانك الآن", body: 'أصبح بإمكانك تجديد إعلانك "{ad_title}" الآن ليظهر بأحدث ترتيب للمهتمين.' },
  AD_EXPIRED: { title: "انتهت مدة إعلانك", body: 'انتهت مدة عرض إعلانك "{ad_title}" وتوقف عن الظهور للزوار. عندك 30 يوماً إضافياً لتجديده وإلا سيُحذف نهائياً.' },
  AD_PERMANENTLY_DELETED: { title: "تم حذف إعلانك نهائياً", body: 'انتهت المهلة الإضافية ولم يُجدَّد إعلانك "{ad_title}"، فتم حذفه نهائياً من الموقع. يمكنك نشره من جديد في أي وقت.' },
  NEW_COMMENT: { title: "تعليق جديد", body: "لديك تعليق جديد على أحد إعلاناتك." },
  COMMENT_REPLY: { title: "رد جديد على تعليقك", body: "قام أحد المستخدمين بالرد على تعليقك." },
  NEW_MESSAGE_AD: { title: "رسالة جديدة", body: "لديك رسالة جديدة بخصوص أحد إعلاناتك." },
  NEW_MESSAGE_REPLY: { title: "رسالة جديدة", body: "لديك رسالة جديدة في إحدى محادثاتك." },
  REVIEW_REPLY: { title: "رد على تقييمك", body: "قام المستخدم الذي قيّمته بالرد على تقييمك." },
  REVIEW_APPROVED: { title: "تقييم جديد على ملفك", body: "تمت الموافقة على تقييم جديد وتم نشره على ملفك الشخصي." },
  REVIEW_REJECTED: { title: "تم رفض تقييم", body: "تم رفض أحد التقييمات المقدمة على ملفك الشخصي." },
  COMMISSION_RECEIPT_APPROVED: { title: "تم اعتماد إيصال العمولة", body: "تم اعتماد إيصال العمولة. شكراً لالتزامك." },
  COMMISSION_RECEIPT_REJECTED: { title: "تعذر اعتماد إيصال العمولة", body: "تعذر اعتماد إيصال العمولة: {reason}." },
  ACCOUNT_BANNED: { title: "تم إيقاف حسابك", body: "تم إيقاف حسابك. السبب: {reason}." },
  ACCOUNT_UNBANNED: { title: "تم إعادة تفعيل حسابك", body: "تمت إعادة تفعيل حسابك ويمكنك استخدام المنصة بشكل طبيعي." },
  REPORT_RESOLVED: { title: "تم معالجة بلاغك", body: "تم معالجة بلاغك: {resolution_note}" },
  REFERRAL_MONTHLY_WINNER: { title: "🏆 فزت بجائزة الإحالة!", body: "دعوت {count} شخص بآخر سباق وحصلت على المركز {rank}! جائزتك {prize} ر.س، بيتواصل معك فريق مناسبات لتسليمها." },
  FAVORITE_ADDED: { title: "أضاف أحدهم إعلانك للمفضلة", body: 'تمت إضافة إعلانك "{ad_title}" إلى قائمة مفضلة أحد المستخدمين.' },
  WELCOME: { title: "مرحباً بك في مناسبات 👋", body: "يسعدنا انضمامك! انشر إعلانك الأول الآن ووصّل لآلاف المهتمين بخدمات ومنتجات المناسبات." },
};

function interpolate(str: string, vars: Record<string, string | number>) {
  return str.replace(/\{(\w+)\}/g, (match, key) => (key in vars ? String(vars[key]) : match));
}

export async function renderNotification(
  key: keyof typeof DEFAULTS,
  vars: Record<string, string | number> = {}
): Promise<{ title: string; body: string }> {
  const admin = createAdminClient();
  const { data } = await admin.from("notification_templates").select("title, body").eq("key", key).maybeSingle();
  const template = data ?? DEFAULTS[key];
  return { title: interpolate(template.title, vars), body: interpolate(template.body, vars) };
}
