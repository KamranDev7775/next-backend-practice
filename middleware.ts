import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/uploads/')) {
    const filename = request.nextUrl.pathname.replace('/uploads/', '');
    return NextResponse.rewrite(new URL(`/api/uploads/${filename}`, request.url));
  }
}

export const config = {
  matcher: '/uploads/:path*'
};