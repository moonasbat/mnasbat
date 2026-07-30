import { UserRole } from "./types";

// RBAC — القسم 25 و107 من المواصفات
export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "المالك",
  admin: "مدير",
  moderator: "مشرف",
  finance: "مراجع مالي",
  support: "دعم",
  user: "مستخدم",
};

const ADMIN_ROLES: UserRole[] = ["super_admin", "admin", "moderator", "finance", "support"];

export function isStaff(role?: UserRole | null) {
  return !!role && ADMIN_ROLES.includes(role);
}

export function canModerateAds(role?: UserRole | null) {
  return role === "super_admin" || role === "admin" || role === "moderator";
}

export function canReviewCommissions(role?: UserRole | null) {
  return role === "super_admin" || role === "admin" || role === "finance";
}

export function canManageUsers(role?: UserRole | null) {
  return role === "super_admin" || role === "admin";
}

export function canManageSettings(role?: UserRole | null) {
  return role === "super_admin";
}

export function canManageEmployees(role?: UserRole | null) {
  return role === "super_admin";
}

export function canHandleReports(role?: UserRole | null) {
  return role === "super_admin" || role === "admin" || role === "moderator" || role === "support";
}
