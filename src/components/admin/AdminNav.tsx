"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRole } from "@/lib/types";
import { canManageUsers, canManageSettings, canManageEmployees, canReviewCommissions, canHandleReports, canModerateAds } from "@/lib/permissions";
import { ADMIN_CONTENT } from "@/lib/content";

export default function AdminNav({ role }: { role: UserRole }) {
  const pathname = usePathname();

  const items = [
    { href: "/admin", label: ADMIN_CONTENT.overview, show: true },
    { href: "/admin/users", label: ADMIN_CONTENT.users, show: canManageUsers(role) },
    { href: "/admin/ads", label: ADMIN_CONTENT.ads, show: canModerateAds(role) },
    { href: "/admin/reports", label: ADMIN_CONTENT.reports, show: canHandleReports(role) },
    { href: "/admin/reviews", label: ADMIN_CONTENT.reviews, show: canModerateAds(role) },
    { href: "/admin/commissions", label: ADMIN_CONTENT.commissions, show: canReviewCommissions(role) },
    { href: "/admin/categories", label: ADMIN_CONTENT.categories, show: role === "super_admin" },
    { href: "/admin/notifications", label: ADMIN_CONTENT.notifications, show: canManageUsers(role) },
    { href: "/admin/settings", label: ADMIN_CONTENT.settings, show: canManageSettings(role) },
    { href: "/admin/employees", label: ADMIN_CONTENT.permissions, show: canManageEmployees(role) },
    { href: "/admin/audit-log", label: ADMIN_CONTENT.auditLog, show: role === "super_admin" || role === "admin" },
  ];

  return (
    <aside className="w-56 shrink-0 bg-white border-l border-gray-100 min-h-screen p-4 hidden md:block">
      <Link href="/" className="text-xl font-bold text-[#6D28D9] block mb-6">مناسبات</Link>
      <nav className="space-y-1">
        {items.filter((i) => i.show).map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-xl text-sm font-medium transition-colors ${active ? "bg-[#6D28D9] text-white" : "text-gray-600 hover:bg-gray-50"}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
