import Link from "next/link";

const links = [
  { href: "/pages/terms", label: "شروط الاستخدام" },
  { href: "/pages/policies", label: "السياسات" },
  { href: "/pages/referrals", label: "برنامج الإحالة" },
  { href: "/help", label: "مركز المساعدة" },
  { href: "/contact", label: "تواصل معنا" },
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
          مناسبات — كل ما يخص مناسبتك في مكان واحد. © {new Date().getFullYear()} جميع الحقوق محفوظة.
        </p>
      </div>
    </footer>
  );
}
