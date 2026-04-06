'use client'

import { useEffect, useState } from 'react'
import { Clock, CheckCircle2, ListTodo, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface Stats {
  pending: number
  todaySynced: number
  totalTasks: number
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stats>({ pending: 0, todaySynced: 0, totalTasks: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/tasks?limit=1')
        if (response.ok) {
          const data = await response.json()
          setStats({
            pending: data.stats?.PENDING || 0,
            todaySynced: data.stats?.SUCCESS || 0,
            totalTasks: (data.stats?.PENDING || 0) + (data.stats?.SUCCESS || 0),
          })
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-[#E8E6E1] rounded-2xl p-6 animate-pulse shadow-sm" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* 待处理 */}
      <Link
        href="/dashboard/pending"
        className="group bg-white border border-[#E8E6E1] rounded-2xl p-6 hover:border-[#C15F3C] hover:shadow-lg transition-all duration-300 shadow-sm"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-[#FEF3C7] flex items-center justify-center shadow-sm">
            <Clock className="w-6 h-6 text-[#D97706]" />
          </div>
          <div className="p-2 rounded-lg bg-[#F4F3EE] group-hover:bg-[#C15F3C]/10 transition-colors">
            <ArrowRight className="w-4 h-4 text-[#B1ADA1] group-hover:text-[#C15F3C] transition-colors" />
          </div>
        </div>
        <div className="text-4xl font-bold text-[#1A1918] mb-1 tracking-tight">{stats.pending}</div>
        <div className="text-sm text-[#6B6966] font-medium">待处理邮件</div>
        {stats.pending > 0 && (
          <div className="mt-3 flex items-center gap-1 text-xs text-[#C15F3C]">
            <Sparkles className="w-3 h-3" />
            需要确认
          </div>
        )}
      </Link>

      {/* 今日同步 */}
      <div className="bg-white border border-[#E8E6E1] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-[#E0F2FE] flex items-center justify-center shadow-sm">
            <CheckCircle2 className="w-6 h-6 text-[#0284C7]" />
          </div>
        </div>
        <div className="text-4xl font-bold text-[#1A1918] mb-1 tracking-tight">{stats.todaySynced}</div>
        <div className="text-sm text-[#6B6966] font-medium">已同步</div>
        {stats.todaySynced > 0 && (
          <div className="mt-3 text-xs text-[#4A7C59]">
            任务已同步到目标平台
          </div>
        )}
      </div>

      {/* 总任务 */}
      <div className="bg-white border border-[#E8E6E1] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-[#FEE2E2] flex items-center justify-center shadow-sm">
            <ListTodo className="w-6 h-6 text-[#B85450]" />
          </div>
        </div>
        <div className="text-4xl font-bold text-[#1A1918] mb-1 tracking-tight">{stats.totalTasks}</div>
        <div className="text-sm text-[#6B6966] font-medium">累计任务</div>
      </div>
    </div>
  )
}
