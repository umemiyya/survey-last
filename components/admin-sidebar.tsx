'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, ClipboardList, Settings, LogOut, Tag, GitBranch } from 'lucide-react'

const navItems = [
  { href: '/admin',   label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/admin/surveys',     label: 'Data survey',   icon: ClipboardList   },
  { href: '/admin/labeling',    label: 'Labeling data', icon: Tag             },
  { href: '/admin/classification', label: 'Klasifikasi',   icon: GitBranch       },
  // { href: '/admin/settings',    label: 'Pengaturan',    icon: Settings        },
]

export function AdminSidebar() {
  const pathname  = usePathname()
  const router    = useRouter()

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-60 border-r border-slate-100 bg-white flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="h-16 flex items-center gap-2 px-6 border-b border-slate-100">
        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
          <span className="text-white text-xs font-semibold">S</span>
        </div>
        <span className="font-semibold text-slate-900 text-sm">Admin Panel</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Keluar
        </button>
      </div>
    </aside>
  )
}