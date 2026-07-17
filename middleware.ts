import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, COOKIE_CONFIG } from '@/lib/auth'

const PUBLIC_ROUTES = ['/', '/login', '/register']

// Route /user/* yang boleh diakses semua role (admin & user)
// karena berisi laporan/hasil yang perlu dilihat admin juga
const USER_ROUTES_ALL_ROLES = [
  '/user/result',
  '/user/result/print',
]

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

  // Cek apakah ini route /user/* yang boleh diakses semua role
  const isSharedUserRoute = USER_ROUTES_ALL_ROLES.some((route) =>
    pathname.startsWith(route)
  )

  // /admin/* → hanya admin
  if (pathname.startsWith('/admin') && session.role !== 'admin') {
    const url = request.nextUrl.clone()
    url.pathname = '/user/dashboard'
    return NextResponse.redirect(url)
  }

  // /user/* → hanya user, KECUALI route yang dibagi untuk semua role
  if (
    pathname.startsWith('/user') &&
    !isSharedUserRoute &&
    session.role !== 'user'
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
}