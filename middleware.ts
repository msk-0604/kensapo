import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(self), microphone=(), geolocation=()",
  "X-DNS-Prefetch-Control": "off",
};

function applySecurityHeaders(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

function getSupabasePublicEnv():
  | { url: string; anonKey: string }
  | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export async function middleware(request: NextRequest) {
  const env = getSupabasePublicEnv();
  const pathname = request.nextUrl.pathname;

  if (!env) {
    if (pathname === "/setup") {
      return applySecurityHeaders(NextResponse.next({ request }));
    }
    const url = request.nextUrl.clone();
    url.pathname = "/setup";
    return applySecurityHeaders(NextResponse.redirect(url));
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: {
          name: string;
          value: string;
          options?: Record<string, unknown>;
        }[]
      ) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isApi = pathname.startsWith("/api");
  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/auth");

  if (isApi) {
    if (
      pathname.startsWith("/api/generate-report") &&
      request.method === "POST" &&
      !user
    ) {
      const denied = NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
      return applySecurityHeaders(denied);
    }
    return applySecurityHeaders(supabaseResponse);
  }

  if (!user && !isAuthPage && pathname !== "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return applySecurityHeaders(NextResponse.redirect(url));
  }

  if (user && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return applySecurityHeaders(NextResponse.redirect(url));
  }

  return applySecurityHeaders(supabaseResponse);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icon.png|apple-icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
