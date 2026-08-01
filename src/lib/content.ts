// محتوى النصوص العربية الجاهزة للمنصة — مستخرج حرفياً من وثيقة المواصفات (الأقسام 91-110)
// لا Lorem Ipsum ولا Placeholder — كل نص هنا قابل للعرض المباشر في الإنتاج.

export const HOME_CONTENT = {
  title: "كل ما يخص مناسبتك… في مكان واحد",
  description: "اكتشف منتجات وخدمات وإعلانات مرتبطة بالمناسبات، أو أنشئ إعلانك ووصل إلى المهتمين.",
  searchPlaceholder: "ابحث عن منتج، خدمة أو ما تحتاجه…",
  searchButton: "بحث",
  addAdButton: "أضف إعلان",
  browseAds: "تصفح الإعلانات",
  latestAds: "أحدث الإعلانات",
  featuredAds: "إعلانات مميزة",
  ctaTitle: "عندك منتج أو خدمة أو طلب؟",
  ctaBody: "أنشئ إعلانك في دقائق ودع المهتمين يصلون إليك.",
  ctaButton: "أضف إعلانك الآن",
  contactCtaTitle: "تواصل مباشرة مع المعلن",
  contactCtaBody: "ابدأ المحادثة من داخل مناسبات أو تواصل عبر واتساب برسالة توضح أن وصولك كان من خلال إعلان مناسبات.",
};

export const USERNAME_RULES = {
  minLength: 4,
  maxLength: 15,
  pattern: /^[A-Za-z0-9_]{4,15}$/,
};

export const ONBOARDING_CONTENT = {
  title: "اختر اسم المستخدم الخاص بك",
  body: "اسم المستخدم يظهر في ملفك الشخصي وإعلاناتك، ولا يمكن تغييره لاحقاً بسهولة. اختره بعناية.",
  label: "اسم المستخدم",
  placeholder: "مثال: ahmad_events",
  hint: "من 4 إلى 15 حرفاً — إنجليزي وأرقام وشرطة سفلية (_) فقط، بدون مسافات.",
  submit: "متابعة",
  checking: "جارٍ التحقق…",
  errors: {
    required: "يرجى كتابة اسم المستخدم.",
    invalid: "اسم المستخدم يجب أن يكون بين 4 و15 حرفاً، إنجليزي وأرقام و_ فقط.",
    taken: "اسم المستخدم هذا مستخدم بالفعل. جرّب اسماً آخر.",
  },
};

export const AUTH_CONTENT = {
  welcomeTitle: "مرحباً بك في مناسبات",
  welcomeBody: "سجّل دخولك للوصول إلى إعلاناتك ومفضلاتك ورسائلك.",
  googleButton: "المتابعة باستخدام Google",
  loading: "جارٍ تسجيل الدخول…",
  loginFailed: "تعذر تسجيل الدخول. حاول مرة أخرى.",
  navMyAds: "إعلاناتي",
  navFavorites: "المفضلة",
  navMessages: "الرسائل",
  navNotifications: "الإشعارات",
  navCommission: "العمولة",
  navSettings: "الإعدادات",
  savedSuccess: "تم حفظ التغييرات بنجاح.",
  logout: "تسجيل الخروج",
};

export const NEW_AD_CONTENT = {
  pageTitle: "أضف إعلانك",
  pageSubtitle: "اكتب تفاصيل واضحة، أضف صوراً مناسبة، ثم راجع إعلانك قبل النشر.",
  titleLabel: "عنوان الإعلان",
  titlePlaceholder: "اكتب عنواناً واضحاً ومختصراً",
  descriptionLabel: "وصف الإعلان",
  descriptionPlaceholder: "اكتب تفاصيل المنتج أو الخدمة أو طلبك…",
  categoryLabel: "التصنيف",
  categoryPlaceholder: "اختر التصنيف",
  cityLabel: "المدينة",
  cityPlaceholder: "اختر المدينة",
  priceLabel: "السعر",
  pricePlaceholder: "أدخل السعر إذا كان مناسباً لإعلانك",
  imagesLabel: "الصور",
  addImages: "أضف صوراً",
  dragImages: "اسحب الصور هنا أو اخترها من جهازك",
  maxImages: "الحد الأقصى 10 صور",
  whatsappLabel: "رقم واتساب",
  whatsappPlaceholder: "أدخل رقم واتساب للتواصل",
  allowMessages: "السماح بالرسائل الخاصة",
  allowComments: "السماح بالتعليقات",
  saveDraft: "حفظ كمسودة",
  preview: "معاينة الإعلان",
  continue: "متابعة",
  videoNotice: "يمكنك إضافة 10 صور كحد أقصى. إضافة الفيديو غير متاحة.",
  errors: {
    titleRequired: "يرجى كتابة عنوان الإعلان.",
    descriptionRequired: "يرجى كتابة وصف الإعلان.",
    categoryRequired: "يرجى اختيار التصنيف.",
    priceInvalid: "السعر غير صالح.",
    whatsappInvalid: "رقم واتساب غير صالح.",
    maxImages: "يمكنك إضافة 10 صور كحد أقصى.",
    videoNotAllowed: "الفيديو غير مسموح في الإعلانات.",
    imageNotSupported: "الصورة غير مدعومة.",
    uploadFailed: "تعذر رفع الصورة. حاول مرة أخرى.",
    processingFailed: "تعذر تجهيز الصورة للنشر. لم يتم نشر الإعلان.",
  },
};

