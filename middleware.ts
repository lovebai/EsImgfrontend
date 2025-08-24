import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Check if the user is authenticated
  const isAuthenticated = request.cookies.get('isAuthenticated')?.value === 'true';
  
  // If the user is not authenticated and trying to access dashboard
  if (!isAuthenticated && request.nextUrl.pathname.startsWith('/dashboard')) {
    // Redirect to login page
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Allow the request to proceed
  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: ['/dashboard/:path*'],
};