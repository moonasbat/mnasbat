// وصف حقول الإعدادات ومجموعاتها — مصدر واحد يُستخدم في نموذج الإعدادات (مقسّم لتبويبات) وفي
// تحويل سجل التدقيق لصياغة عربية مفهومة
export const SETTINGS_GROUPS: { title: string; fields: [string, string, string][] }[] = [
  {
    title: "عام",
    fields: [
      ["platform_name", "اسم المنصة", "يظهر في شعار الموقع وعنوان الصفحات"],
    ],
  },
  {
    title: "شريط إعلان الموقع",
    fields: [
      ["announcement_text", "نص الشريط", "يظهر أعلى كل صفحات الموقع عند تفعيل «شريط الإعلان» بتبويب التواصل"],
      ["announcement_link", "رابط عند الضغط (اختياري)", ""],
    ],
  },
  {
    title: "واتساب الدعم ووضع الصيانة",
    fields: [
      ["whatsapp_support_number", "رقم واتساب الدعم", "بصيغة +9665xxxxxxxx"],
      ["maintenance_message", "رسالة وضع الصيانة", ""],
    ],
  },
  {
    title: "العمولة",
    fields: [
      ["commission_rate", "نسبة العمولة", "النسبة % التي تُحسب من قيمة كل صفقة يُبلَّغ عنها"],
      ["commission_min", "الحد الأدنى للعمولة", "أقل مبلغ عمولة يُطلب من المعلن (اتركه 0 لعدم وجود حد أدنى)"],
      ["commission_max", "الحد الأقصى للعمولة", "أعلى مبلغ عمولة يُطلب من المعلن (اتركه 0 لعدم وجود حد أقصى)"],
      ["commission_exempt_until", "إعفاء مؤقت حتى تاريخ (YYYY-MM-DD)", "أثناء الإعفاء يظهر للمستخدمين أنهم معفون من العمولة حتى هذا التاريخ. اتركه فارغاً لعدم وجود إعفاء"],
    ],
  },
  {
    title: "الحساب البنكي لاستقبال العمولات",
    fields: [
      ["bank_name", "اسم البنك", "يظهر للمستخدم في صفحة دفع العمولة"],
      ["bank_account_name", "اسم صاحب الحساب", "يظهر للمستخدم عند التحويل"],
      ["bank_iban", "رقم الآيبان IBAN", "الرقم الذي يحوّل عليه المستخدمون العمولة"],
    ],
  },
  {
    title: "الإعلانات",
    fields: [
      ["max_images_per_ad", "الحد الأقصى للصور", "عدد الصور المسموح لكل إعلان (لا يزيد عن 10 حسب سياسة المنصة)"],
      ["ad_duration_days", "مدة نشر الإعلان (يوماً)", "بعد هذه المدة يتحول الإعلان إلى «منتهٍ» تلقائياً"],
      ["ad_renewal_duration_days", "مدة التجديد (يوماً)", "عدد الأيام التي يُضاف نشر الإعلان لها عند تجديده — اتركه فارغاً ليستخدم نفس مدة النشر أعلاه"],
      ["ad_renewal_cooldown_days", "عدد الأيام قبل السماح بالتجديد", "أقل فترة بين تجديد وآخر — يُرسَل للمعلن إشعار مباشر بمجرد انتهاء هذه الفترة يخبره إنه يقدر يجدد الآن"],
      ["ad_deletion_grace_days", "مهلة الحذف النهائي (يوماً)", "عدد الأيام بعد انتهاء الإعلان (ولم يُجدَّد) قبل حذفه نهائياً من قاعدة البيانات"],
    ],
  },
  {
    title: "شارة الأكثر مشاهدة",
    fields: [
      ["trending_views_threshold", "حد المشاهدات لشارة الأكثر مشاهدة", ""],
    ],
  },
  {
    title: "الإحالة",
    fields: [
      ["referral_prize_1", "جائزة المركز الأول (ر.س)", "تُدفع يدوياً من قِبلك لأفضل داعٍ كل شهر"],
      ["referral_prize_2", "جائزة المركز الثاني (ر.س)", ""],
      ["referral_prize_3", "جائزة المركز الثالث (ر.س)", ""],
    ],
  },
  {
    title: "حدود الاستخدام (لمنع الإساءة)",
    fields: [
      ["rate_limit_ads_per_day", "إعلانات لكل مستخدم/يوم", ""],
      ["rate_limit_messages_per_hour", "رسائل لكل مستخدم/ساعة", ""],
      ["rate_limit_comments_per_hour", "تعليقات لكل مستخدم/ساعة", ""],
      ["rate_limit_reports_per_day", "بلاغات لكل مستخدم/يوم", ""],
    ],
  },
];

export const FLAG_GROUPS: { title: string; keys: string[] }[] = [
  { title: "تسجيل الدخول", keys: ["google_login_enabled"] },
  { title: "عام إضافي", keys: ["announcement_bar_enabled", "floating_whatsapp_enabled", "maintenance_mode_enabled", "contact_form_enabled"] },
  { title: "التواصل والتفاعل", keys: ["comments_enabled", "messages_enabled", "whatsapp_enabled", "favorites_enabled", "reviews_enabled", "reviews_manual_moderation_enabled"] },
  { title: "الإعلانات والمزايا", keys: ["manual_review_enabled", "featured_ads_enabled", "ad_renewal_enabled", "watermark_enabled", "trending_badge_enabled", "city_filter_enabled", "view_stats_enabled", "verification_enabled"] },
  { title: "العمولة", keys: ["commission_perks_enabled", "commission_tab_enabled"] },
  { title: "الإحالة", keys: ["referral_program_enabled", "vacation_mode_enabled"] },
];

