import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_ROUTES  = ['/admin', '/control-panel'];
const MEMBER_ROUTES = ['/member', '/connect/dashboard', '/discipleship/dashboard', '/notifications'];

// These pages ARE under /member but must never be gated
const PUBLIC_MEMBER_PAGES = ['/member/login', '/member/onboarding'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_MEMBER_PAGES.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  const isAdminRoute  = ADMIN_ROUTES.some(p  => pathname.startsWith(p));
  const isMemberRoute = MEMBER_ROUTES.some(p => pathname.startsWith(p));

  if (!isAdminRoute && !isMemberRoute) return NextResponse.next();

  // AuthContext sets this cookie on every auth-state change (login/logout/refresh).
  // It is a lightweight sentinel — it does not carry token data.
  const hasSession = !!request.cookies.get('sb-session');

  if (hasSession) return NextResponse.next();

  const loginPage = isAdminRoute ? '/auth/login' : '/member/login';
  const url = new URL(loginPage, request.url);
  url.searchParams.set('redirectTo', pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/control-panel/:path*',
    '/member/:path*',
    '/connect/dashboard/:path*',
    '/discipleship/dashboard/:path*',
    '/notifications/:path*',
  ],
};
