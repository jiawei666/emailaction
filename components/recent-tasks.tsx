'use client'

import { useEffect, useState } from 'react'
import { getRelativeTime } from '@/lib/utils'
import { CheckCircle, Clock, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

interface SyncItem {
  id: string
  title: string
  description: string | null
  status: string
  createdAt: string
  syncedAt: string | null
  gmailAccount: { email: string }
  taskAccount: { platform: string; workspaceName: string | null } | null
}

const platformLabels: Record<string, { name: string }> = {
  FEISHU: { name: '飞书' },
  NOTION: { name: 'Notion' },
}

export function RecentTasks() {
  const [tasks, setTasks] = useState<SyncItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTasks() {
      try {
        const response = await fetch('/api/tasks?limit=5')
        if (response.ok) {
          const data = await response.json()
          setTasks(data.tasks || [])
        }
      } catch (error) {
        console.error('Failed to fetch tasks:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTasks()
  }, [])

  if (loading) {
    return (
      <div className="bg-white border border-[#EBE9E4] rounded-xl">
        <div className="h-80 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="bg-white border border-[#EBE9E4] rounded-xl">
      {/* Header */}
      <div className="px-8 py-6 border-b border-[#EBE9E4] flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium text-[#1A1918]">最近同步</h2>
          <p className="mt-1 text-[12px] text-[#9E9C98]">最新的邮件待办同步记录</p>
        </div>
        <Link
          href="/dashboard/history"
          className="group flex items-center gap-1.5 text-[12px] text-[#6B6966] hover:text-[#1A1918] transition-colors"
        >
          查看全部
          <ArrowUpRight className="w-3.5 h-3.5 text-[#D4D2CD] group-hover:text-[#1A1918] transition-colors" />
        </Link>
      </div>

      {/* Content */}
      {tasks.length === 0 ? (
        <div className="px-8 py-16 text-center">
          <div className="w-12 h-12 border border-[#EBE9E4] flex items-center justify-center mx-auto mb-4">
            <Clock className="w-5 h-5 text-[#D4D2CD]" />
          </div>
          <p className="text-[14px] font-medium text-[#1A1918] mb-1">暂无同步记录</p>
          <p className="text-[12px] text-[#9E9C98] max-w-xs mx-auto">
            连接您的 Gmail 和任务平台后，系统将自动识别待办事项
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[#F0EFEB]">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="px-8 py-5 hover:bg-[#FAFAF8] transition-colors duration-200"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1 min-w-0">
                  {/* Status & Platform */}
                  <div className="flex items-center gap-3 mb-2">
                    {/* Status indicator */}
                    <div className="flex items-center gap-1.5">
                      {task.status === 'SUCCESS' ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#4A7C59]" />
                          <span className="text-[11px] text-[#4A7C59] font-medium">已同步</span>
                        </>
                      ) : task.status === 'FAILED' ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#B85450]" />
                          <span className="text-[11px] text-[#B85450] font-medium">失败</span>
                        </>
                      ) : (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C15F3C]" />
                          <span className="text-[11px] text-[#C15F3C] font-medium">待确认</span>
                        </>
                      )}
                    </div>

                    {/* Platform */}
                    {task.taskAccount && (
                      <span className="text-[11px] text-[#9E9C98]">
                        → {platformLabels[task.taskAccount.platform]?.name || task.taskAccount.platform}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-[14px] font-medium text-[#1A1918] mb-1 truncate">
                    {task.title}
                  </h3>

                  {/* Source */}
                  <p className="text-[12px] text-[#9E9C98]">
                    来自 {task.gmailAccount.email}
                  </p>
                </div>

                {/* Time */}
                <div className="text-[11px] text-[#B1ADA1] whitespace-nowrap tabular-nums">
                  {getRelativeTime(task.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
