'use client'

import { useState, useEffect } from 'react'
import {
  CheckCircle2,
  XCircle,
  ArrowUpRight,
} from 'lucide-react'
import { getRelativeTime, formatDate } from '@/lib/utils'

interface SyncItem {
  id: string
  title: string
  description: string | null
  status: string
  createdAt: string
  syncedAt: string | null
  taskId: string | null
  gmailAccount: { email: string }
  taskAccount: { platform: string; workspaceName: string | null } | null
}

const platformLabels: Record<string, string> = {
  FEISHU: '飞书',
  NOTION: 'Notion',
}

const statusConfig: Record<string, { label: string; color: string }> = {
  SUCCESS: { label: '已同步', color: 'text-[#4A7C59]' },
  FAILED: { label: '失败', color: 'text-[#B85450]' },
  CANCELLED: { label: '已忽略', color: 'text-[#9E9C98]' },
  PENDING: { label: '待确认', color: 'text-[#C15F3C]' },
  PROCESSING: { label: '处理中', color: 'text-[#C15F3C]' },
}

export default function HistoryPage() {
  const [items, setItems] = useState<SyncItem[]>([])
  const [filter, setFilter] = useState<'all' | 'SUCCESS' | 'FAILED' | 'CANCELLED'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHistory() {
      try {
        const response = await fetch('/api/tasks?limit=100')
        if (response.ok) {
          const data = await response.json()
          setItems(data.tasks || [])
        }
      } catch (error) {
        console.error('Failed to fetch history:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [])

  const filteredItems = filter === 'all'
    ? items
    : items.filter(item => item.status === filter)

  // 按日期分组
  const groupedItems = filteredItems.reduce((groups, item) => {
    const date = new Date(item.createdAt)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    let dateKey = '更早'
    if (date.toDateString() === today.toDateString()) {
      dateKey = '今天'
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateKey = '昨天'
    } else {
      dateKey = date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })
    }

    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(item)
    return groups
  }, {} as Record<string, typeof items>)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E8E6E1] border-t-[#C15F3C] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Header */}
      <div className="border-b border-[#EBE9E4] bg-white">
        <div className="max-w-5xl mx-auto px-10 py-10">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-semibold text-[#9E9C98] uppercase tracking-[0.2em] mb-2">
                记录
              </p>
              <h1 className="text-[28px] font-semibold text-[#1A1918] tracking-tight">
                同步历史
              </h1>
              <p className="mt-2 text-[14px] text-[#6B6966]">
                查看所有已同步和已忽略的任务记录
              </p>
            </div>

            <div className="flex items-center gap-2">
              {([
                { value: 'all', label: '全部' },
                { value: 'SUCCESS', label: '已同步' },
                { value: 'FAILED', label: '失败' },
                { value: 'CANCELLED', label: '已忽略' },
              ] as const).map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`px-4 py-2 text-[12px] font-medium tracking-wide transition-all duration-200 ${
                    filter === f.value
                      ? 'bg-[#1A1918] text-white rounded-lg'
                      : 'border border-[#EBE9E4] text-[#6B6966] rounded-lg hover:border-[#1A1918] hover:text-[#1A1918]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-10 py-8">
        {/* Stats */}
        <div className="mb-8 flex items-center gap-6 text-[12px] text-[#9E9C98]">
          <span>共 {filteredItems.length} 条记录</span>
          <span className="w-1 h-1 rounded-full bg-[#D4D2CD]" />
          <span>
            {items.filter(i => i.status === 'SUCCESS').length} 已同步
          </span>
        </div>

        {filteredItems.length === 0 ? (
          <div className="bg-white border border-[#EBE9E4] rounded-xl px-8 py-16 text-center">
            <div className="w-12 h-12 border border-[#EBE9E4] flex items-center justify-center mx-auto mb-4">
              <ArrowUpRight className="w-5 h-5 text-[#D4D2CD]" />
            </div>
            <p className="text-[20px] font-medium text-[#1A1918] mb-2">暂无历史记录</p>
            <p className="text-[13px] text-[#9E9C98]">开始同步任务后，记录将显示在这里</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedItems).map(([date, dateItems]) => (
              <div key={date}>
                <p className="text-[11px] font-semibold text-[#9E9C98] uppercase tracking-wider mb-4">
                  {date}
                </p>

                <div className="bg-white border border-[#EBE9E4] rounded-xl">
                  <div className="divide-y divide-[#F0EFEB]">
                    {dateItems.map((item) => {
                      const statusInfo = statusConfig[item.status] || statusConfig.PENDING

                      return (
                        <div
                          key={item.id}
                          className="px-8 py-5 hover:bg-[#FAFAF8] transition-colors"
                        >
                          <div className="flex items-start justify-between gap-6">
                            <div className="flex items-start gap-4 flex-1 min-w-0">
                              {/* Status Icon */}
                              <div className="mt-0.5">
                                {item.status === 'SUCCESS' ? (
                                  <CheckCircle2 className="w-5 h-5 text-[#4A7C59]" />
                                ) : (
                                  <XCircle className="w-5 h-5 text-[#B1ADA1]" />
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                  <span className={`text-[11px] font-medium ${statusInfo.color}`}>
                                    {statusInfo.label}
                                  </span>
                                  {item.taskAccount && (
                                    <>
                                      <span className="text-[11px] text-[#D4D2CD]">→</span>
                                      <span className="text-[11px] text-[#9E9C98]">
                                        {platformLabels[item.taskAccount.platform] || item.taskAccount.platform}
                                      </span>
                                    </>
                                  )}
                                </div>

                                <h4 className="text-[14px] font-medium text-[#1A1918] mb-1 truncate">
                                  {item.title}
                                </h4>

                                {item.description && (
                                  <p className="text-[12px] text-[#9E9C98] truncate mb-1">
                                    {item.description}
                                  </p>
                                )}

                                <p className="text-[11px] text-[#B1ADA1]">
                                  来自 {item.gmailAccount.email}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 flex-shrink-0">
                              <span className="text-[11px] text-[#B1ADA1] tabular-nums">
                                {item.syncedAt ? formatDate(item.syncedAt) : getRelativeTime(item.createdAt)}
                              </span>
                              {item.taskId && (
                                <button className="p-1.5 text-[#D4D2CD] hover:text-[#1A1918] transition-colors">
                                  <ArrowUpRight className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
