'use client'

import Link from 'next/link'
import { logout } from '@/actions/auth'
import { useEffect, useState } from 'react'

interface NavbarProps {
  showAuth?: boolean
}

export function Navbar({ showAuth = true }: NavbarProps) {
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/me')
      .then((r) => r.json())
      .then((d) => { if (d.username) setUsername(d.username) })
      .catch(() => {})
  }, [])

  return (
    <header className="border-b border-slate-100 bg-white">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white text-xs font-semibold">S</span>
          </div>
          <span className="font-semibold text-slate-900 text-sm">Survey Kepuasan</span>
        </Link>

        {showAuth && (
          <div className="flex items-center gap-3">
            {username ? (
              <>
                <span className="text-sm text-slate-500">{username}</span>
                <form action={logout}>
                  <button
                    type="submit"
                    className="text-sm font-medium px-4 py-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Keluar
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                  Masuk
                </Link>
                <Link href="/register" className="text-sm font-medium px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                  Daftar
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  )
}