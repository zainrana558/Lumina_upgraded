import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Enhanced Supabase middleware with token refresh and user data
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  
  // Create Supabase client with extended options
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse = NextResponse.next({ request });
            supabaseResponse.cookies.set(name, value, options as Record<string, unknown>);
          });
        },
      },
      auth: {
        // Auto refresh token before expiry
        autoRefreshToken: true,
        // Persist session in cookies
        persistSession: true,
        // Detect storage changes
        detectSessionInUrl: true,
      },
    }
  );

  // Get current user with optional refresh
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // If auth error, try to refresh the session
  let currentUser = user;
  if (authError && authError.name === "TokenRefreshError") {
    // Attempt session refresh
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
    if (!refreshError && refreshData.session) {
      currentUser = refreshData.user;
    }
  }

  // Get user profile data if logged in
  let userProfile = null;
  if (currentUser) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("account_id", currentUser.id)
      .limit(1)
      .maybeSingle();
    userProfile = profileData;
  }

  // Define route access rules
  const isAuthPage =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/signup");
  const isPublicPath =
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname.startsWith("/auth/callback") ||
    request.nextUrl.pathname.startsWith("/api/") ||
    request.nextUrl.pathname.startsWith("/embed/") ||
    request.nextUrl.pathname.startsWith("/browse") ||
    request.nextUrl.pathname.startsWith("/movies") ||
    request.nextUrl.pathname.startsWith("/tv") ||
    request.nextUrl.pathname.startsWith("/search");

  // Redirect unauthenticated users to login
  if (!currentUser && !isAuthPage && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  if (currentUser && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/profiles";
    return NextResponse.redirect(url);
  }

  // Add user info to headers for client-side access
  if (currentUser && supabaseResponse) {
    supabaseResponse.headers.set("x-user-id", currentUser.id);
    supabaseResponse.headers.set("x-user-email", currentUser.email || "");
    if (userProfile) {
      supabaseResponse.headers.set(
        "x-user-profile",
        JSON.stringify(userProfile)
      );
    }
  }

  return supabaseResponse;
}
