import { NextResponse } from 'next/server';

/**
 * Next.js Edge Auth & Role Middleware (Rule 25 & Spec 2.1)
 * Strict Server-Side Route Guard:
 * 1. Unauthenticated users -> Redirected to /login.
 * 2. Authenticated users on /login -> Redirected to /.
 * 3. Non-Admin (Staff) users accessing /users -> Blocked & redirected to / (Dashboard).
 */
export function middleware(request) {
  const token = request.cookies.get('careguide_token')?.value;
  const role = request.cookies.get('careguide_role')?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith('/login');
  const isPublicAsset =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('favicon.ico');

  if (isPublicAsset) {
    return NextResponse.next();
  }

  // 1. Unauthenticated users trying to access protected routes -> redirect to /login
  if (!token && !isAuthPage) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Already logged in users trying to access /login -> redirect to dashboard
  if (token && isAuthPage) {
    const dashboardUrl = new URL('/', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // 3. Care Guide BD Spec 2.1: Staff & non-admin users strictly prohibited from /users -> redirect to dashboard
  if (pathname.startsWith('/users')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (role !== 'Admin') {
      const dashboardUrl = new URL('/', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
