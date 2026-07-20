'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { signToken, hashPassword, comparePassword, COOKIE_CONFIG } from '@/lib/auth'

export async function register(formData: FormData) {
  const username = (formData.get('username') as string)?.trim()
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  const role = (formData.get('role') as string) ?? 'user'

  if (!username || username.length < 3)
    return { error: 'Username minimal 3 karakter' }

  if (!password || password.length < 6)
    return { error: 'Password minimal 6 karakter' }

  if (password !== confirmPassword)
    return { error: 'Password tidak cocok' }

  if (!['admin', 'user'].includes(role))
    return { error: 'Role tidak valid' }

  // @ts-ignore
  const existing = await prisma.user.findUnique({ where: { username } })
  if (existing) return { error: 'Username sudah digunakan' }

  const hashed = await hashPassword(password)

  //@ts-ignore
  await prisma.user.create({
    data: { username, password: hashed, role },
  })

  return { success: true }
}

export async function login(formData: FormData) {
  const username = (formData.get('username') as string)?.trim()
  const password = formData.get('password') as string

  if (!username || !password)
    return { error: 'Username dan password harus diisi' }

  const user = await prisma.user.findUnique({ where: { username } })
  if (!user) return { error: 'Username atau password salah' }

  const valid = await comparePassword(password, user.password)
  if (!valid) return { error: 'Username atau password salah' }

  const token = await signToken({
    id: user.id,
    username: user.username,
    role: user.role as 'admin' | 'user',
  })

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_CONFIG.name, token, {
    maxAge: COOKIE_CONFIG.maxAge,
    httpOnly: COOKIE_CONFIG.httpOnly,
    secure: COOKIE_CONFIG.secure,
    sameSite: COOKIE_CONFIG.sameSite,
    path: COOKIE_CONFIG.path,
  })

  return { success: true, role: user.role }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_CONFIG.name)
  redirect('/login')
}