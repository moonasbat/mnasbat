// خدمة مصغّرة فقط لتفعيل إمكانية "التثبيت" على الجهاز — لا تخزّن أي طلبات
// (الموقع ديناميكي بالكامل ويعتمد على بيانات حيّة، فتخزين الصفحات مؤقتاً قد يعرض محتوى قديم أو بيانات مستخدم خاطئة)
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
