import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Each area gates on session presence only (role/permission checks happen
// page/API-side — see AUDIT_REPORT.md and the Batch 2/3 plan for why this
// stays coarse: per-module permission checks at the edge would mean a DB
// round trip on every navigation, and permissions can change mid-session).
const GATED_AREAS: { prefix: string; loginPage: string }[] = [
  { prefix: '/admin',         loginPage: '/auth/login' },
  { prefix: '/control-panel', loginPage: '/auth/login' },
  { prefix: '/member',        loginPage: '/member/login' },
  { prefix: '/notifications', loginPage: '/member/login' },
  { prefix: '/connect',       loginPage: '/connect' },
  { prefix: '/discipleship',  loginPage: '/discipleship' },
  { prefix: '/crosspoint',    loginPage: '/crosspoint' },
];

// Pages that live under a gated prefix but must never be gated themselves —
// typically the login/signup entry point for that area.
const PUBLIC_PAGES = [
  '/member/login',
  '/member/onboarding',
  '/connect',            // index.tsx is the Connect login/signup page
  '/connect/register',
  '/discipleship',       // index.tsx is the Discipleship login page
  '/crosspoint',         // index.tsx is the Crosspoint login page
];

function isPublicPage(pathname: string): boolean {
  return PUBLIC_PAGES.some(p => pathname === p || pathname.startsWith(p + '/'));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const area = GATED_AREAS.find(a => pathname === a.prefix || pathname.startsWith(a.prefix + '/'));
  if (!area) return NextResponse.next();
  if (isPublicPage(pathname)) return NextResponse.next();

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
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  // Validates the session against Supabase's auth server — unlike checking
  // for a cookie's presence, this can't be spoofed by setting a fake cookie.
  const { data: { user } } = await supabase.auth.getUser();

  if (user) return response;

  const url = new URL(area.loginPage, request.url);
  url.searchParams.set('redirectTo', pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/control-panel/:path*',
    '/member/:path*',
    '/connect/:path*',
    '/discipleship/:path*',
    '/crosspoint/:path*',
    '/notifications/:path*',
  ],
};
