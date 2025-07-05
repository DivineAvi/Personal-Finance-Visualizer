import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware doesn't do much, but it's here in case we need to add
// authentication or other middleware functionality in the future
export function middleware(request: NextRequest) {
  // Continue to the requested page
  return NextResponse.next();
}

// Only run middleware on API routes
export const config = {
  matcher: '/api/:path*',
}; 