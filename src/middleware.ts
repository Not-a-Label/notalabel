import { NextResponse, NextRequest } from 'next/server';
import { isNewUser } from '@/utils/onboarding';

export function middleware(request: NextRequest) {
  // For API routes related to file uploads, we should return early
  // to avoid interfering with the body parsing done in the route handler
  if (request.nextUrl.pathname.startsWith('/api/profile/upload')) {
    return NextResponse.next();
  }
  
  // Check for onboarding paths - don't redirect if already on onboarding
  if (request.nextUrl.pathname.startsWith('/onboarding')) {
    return NextResponse.next();
  }
  
  // Check for public paths that should always be accessible
  const publicPaths = [
    '/', 
    '/auth/login', 
    '/auth/register', 
    '/about',
    '/terms',
    '/privacy',
    '/contact'
  ];
  
  if (publicPaths.includes(request.nextUrl.pathname)) {
    return NextResponse.next();
  }
  
  // Check if user is authenticated 
  const authCookie = request.cookies.get('user');
  if (!authCookie) {
    // User is not logged in, redirect to login
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  // Check if user is new and needs onboarding
  try {
    // In a real implementation, we'd check JWT claims
    // For now, we're using the sessionStorage check in the client-side component
    // This is a starting point for server-side implementation
    
    // Proceed with other middleware logic
    const response = NextResponse.next();
    return response;
  } catch (error) {
    console.error('Error in middleware:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    // Match all routes except static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
}; 