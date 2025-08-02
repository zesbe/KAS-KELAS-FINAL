import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Public routes that don't require authentication
const publicRoutes = ['/', '/login', '/api/webhook', '/payment-success']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  
  // Get session token from cookies
  const sessionToken = request.cookies.get('session_token')
  
  // If trying to access protected route without session
  if (!isPublicRoute && !sessionToken) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // If logged in and trying to access login page
  if (pathname === '/login' && sessionToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
}