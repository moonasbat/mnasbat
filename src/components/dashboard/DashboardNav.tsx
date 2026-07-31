"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AUTH_CONTENT } from "@/lib/content";

const items = [
  { href: "/dashboard/ads", label: AUTH_CONTENT.navMyAds },
  { href: "/favorites", label: AUTH_CONTENT.navFavorites },
  { href: "/dashboard/messages", label: AUTH_CONTENT.navMessages },
  { href: "/dashboard/notifications", label: AUTH_CONTENT.navNotifications },
  { href: "/commission", label: AUTH_CONTENT.navCommission },
  { href: "/dashboard/settings", label: AUTH_CONTENT.navSettings },
];

export default function DashboardNav() {
  const pathname = usePathname();
  return (
    <nav
      style={{ top: "var(--header-h, 64px)" }}
      className="sticky z-10 w-full min-w-0 max-w-full py-2 bg-white/95 backdrop-blur-sm border-b border-gray-100 flex gap-1.5 overflow-x-auto whitespace-nowrap
        md:static md:z-auto md:w-auto md:py-0 md:bg-transparent md:border-0 md:flex-col md:gap-1 md:overflow-visible md:whitespace-normal"
    >
      {items.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`shrink-0 px-3 py-1.5 text-xs md:px-4 md:py-2.5 md:text-sm rounded-xl font-medium transition-colors ${
              active ? "bg-[#6D28D9] text-white" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
