"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AUTH_CONTENT } from "@/lib/content";

const items = [
  { href: "/dashboard/ads", label: AUTH_CONTENT.navMyAds },
  { href: "/favorites", label: AUTH_CONTENT.navFavorites },
  { href: "/dashboard/messages", label: AUTH_CONTENT.navMessages },
  { href: "/dashboard/notifications", label: AUTH_CONTENT.navNotifications },
  { href: "/dashboard/commission", label: AUTH_CONTENT.navCommission },
  { href: "/dashboard/settings", label: AUTH_CONTENT.navSettings },
];

export default function DashboardNav() {
  const pathname = usePathname();
  return (
    <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
      {items.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
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
