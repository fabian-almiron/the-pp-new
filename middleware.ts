import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define routes that require authentication (any logged-in user)
const isProtectedRoute = createRouteMatcher([
  '/my-account(.*)',
  '/dashboard(.*)',
  '/profile(.*)',
]);

// Define routes that should check for subscriber role (but we'll do this client-side)
const isSubscriberRoute = createRouteMatcher([
  '/video-library(.*)',
  '/academy(/.*)?', // Only /academy and /academy/* (not /academy-details)
  '/colors(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const pathname = req.nextUrl.pathname;
  console.log('🔍 Middleware checking:', pathname);
  
  try {
    const { userId, sessionId } = await auth();
    console.log('👤 User ID:', userId ? userId : 'NOT LOGGED IN');
    console.log('🎫 Session ID:', sessionId ? sessionId : 'NO SESSION');
  
  // Only protect my-account, dashboard, profile - require login
  if (isProtectedRoute(req)) {
    console.log('🔒 Protected route detected');
    if (!userId) {
      console.log('❌ No userId, redirecting to login');
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect_url', req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
    console.log('✅ User authenticated, allowing access');
  }

  // For subscriber routes, just require login - role check will happen client-side
  if (isSubscriberRoute(req)) {
    console.log('📚 Subscriber route detected');
    if (!userId) {
      console.log('❌ No userId, redirecting to login');
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect_url', req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
    console.log('✅ User authenticated, allowing access');
  }

  console.log('➡️ Proceeding to next middleware/page');
  return NextResponse.next();
  } catch (error) {
    console.error('❌ Middleware error:', error);
    return NextResponse.next();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};