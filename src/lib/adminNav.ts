import {
  LayoutDashboard,
  Megaphone,
  LayoutGrid,
  Star,
  Users,
  Flag,
  DollarSign,
  Settings2,
  Puzzle,
  Bell,
  ShieldCheck,
  ScrollText,
  MessageSquare,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { UserRole } from "@/lib/types";
import {
  canManageUsers,
  canManageSettings,
  canManageEmployees,
  canReviewCommissions,
  canHandleReports,
  canModerateAds,
} from "@/lib/permissions";
import { ADMIN_CONTENT } from "@/lib/content";

export type AdminNavItem = { href: string; label: string; icon: LucideIcon; show: (role?: UserRole | null) => boolean };
export type AdminNavGroup = { title: string; items: AdminNavItem[] };

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    title: "",
    items: [{ href: "/admin", label: ADMIN_CONTENT.overview, icon: LayoutDashboard, show: () => true }],
  },
  {
    title: "المحتوى",
    items: [
      { href: "/admin/ads", label: ADMIN_CONTENT.ads, icon: Megaphone, show: canModerateAds },
      { href: "/admin/categories", label: ADMIN_CONTENT.categories, icon: LayoutGrid, show: (r) => r === "super_admin" },
      { href: "/admin/reviews", label: ADMIN_CONTENT.reviews, icon: Star, show: canModerateAds },
      { href: "/admin/comments", label: ADMIN_CONTENT.comments, icon: MessageSquare, show: canModerateAds },
    ],
  },
  {
    title: "المجتمع",
    items: [
      { href: "/admin/users", label: ADMIN_CONTENT.users, icon: Users, show: canManageUsers },
      { href: "/admin/reports", label: ADMIN_CONTENT.reports, icon: Flag, show: canHandleReports },
    ],
  },
  {
    title: "المالية",
    items: [
      { href: "/admin/commissions", label: ADMIN_CONTENT.commissions, icon: DollarSign, show: canReviewCommissions },
      { href: "/admin/referrals", label: ADMIN_CONTENT.referrals, icon: Trophy, show: canReviewCommissions },
    ],
  },
  {
    title: "الإعدادات",
    items: [
      { href: "/admin/settings", label: ADMIN_CONTENT.settings, icon: Settings2, show: canManageSettings },
      { href: "/admin/addons", label: ADMIN_CONTENT.addons, icon: Puzzle, show: (r) => r === "super_admin" },
      { href: "/admin/notifications", label: ADMIN_CONTENT.notifications, icon: Bell, show: canManageUsers },
    ],
  },
  {
    title: "الإدارة",
    items: [
      { href: "/admin/employees", label: ADMIN_CONTENT.permissions, icon: ShieldCheck, show: canManageEmployees },
      { href: "/admin/audit-log", label: ADMIN_CONTENT.auditLog, icon: ScrollText, show: (r) => r === "super_admin" || r === "admin" },
    ],
  },
];
