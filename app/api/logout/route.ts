import { NextResponse } from 'next/server'
import { COOKIE_CONFIG } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_CONFIG.name)
  return NextResponse.json({ success: true })
}