// تبويبات لوحة الإعدادات — كل تبويب يجمع مجموعات إعدادات + مجموعات خيارات ذات علاقة ببعض
// (بدل صفحة واحدة طويلة فيها كل الإعدادات مبعثرة) — راجع AdminSettingsForm.tsx
export const ADMIN_SETTINGS_TABS: { id: string; title: string; settingsGroupTitles: string[]; flagGroupTitles: string[] }[] = [
  { id: "general", title: "عام", settingsGroupTitles: ["عام", "شريط إعلان الموقع", "واتساب الدعم ووضع الصيانة"], flagGroupTitles: ["تسجيل الدخول", "عام إضافي"] },
  { id: "ads", title: "الإعلانات", settingsGroupTitles: ["الإعلانات", "شارة الأكثر مشاهدة"], flagGroupTitles: ["الإعلانات والمزايا"] },
  { id: "commission", title: "العمولة", settingsGroupTitles: ["العمولة", "الحساب البنكي لاستقبال العمولات"], flagGroupTitles: ["العمولة"] },
  { id: "engagement", title: "التواصل والتفاعل", settingsGroupTitles: [], flagGroupTitles: ["التواصل والتفاعل"] },
  { id: "limits", title: "حدود الاستخدام", settingsGroupTitles: ["حدود الاستخدام (لمنع الإساءة)"], flagGroupTitles: [] },
  { id: "referral", title: "الإحالة", settingsGroupTitles: ["الإحالة"], flagGroupTitles: ["الإحالة"] },
];

export const FLAG_DESCRIPTIONS: Record<string, string> = {
  google_login_enabled: "السماح بتسجيل الدخول عبر حساب Google — هذه هي وسيلة تسجيل الدخول الوحيدة المتاحة حالياً، تعطيلها يوقف تسجيل الدخول بالكامل",
  comments_enabled: "إظهار قسم التعليقات تحت كل إعلان (على مستوى الموقع بالكامل، بالإضافة إلى خيار كل إعلان على حدة)",
  messages_enabled: "السماح بإرسال رسائل داخلية بين المستخدمين (على مستوى الموقع بالكامل، بالإضافة إلى خيار كل إعلان على حدة)",
  whatsapp_enabled: "إظهار زر التواصل عبر واتساب في صفحة الإعلان",
  favorites_enabled: "السماح بإضافة الإعلانات للمفضلة",
  reviews_enabled: "السماح بتقييم مقدمي الخدمات",
  reviews_manual_moderation_enabled: "كل تقييم جديد ينتظر موافقتك قبل ما يظهر للعامة (موصى به). إيقافه ينشر التقييمات فوراً بدون مراجعة",
  manual_review_enabled: "كل إعلان جديد ينتظر موافقتك قبل ما يظهر للعامة (موصى به). إيقافه يعني نشر الإعلانات فوراً بدون مراجعة",
  featured_ads_enabled: "تفعيل قسم «الإعلانات المميزة» في الصفحة الرئيسية",
  commission_perks_enabled: "منح مزايا (شارة، أولوية ظهور) للمستخدمين بعد اعتماد دفع العمولة",
  ad_renewal_enabled: "السماح للمستخدم بتجديد إعلانه بعد انتهائه",
  watermark_enabled: "طبع شعار مناسبات تلقائياً على كل صورة إعلان تُرفع",
  commission_tab_enabled: "إظهار تبويب العمولة، صفحة سياسة العمولة، وخطوة إقرار الالتزام بالعمولة عند نشر إعلان — تعطيله يخفي الثلاثة معاً",
  verification_enabled: "تفعيل نظام توثيق الحسابات (شارة موثّق)",
  city_filter_enabled: "إظهار فلتر المدينة في صفحة البحث",
  view_stats_enabled: "عرض عدد المشاهدات على الإعلانات للمعلنين",
  announcement_bar_enabled: "شريط بنفسجي أعلى كل صفحات الموقع لعرض تنبيه أو عرض خاص — النص والرابط بتبويب عام",
  floating_whatsapp_enabled: "زر عائم يظهر في كل صفحات الموقع للتواصل السريع مع رقم الدعم بتبويب عام",
  maintenance_mode_enabled: "يمنع كل الزوار غير الموظفين عن الموقع ويعرض رسالة الصيانة بتبويب عام",
  contact_form_enabled: "تفعيل صفحة «تواصل معنا» — أي رسالة تصلك كإشعار مباشر في لوحة التحكم",
  trending_badge_enabled: "شارة تلقائية على أي إعلان يتجاوز حد المشاهدات بتبويب الإعلانات",
  referral_program_enabled: "كل مستخدم يحصل على رابط دعوة خاص به — تُحسب له كل دعوة تكمّل تسجيلها، وأفضل ٣ داعين كل شهر يفوزون بجوائز نقدية (تُضبط قيمتها بالحقول أعلاه)",
  vacation_mode_enabled: "يظهر في إعدادات كل مستخدم — يوقف كل إعلاناته مؤقتاً بضغطة واحدة",
};

export const SETTING_LABELS: Record<string, string> = Object.fromEntries(
  SETTINGS_GROUPS.flatMap((g) => g.fields.map(([key, label]) => [key, label]))
);
