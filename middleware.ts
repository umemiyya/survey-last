import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, COOKIE_CONFIG } from '@/lib/auth'

const PUBLIC_ROUTES = ['/', '/login', '/register']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Lewati route publik
  if (PUBLIC_ROUTES.includes(pathname)) return NextResponse.next()

  const token = request.cookies.get(COOKIE_CONFIG.name)?.value
  const session = token ? await verifyToken(token) : null

  // Belum login → redirect ke login
  if (!session) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  // /admin/* → hanya role admin
  if (pathname.startsWith('/admin') && session.role !== 'admin') {
    const url = request.nextUrl.clone()
    url.pathname = '/user'
    return NextResponse.redirect(url)
  }

  // /user/* → hanya role user (admin tidak bisa akses /user)
  if (pathname.startsWith('/user') && session.role !== 'user') {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
}