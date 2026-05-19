import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ADMIN  = ['/admin'];
const PROTECTED_MEMBER = ['/member', '/connect/dashboard', '/discipleship/dashboard', '/notifications'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute  = PROTECTED_ADMIN.some(p  => pathname.startsWith(p));
  const isMemberRoute = PROTECTED_MEMBER.some(p => pathname.startsWith(p));

  if (!isAdminRoute && !isMemberRoute) return NextResponse.next();

  // Supabase stores the auth token in a cookie whose name includes the project ref.
  // We do a broad check: any cookie that contains the Supabase URL project ref.
  const projectRef = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '')
    .split('//')[1]
    ?.split('.')[0];

  const hasSession =
    !!request.cookies.get('sb-access-token') ||
    (projectRef ? !!request.cookies.get(`sb-${projectRef}-auth-token`) : false);

  if (!hasSession) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/member/:path*',
    '/connect/dashboard/:path*',
    '/discipleship/dashboard/:path*',
    '/notifications/:path*',
  ],
};