export const COMMISSION_DECLARATION_TEXT = [
  "أقر أنا صاحب هذا الإعلان بأنني ملتزم بدفع العمولة المستحقة لمنصة مناسبات عن أي صفقة تتم بسبب هذا الإعلان المنشور في مناسبات، سواء تمت الصفقة أو الاتفاق داخل منصة مناسبات أو خارجها، وذلك وفق نسبة العمولة وسياسة العمولة المعتمدة في المنصة وقت استحقاقها.",
  "أقر بأن انتقال التواصل إلى واتساب أو الهاتف أو أي وسيلة خارجية لا يلغي الالتزام بالعمولة متى كانت الصفقة قد تمت بسبب الإعلان المنشور في مناسبات.",
  "أقر بأن البيانات التي أقدمها عن الصفقة، عند طلبها، صحيحة ودقيقة، وأنني أتحمل مسؤولية الالتزام بسياسة العمولة المعتمدة.",
];

export const COMMISSION_DECLARATION_CONTENT = {
  checkboxLabel: "أوافق على إقرار الالتزام بالعمولة وأتعهد بالالتزام بسياسة العمولة.",
  checkboxLabel2: "قرأت وفهمت أن العمولة قد تستحق حتى إذا تمت الصفقة خارج منصة مناسبات بسبب الإعلان.",
  submitButton: "أوافق وأنشر الإعلان",
  requiredError: "يجب الموافقة على إقرار الالتزام بالعمولة حتى تتمكن من نشر الإعلان.",
};

export const AD_PAGE_CONTENT = {
  contactSeller: "تواصل مع المعلن",
  sendMessage: "إرسال رسالة",
  contactWhatsapp: "تواصل عبر واتساب",
  addFavorite: "إضافة للمفضلة",
  removeFavorite: "إزالة من المفضلة",
  share: "شارك الإعلان",
  copyLink: "نسخ الرابط",
  reportAd: "الإبلاغ عن الإعلان",
  noLongerAvailable: "الإعلان لم يعد متاحاً.",
};

export function contactMessageTemplate(adUrl: string) {
  return `السلام عليكم، اتواصل معك بخصوص إعلانك عبر منصة مناسبات، وأرغب بالاستفسار عن تفاصيل الإعلان: ${adUrl}`;
}

export const MESSAGES_CONTENT = {
  title: "الرسائل",
  empty: "لا توجد رسائل حتى الآن.",
  emptyBody: "عندما يتواصل معك أحد المهتمين بإعلانك ستظهر المحادثة هنا.",
  placeholder: "اكتب رسالتك…",
  send: "إرسال",
  linkedAd: (title: string) => `هذه المحادثة مرتبطة بإعلان: ${title}`,
  startedFromAd: "بدأت هذه المحادثة من إعلانك على مناسبات.",
  blockUser: "حظر المستخدم",
  unblockUser: "إلغاء الحظر",
  reportMessage: "الإبلاغ عن الرسالة",
};

export const COMMENTS_CONTENT = {
  title: "التعليقات",
  placeholder: "اكتب تعليقك…",
  submit: "إرسال التعليق",
  empty: "لا توجد تعليقات حتى الآن.",
  posted: "تم نشر تعليقك.",
  delete: "حذف التعليق",
  report: "الإبلاغ عن التعليق",
};

export const SEARCH_CONTENT = {
  resultsTitle: "نتائج البحث",
  sortLatest: "الأحدث",
  sortRelevant: "الأكثر صلة",
  sortFeatured: "الأبرز",
  allCategories: "كل التصنيفات",
  allCities: "كل المدن",
  clearFilters: "مسح الفلاتر",
  apply: "تطبيق",
  noResults: "لا توجد نتائج مطابقة.",
  noResultsBody: "جرّب كلمة بحث مختلفة أو غيّر الفلاتر.",
  noFavorites: "لم تضف أي إعلان إلى المفضلة بعد.",
  noFavoritesBody: "احفظ الإعلانات التي تريد الرجوع إليها لاحقاً.",
};

