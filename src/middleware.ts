import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // For API routes related to file uploads, we should return early
  // to avoid interfering with the body parsing done in the route handler
  if (request.nextUrl.pathname.startsWith('/api/profile/upload')) {
    return NextResponse.next();
  }

  // Proceed with other middleware logic
  const response = NextResponse.next();
  return response;
}

export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*',
  ],
}; 