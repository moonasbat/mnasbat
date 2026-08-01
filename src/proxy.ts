import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PATHS = ["/dashboard", "/admin", "/ads/new"];
const ONBOARDING_EXEMPT = ["/onboarding", "/login", "/auth", "/api", "/help", "/pages"];
const MAINTENANCE_EXEMPT = ["/maintenance", "/login", "/auth", "/admin", "/api"];
const STAFF_ROLES = ["admin", "moderator", "super_admin"];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // وضع الصيانة — يمنع كل الزوار غير الموظفين عن الموقع، ويبقي وصول الإدارة والـAPI شغّالاً
  const isMaintenanceExempt = MAINTENANCE_EXEMPT.some((p) => path === p || path.startsWith(`${p}/`));
  if (!isMaintenanceExempt) {
    const { data: maintenanceFlag } = await supabase
      .from("feature_flags")
      .select("enabled")
      .eq("key", "maintenance_mode_enabled")
      .maybeSingle();
    if (maintenanceFlag?.enabled) {
      let isStaff = false;
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
        isStaff = !!profile && STAFF_ROLES.includes(profile.role);
      }
      if (!isStaff) {
        return NextResponse.redirect(new URL("/maintenance", request.url));
      }
    }
  }

  const isProtected = PROTECTED_PATHS.some((p) => path === p || path.startsWith(`${p}/`));

  const target = path + request.nextUrl.search;

  if (!user && isProtected) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", target);
    return NextResponse.redirect(loginUrl);
  }

  if (user) {
    const isExempt = ONBOARDING_EXEMPT.some((p) => path === p || path.startsWith(`${p}/`));
    if (!isExempt) {
      const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).maybeSingle();
      if (profile && !profile.username) {
        const onboardingUrl = new URL("/onboarding", request.url);
        onboardingUrl.searchParams.set("redirect", target);
        return NextResponse.redirect(onboardingUrl);
      }
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)"],
};