export const AD_STATUS_LABELS: Record<string, string> = {
  published: "منشور",
  draft: "مسودة",
  pending_review: "قيد المراجعة",
  paused: "موقوف",
  expired: "منتهٍ",
  rejected: "مرفوض",
  archived: "مؤرشف",
  removed: "محذوف",
};

export const MY_ADS_CONTENT = {
  edit: "تعديل",
  pause: "إيقاف الإعلان",
  resume: "إعادة تفعيل الإعلان",
  renew: "تجديد الإعلان",
  delete: "حذف الإعلان",
};

export const REPORT_REASONS = [
  "محتوى مخالف",
  "احتيال أو تضليل",
  "انتحال شخصية",
  "انتهاك حقوق ملكية فكرية",
  "محتوى غير لائق",
  "إعلان مكرر أو مزعج",
  "مشكلة في التواصل",
  "سبب آخر",
];

export const REPORTS_CONTENT = {
  title: "الإبلاغ",
  detailsPlaceholder: "اشرح المشكلة باختصار…",
  submit: "إرسال البلاغ",
  received: "تم استلام البلاغ. سنراجعه وفق سياسة مناسبات.",
  blockUser: "حظر المستخدم",
  confirmBlock: "هل تريد حظر هذا المستخدم؟",
  blocked: "تم حظر المستخدم.",
  unblocked: "تم إلغاء حظر المستخدم.",
};

export const SAFETY_TIPS = [
  "تحقق من هوية الطرف الآخر قبل التحويل أو التسليم.",
  "لا تشارك رموز التحقق أو كلمات المرور.",
  "لا تحول مبالغ إلى جهة غير متأكد منها.",
  "افحص المنتج أو تحقق من تفاصيل الخدمة قبل إتمام الاتفاق.",
  "احذر من الروابط غير المعروفة.",
  "إذا شككت في عملية احتيال، أبلغ مناسبات والجهات المختصة عبر القنوات الرسمية المناسبة.",
  "مناسبات ليست طرفاً في الصفقة ولا تضمن نتيجتها.",
];

export const GENERIC_CONTENT = {
  loading: "جارٍ التحميل…",
  saving: "جارٍ الحفظ…",
  processing: "جارٍ تنفيذ العملية…",
  success: "تمت العملية بنجاح.",
  unexpectedError: "حدث خطأ غير متوقع. حاول مرة أخرى.",
  connectionError: "تعذر الاتصال بالخدمة. تحقق من اتصالك وحاول مرة أخرى.",
  forbidden: "لا تملك صلاحية لتنفيذ هذا الإجراء.",
  notFound: "الصفحة غير موجودة.",
  rateLimited: "أرسلت طلبات كثيرة خلال وقت قصير. حاول لاحقاً.",
  noResults: "لا توجد نتائج مطابقة.",
  noMessages: "لا توجد رسائل حتى الآن.",
  noFavorites: "لم تضف أي إعلان إلى المفضلة بعد.",
  noComments: "لا توجد تعليقات حتى الآن.",
};

export const ADMIN_CONTENT = {
  dashboard: "لوحة التحكم",
  overview: "نظرة عامة",
  users: "المستخدمون",
  ads: "الإعلانات",
  comments: "التعليقات",
  messages: "الرسائل",
  reports: "البلاغات",
  reviews: "التقييمات",
  commissions: "العمولات",
  receipts: "إيصالات التحويل",
  features: "المزايا",
  categories: "التصنيفات",
  notifications: "الإشعارات",
  settings: "الإعدادات",
  permissions: "الصلاحيات",
  addons: "الإضافات",
  auditLog: "سجل التدقيق",
  approvePayment: "اعتماد الدفع",
  rejectPayment: "رفض الدفع",
  requestMoreInfo: "طلب معلومات إضافية",
  rejectionReasonRequired: "سبب الرفض مطلوب.",
  receiptApprovedGranted: "تم اعتماد الإيصال ومنح المزايا حسب السياسة.",
  receiptRejectedNotified: "تم رفض الإيصال وإرسال السبب للمعلن.",
  adStatusUpdated: "تم تحديث حالة الإعلان.",
  actionLogged: "تم تسجيل العملية في سجل التدقيق.",
  needsHigherPermission: "هذه العملية تحتاج صلاحية أعلى.",
};
