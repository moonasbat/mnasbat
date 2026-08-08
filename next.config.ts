import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // يمنع تضمين الموقع داخل iframe بموقع ثاني (حماية من هجمات Clickjacking)
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // يمنع المتصفح من "تخمين" نوع الملف الحقيقي خلاف ما يعلنه السيرفر (يقلل مخاطر بعض هجمات XSS)
          { key: "X-Content-Type-Options", value: "nosniff" },
          // يقلل تسريب رابط الصفحة الكامل (قد يحتوي بيانات حساسة بالمعامل) لمواقع خارجية عند الضغط على رابط خارجي
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // يعطّل صلاحيات متصفح غير مستخدمة بالموقع (كاميرا، مايك، موقع جغرافي) كطبقة حماية إضافية
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  async redirects() {
    // صفحات السياسات المنفصلة القديمة صارت مجمّعة بصفحة واحدة — أي رابط قديم يوديك لها مباشرة
    const legacyPolicySlugs = ["privacy", "content-policy", "comments-policy", "review-policy", "safety", "commission-policy"];
    return legacyPolicySlugs.map((slug) => ({
      source: `/pages/${slug}`,
      destination: "/pages/policies",
      permanent: true,
    }));
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      { protocol: "https", hostname: "loremflickr.com" },
    ],
  },
};

export default nextConfig;
