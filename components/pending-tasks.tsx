'use client'

import { useEffect, useState } from 'react'
import { getRelativeTime } from '@/lib/utils'
import { CheckCircle, Clock, AlertCircle, Trash2, ExternalLink } from 'lucide-react'

interface SyncItem {
  id: string
  title: string
  description: string | null
  status: string
  createdAt: string
  gmailAccount: { email: string }
  taskAccount: { platform: string; workspaceName: string | null } | null
}

const platformLabels: Record<string, { name: string; color: string }> = {
  FEISHU: { name: '飞书', color: 'bg-[#4A7C59]/10 text-[#4A7C59]' },
  NOTION: { name: 'Notion', color: 'bg-[#C15F3C]/10 text-[#C15F3C]' },
  TODOIST: { name: 'Todoist', color: 'bg-[#D4A574]/10 text-[#D4A574]' },
}

export function PendingTasks() {
  const [tasks, setTasks] = useState<SyncItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTasks() {
      try {
        const response = await fetch('/api/tasks?status=PENDING&limit=50')
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

  async function handleSync(taskId: string) {
    try {
      const response = await fetch(`/api/tasks/${taskId}/sync`, { method: 'POST' })
      if (response.ok) {
        // 刷新列表
        setTasks(tasks.filter(t => t.id !== taskId))
      }
    } catch (error) {
      console.error('Failed to sync task:', error)
    }
  }

  async function handleDelete(taskId: string) {
    if (!confirm('确定要删除这个任务吗？')) return
    try {
      const response = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
      if (response.ok) {
        setTasks(tasks.filter(t => t.id !== taskId))
      }
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  if (loading) {
    return <div className="bg-white border border-[#E8E6E1] rounded-xl animate-pulse h-64" />
  }

  if (tasks.length === 0) {
    return (
      <div className="bg-white border border-[#E8E6E1] rounded-xl p-12 text-center">
        <CheckCircle className="w-16 h-16 text-[#4A7C59] mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-[#1A1918] mb-2">太棒了！</h3>
        <p className="text-[#6B6966]">当前没有待处理的任务</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="bg-white border border-[#E8E6E1] rounded-xl p-5 hover:border-[#B1ADA1] transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-[#D4A574]/10 text-[#D4A574]">
                  <Clock className="w-3 h-3" />
                  待确认
                </span>
                {task.taskAccount && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    platformLabels[task.taskAccount.platform]?.color || 'bg-[#F4F3EE] text-[#6B6966]'
                  }`}>
                    {platformLabels[task.taskAccount.platform]?.name || task.taskAccount.platform}
                  </span>
                )}
              </div>
              <h3 className="text-[#1A1918] font-medium mb-1">{task.title}</h3>
              {task.description && (
                <p className="text-sm text-[#6B6966] line-clamp-2 mb-2">{task.description}</p>
              )}
              <p className="text-xs text-[#9E9C98]">
                来自: {task.gmailAccount.email} · {getRelativeTime(task.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSync(task.id)}
                className="p-2 rounded-lg hover:bg-[#4A7C59]/10 text-[#4A7C59] transition-colors"
                title="同步到任务平台"
              >
                <ExternalLink className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDelete(task.id)}
                className="p-2 rounded-lg hover:bg-[#B85450]/10 text-[#B85450] transition-colors"
                title="忽略"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
