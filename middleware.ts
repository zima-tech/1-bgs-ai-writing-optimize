import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { AUTH_COOKIE } from '@/lib/auth-config';

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

  const hasSessionCookie = Boolean(request.cookies.get(AUTH_COOKIE)?.value?.trim());

  if (!hasSessionCookie && isLoginPath) {
    return NextResponse.next();
  }

  if (!hasSessionCookie && pathname.startsWith('/api')) {
    return NextResponse.json({ message: '未登录，无法执行该操作。' }, { status: 401 });
  }

  if (!hasSessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isLoginPath) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!.*\\.).*)']
};
