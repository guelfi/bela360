import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = new Set(['/', '/login', '/profissional']);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.has(pathname) || pathname.startsWith('/onboarding') || pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('accessToken');
  if (!token) {
    const loginPath = pathname.startsWith('/profissional') ? '/profissional' : '/login';
    const url = request.nextUrl.clone();
    url.pathname = loginPath;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images).*)'],
};
