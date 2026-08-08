import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
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
