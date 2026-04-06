'use client'

import { useEffect, useState } from 'react'
import { getRelativeTime, formatDate } from '@/lib/utils'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

interface SyncItem {
  id: string
  title: string
  description: string | null
  status: string
  createdAt: string
  syncedAt: string | null
  error: string | null
  gmailAccount: { email: string }
  taskAccount: { platform: string; workspaceName: string | null } | null
}

const statusConfig: Record<string, { icon: typeof CheckCircle; label: string; color: string }> = {
  SUCCESS: { icon: CheckCircle, label: '已同步', color: 'bg-[#4A7C59]/10 text-[#4A7C59]' },
  FAILED: { icon: XCircle, label: '失败', color: 'bg-[#B85450]/10 text-[#B85450]' },
  PENDING: { icon: Clock, label: '待确认', color: 'bg-[#D4A574]/10 text-[#D4A574]' },
  PROCESSING: { icon: Clock, label: '处理中', color: 'bg-[#C15F3C]/10 text-[#C15F3C]' },
}

const platformLabels: Record<string, { name: string; color: string }> = {
  FEISHU: { name: '飞书', color: 'bg-[#4A7C59]/10 text-[#4A7C59]' },
  NOTION: { name: 'Notion', color: 'bg-[#C15F3C]/10 text-[#C15F3C]' },
  TODOIST: { name: 'Todoist', color: 'bg-[#D4A574]/10 text-[#D4A574]' },
}

export function TaskHistory() {
  const [tasks, setTasks] = useState<SyncItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    async function fetchTasks() {
      try {
        const query = filter === 'all' ? '' : `?status=${filter}`
        const response = await fetch(`/api/tasks${query}&limit=100`)
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
  }, [filter])

  if (loading) {
    return <div className="bg-white border border-[#E8E6E1] rounded-xl animate-pulse h-64" />
  }

  const statusCounts = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-4">
      {/* 过滤器 */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-[#C15F3C] text-white'
              : 'bg-white border border-[#E8E6E1] text-[#6B6966] hover:border-[#B1ADA1]'
          }`}
        >
          全部 ({tasks.length})
        </button>
        <button
          onClick={() => setFilter('SUCCESS')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'SUCCESS'
              ? 'bg-[#C15F3C] text-white'
              : 'bg-white border border-[#E8E6E1] text-[#6B6966] hover:border-[#B1ADA1]'
          }`}
        >
          已同步 ({statusCounts.SUCCESS || 0})
        </button>
        <button
          onClick={() => setFilter('FAILED')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'FAILED'
              ? 'bg-[#C15F3C] text-white'
              : 'bg-white border border-[#E8E6E1] text-[#6B6966] hover:border-[#B1ADA1]'
          }`}
        >
          失败 ({statusCounts.FAILED || 0})
        </button>
        <button
          onClick={() => setFilter('PENDING')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'PENDING'
              ? 'bg-[#C15F3C] text-white'
              : 'bg-white border border-[#E8E6E1] text-[#6B6966] hover:border-[#B1ADA1]'
          }`}
        >
          待确认 ({statusCounts.PENDING || 0})
        </button>
      </div>

      {/* 任务列表 */}
      {tasks.length === 0 ? (
        <div className="bg-white border border-[#E8E6E1] rounded-xl p-12 text-center">
          <Clock className="w-16 h-16 text-[#B1ADA1] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[#1A1918] mb-2">暂无记录</h3>
          <p className="text-[#6B6966]">还没有同步记录</p>
        </div>
      ) : (
        <div className="bg-white border border-[#E8E6E1] rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#F4F3EE] border-b border-[#E8E6E1]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B6966] uppercase">任务</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B6966] uppercase">来源</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B6966] uppercase">平台</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B6966] uppercase">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#6B6966] uppercase">时间</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E6E1]">
              {tasks.map((task) => {
                const StatusIcon = statusConfig[task.status]?.icon || Clock
                const statusInfo = statusConfig[task.status] || { label: task.status, color: '' }
                return (
                  <tr key={task.id} className="hover:bg-[#F4F3EE]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-[#1A1918] font-medium truncate">{task.title}</p>
                        {task.error && (
                          <p className="text-xs text-[#B85450] mt-1 truncate">{task.error}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6B6966]">{task.gmailAccount.email}</td>
                    <td className="px-6 py-4">
                      {task.taskAccount ? (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          platformLabels[task.taskAccount.platform]?.color || 'bg-[#F4F3EE] text-[#6B6966]'
                        }`}>
                          {platformLabels[task.taskAccount.platform]?.name || task.taskAccount.platform}
                        </span>
                      ) : (
                        <span className="text-[#9E9C98] text-sm">未设置</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${statusInfo.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#6B6966]">
                      <div title={formatDate(task.createdAt)}>
                        {getRelativeTime(task.createdAt)}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
