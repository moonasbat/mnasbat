import Link from "next/link";

const links = [
  { href: "/pages/terms", label: "اتفاقية الاستخدام" },
  { href: "/pages/privacy", label: "سياسة الخصوصية" },
  { href: "/pages/commission-policy", label: "سياسة العمولة" },
  { href: "/pages/content-policy", label: "المحتوى الممنوع" },
  { href: "/pages/review-policy", label: "سياسة التقييم" },
  { href: "/help", label: "مركز المساعدة" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center text-sm text-gray-500 mb-4">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-[#6D28D9] transition-colors">
              {l.label}
            </Link>
          ))}
        </div>
        <p className="text-center text-xs text-gray-400">
          مناسبات منصة إعلانات وتواصل، وليست طرفاً في الصفقات. جميع الحقوق محفوظة.
        </p>
      </div>
    </footer>
  );
}
