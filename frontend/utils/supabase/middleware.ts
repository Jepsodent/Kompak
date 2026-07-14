import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // 1. Update the incoming request cookies
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value, options),
          );

          // 2. Refresh the response instance to capture request modifications
          supabaseResponse = NextResponse.next({ request });

          // 3. Update the outgoing response cookies
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const currentPath = request.nextUrl.pathname;

  // Route Guard 1: Unauthenticated users trying to access protected pages
  if (!user && currentPath.startsWith("/dashboard")) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/auth/quick-login";
    return NextResponse.redirect(loginUrl);
  }

  // Route Guard 2: Authenticated users trying to access entry forms
  const publicAuthPages = [
    "/auth/login",
    "/auth/register",
    "/auth/quick-login",
  ];
  if (user && publicAuthPages.includes(currentPath)) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  return supabaseResponse;
}
