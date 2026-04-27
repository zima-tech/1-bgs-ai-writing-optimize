import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { AUTH_COOKIE } from '@/lib/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginPath = pathname === '/login';
  const isPublicAsset =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/api/auth/login');

  if (isPublicAsset) {
    return NextResponse.next();
  }

  const isAuthenticated = request.cookies.get(AUTH_COOKIE)?.value === 'admin';

  if (!isAuthenticated && isLoginPath) {
    return NextResponse.next();
  }

  if (!isAuthenticated && pathname.startsWith('/api')) {
    return NextResponse.json({ message: '未登录，无法执行该操作。' }, { status: 401 });
  }

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthenticated && isLoginPath) {
    return NextResponse.redirect(new URL('/writing', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!.*\\.).*)']
};
