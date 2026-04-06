'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Clock, History, Users, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { Logo } from '@/components/logo'

const navItems = [
  { href: '/dashboard', label: '概览', icon: LayoutDashboard },
  { href: '/dashboard/pending', label: '待确认', icon: Clock },
  { href: '/dashboard/history', label: '历史', icon: History },
  { href: '/dashboard/accounts', label: '账户', icon: Users },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile header */}
      <header className="lg:hidden bg-white border-b border-[#E8E6E1] fixed w-full z-50">
        <div className="px-4 h-14 flex items-center justify-between">
          <Logo size="sm" />
        </div>
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-56 bg-white border-r border-[#E8E6E1] flex-col">
        <div className="p-6">
          <Logo />
        </div>

        <nav className="flex-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${
                  isActive
                    ? 'bg-[#C15F3C]/10 text-[#C15F3C]'
                    : 'text-[#6B6966] hover:bg-[#F4F3EE]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-[#E8E6E1]">
          <button
            onClick={async () => {
              await signOut({ redirect: true, callbackUrl: '/' })
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-[#6B6966] hover:bg-[#F4F3EE] transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">退出登录</span>
          </button>
        </div>
      </aside>
    </>
  )
}
