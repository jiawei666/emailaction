'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  Clock,
  History,
  Settings,
  Mail,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { Logo } from '@/components/logo'

const navItems = [
  { href: '/dashboard', label: '概览', icon: LayoutDashboard, section: 'main' },
  { href: '/dashboard/pending', label: '待确认', icon: Clock, section: 'tasks' },
  { href: '/dashboard/history', label: '历史', icon: History, section: 'tasks' },
  { href: '/dashboard/accounts', label: '账户', icon: Mail, section: 'settings' },
  { href: '/dashboard/settings', label: '设置', icon: Settings, section: 'settings' },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { data: session, status } = useSession()

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  const mainNav = navItems.filter(item => item.section === 'main')
  const tasksNav = navItems.filter(item => item.section === 'tasks')
  const settingsNav = navItems.filter(item => item.section === 'settings')

  return (
    <div className="min-h-screen bg-[#FAF9F7] flex">
      {/* 侧边栏 */}
      <aside className="w-64 bg-white border-r border-[#EBE9E4] fixed h-full flex flex-col">
        {/* Logo */}
        <div className="p-8 pb-6">
          <Logo size="sm" />
        </div>

        {/* 导航 */}
        <nav className="px-5 flex-1">
          {/* 主导航 */}
          <div className="space-y-1">
            {mainNav.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-[#1A1918] text-white'
                      : 'text-[#6B6966] hover:bg-[#F4F3EE] hover:text-[#1A1918]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-[18px] h-[18px]" />
                    <span className="text-[13px] font-medium tracking-wide">{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 opacity-50" />}
                </Link>
              )
            })}
          </div>

          {/* 任务分组 */}
          <div className="mt-8">
            <div className="px-3 mb-3">
              <span className="text-[10px] font-semibold text-[#9E9C98] uppercase tracking-[0.15em]">
                任务
              </span>
            </div>
            <div className="space-y-1">
              {tasksNav.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-[#1A1918] text-white'
                        : 'text-[#6B6966] hover:bg-[#F4F3EE] hover:text-[#1A1918]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-[18px] h-[18px]" />
                      <span className="text-[13px] font-medium tracking-wide">{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4 opacity-50" />}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* 设置分组 */}
          <div className="mt-8">
            <div className="px-3 mb-3">
              <span className="text-[10px] font-semibold text-[#9E9C98] uppercase tracking-[0.15em]">
                配置
              </span>
            </div>
            <div className="space-y-1">
              {settingsNav.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-[#1A1918] text-white'
                        : 'text-[#6B6966] hover:bg-[#F4F3EE] hover:text-[#1A1918]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-[18px] h-[18px]" />
                      <span className="text-[13px] font-medium tracking-wide">{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4 opacity-50" />}
                  </Link>
                )
              })}
            </div>
          </div>
        </nav>

        {/* 用户信息 */}
        {session?.user && (
          <div className="p-5 border-t border-[#EBE9E4]">
            <div className="flex items-center gap-3 mb-3">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || '用户头像'}
                  className="w-9 h-9 rounded-full object-cover ring-1 ring-[#EBE9E4]"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#1A1918] flex items-center justify-center text-white text-sm font-medium">
                  {session.user.name?.[0] || session.user.email?.[0] || 'U'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1A1918] truncate">
                  {session.user.name || '用户'}
                </p>
                <p className="text-[11px] text-[#9E9C98] truncate">
                  {session.user.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-[#6B6966] hover:text-[#B85450] hover:bg-[#FEF2F2] rounded-lg transition-all duration-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>退出登录</span>
            </button>
          </div>
        )}
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 ml-64">
        {children}
      </main>
    </div>
  )
}
