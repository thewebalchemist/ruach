import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_ROUTES  = ['/admin', '/control-panel'];
const MEMBER_ROUTES = ['/member', '/connect/dashboard', '/discipleship/dashboard', '/notifications'];

// These are the login pages themselves — never redirect them
const LOGIN_PAGES = ['/member/login', '/member/onboarding'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Never intercept login/onboarding pages even though they start with /member
  if (LOGIN_PAGES.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  const isAdminRoute  = ADMIN_ROUTES.some(p  => pathname.startsWith(p));
  const isMemberRoute = MEMBER_ROUTES.some(p => pathname.startsWith(p));

  if (!isAdminRoute && !isMemberRoute) return NextResponse.next();

  const projectRef = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '')
    .split('//')[1]
    ?.split('.')[0];

  const hasSession =
    !!request.cookies.get('sb-access-token') ||
    (projectRef ? !!request.cookies.get(`sb-${projectRef}-auth-token`) : false);

  if (hasSession) return NextResponse.next();

  // Admin/control-panel → admin login
  if (isAdminRoute) {
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(url);
  }

  // Member routes → member login
  const url = new URL('/member/login', request.url);
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
