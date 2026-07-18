'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

interface NavbarProps {
  showAuth?: boolean
}

export function Navbar({ showAuth = true }: NavbarProps) {
  const router = useRouter()
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/me')
      .then((r) => r.json())
      .then((d) => { if (d.username) setUsername(d.username) })
      .catch(() => {})
  }, [])

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="border-b border-slate-100 bg-white">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white text-xs font-semibold">S</span>
          </div>
          <span className="font-semibold text-slate-900 text-sm">Survey Kepuasan</span>
        </Link>

        <div className="flex items-center gap-3">
          {username ? (
            <>
              <span className="text-sm text-slate-500 hidden sm:block">{username}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Keluar
              </button>
            </>
          ) : showAuth ? (
            <>
              <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                Masuk
              </Link>
              <Link href="/register" className="text-sm font-medium px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                Daftar
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </header>
  )
}