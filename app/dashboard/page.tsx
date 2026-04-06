'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Clock, ArrowUpRight, RefreshCw, Mail, Sparkles, AlertCircle, CheckCircle2, X, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { RecentTasks } from '@/components/recent-tasks'

interface Stats {
  pending: number
  todaySynced: number
  totalTasks: number
}

interface GmailAccount {
  id: string
  email: string
}

interface TaskAccount {
  id: string
  platform: string
  workspaceName: string | null
}

// SSE 事件类型
interface SyncEvent {
  type: 'searching' | 'found' | 'analyzing' | 'created' | 'complete' | 'error'
  count?: number
  current?: number
  total?: number
  subject?: string
  title?: string
  synced?: number
  emailsProcessed?: number
  message?: string
}

interface SyncProgress {
  status: 'syncing' | 'done' | 'error'
  message: string
  current?: number
  total?: number
  synced?: number
  subject?: string
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<Stats>({ pending: 0, todaySynced: 0, totalTasks: 0 })
  const [gmailAccounts, setGmailAccounts] = useState<GmailAccount[]>([])
  const [taskAccounts, setTaskAccounts] = useState<TaskAccount[]>([])
  const [syncing, setSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, gmailRes, taskRes] = await Promise.all([
          fetch('/api/tasks?limit=1'),
          fetch('/api/gmail/accounts'),
          fetch('/api/task-accounts'),
        ])

        if (statsRes.ok) {
          const data = await statsRes.json()
          setStats({
            pending: data.stats?.PENDING || 0,
            todaySynced: data.stats?.SUCCESS || 0,
            totalTasks: (data.stats?.PENDING || 0) + (data.stats?.SUCCESS || 0),
          })
        }

        if (gmailRes.ok) {
          const data = await gmailRes.json()
          setGmailAccounts(data)
        }

        if (taskRes.ok) {
          const data = await taskRes.json()
          setTaskAccounts(data)
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  async function handleSyncEmails() {
    if (gmailAccounts.length === 0) {
      alert('请先连接 Gmail 账户')
      return
    }

    if (taskAccounts.length === 0) {
      alert('请先连接任务平台（飞书/Notion）')
      return
    }

    setSyncing(true)
    setSyncProgress({
      status: 'syncing',
      message: '正在连接...',
    })

    try {
      const response = await fetch('/api/gmail/sync/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: gmailAccounts[0].id,
          taskAccountId: taskAccounts[0].id,
          query: 'is:unread',
          days: 7,
        }),
      })

      if (!response.ok) {
        throw new Error('同步请求失败')
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('无法读取响应流')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event: SyncEvent = JSON.parse(line.slice(6))

              switch (event.type) {
                case 'searching':
                  setSyncProgress({
                    status: 'syncing',
                    message: '正在搜索邮件...',
                  })
                  break

                case 'found':
                  setSyncProgress({
                    status: 'syncing',
                    message: `已找到 ${event.count} 封邮件`,
                    total: event.count,
                    current: 0,
                  })
                  break

                case 'analyzing':
                  setSyncProgress({
                    status: 'syncing',
                    message: `正在分析第 ${event.current}/${event.total} 封`,
                    current: event.current,
                    total: event.total,
                    subject: event.subject,
                  })
                  break

                case 'created':
                  setSyncProgress(prev => ({
                    ...prev!,
                    status: 'syncing',
                    message: `已识别待办: ${event.title?.slice(0, 30)}`,
                    synced: (prev?.synced || 0) + 1,
                  }))
                  break

                case 'complete':
                  setSyncProgress({
                    status: 'done',
                    message: `同步完成`,
                    synced: event.synced,
                    total: event.emailsProcessed,
                  })
                  setTimeout(() => {
                    setSyncProgress(null)
                    setSyncing(false)
                    window.location.reload()
                  }, 2000)
                  break

                case 'error':
                  setSyncProgress({
                    status: 'error',
                    message: event.message || '同步失败',
                  })
                  setTimeout(() => {
                    setSyncProgress(null)
                    setSyncing(false)
                  }, 3000)
                  break
              }
            } catch (e) {
              console.error('Failed to parse SSE event:', line)
            }
          }
        }
      }
    } catch (error) {
      console.error('Sync error:', error)
      setSyncProgress({
        status: 'error',
        message: error instanceof Error ? error.message : '同步失败，请重试',
      })
      setTimeout(() => {
        setSyncProgress(null)
        setSyncing(false)
      }, 3000)
    }
  }

  const isConnected = gmailAccounts.length > 0 && taskAccounts.length > 0
  const greeting = getGreeting()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E8E6E1] border-t-[#C15F3C] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Sync Progress Modal */}
      {syncing && syncProgress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              {syncProgress.status === 'syncing' && (
                <RefreshCw className="w-6 h-6 text-[#C15F3C] animate-spin" />
              )}
              {syncProgress.status === 'done' && (
                <CheckCircle2 className="w-6 h-6 text-[#4A7C59]" />
              )}
              {syncProgress.status === 'error' && (
                <AlertCircle className="w-6 h-6 text-[#B85450]" />
              )}
              <div>
                <p className="font-semibold text-[#1A1918]">
                  {syncProgress.status === 'syncing' && '正在同步邮件'}
                  {syncProgress.status === 'done' && '同步完成'}
                  {syncProgress.status === 'error' && '同步失败'}
                </p>
                <p className="text-sm text-[#6B6966]">{syncProgress.message}</p>
              </div>
            </div>

            {/* 进度条 */}
            {syncProgress.status === 'syncing' && syncProgress.total && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-[#9E9C98] mb-2">
                  <span>处理进度</span>
                  <span>
                    {syncProgress.current || 0} / {syncProgress.total}
                  </span>
                </div>
                <div className="w-full bg-[#F0EFEB] rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 bg-[#C15F3C] transition-all duration-300 rounded-full"
                    style={{
                      width: `${((syncProgress.current || 0) / syncProgress.total) * 100}%`,
                    }}
                  />
                </div>
                {syncProgress.subject && (
                  <p className="text-xs text-[#9E9C98] mt-2 truncate">
                    当前: {syncProgress.subject}
                  </p>
                )}
              </div>
            )}

            {/* 已识别待办 */}
            {syncProgress.status === 'syncing' && syncProgress.synced !== undefined && syncProgress.synced > 0 && (
              <div className="flex items-center gap-2 text-sm text-[#4A7C59]">
                <CheckCircle2 className="w-4 h-4" />
                已识别 {syncProgress.synced} 个待办
              </div>
            )}

            {/* 完成状态 */}
            {syncProgress.status === 'done' && (
              <div className="text-center">
                <p className="text-[#4A7C59] font-medium mb-2">
                  共同步 {syncProgress.synced || 0} 个待办事项
                </p>
                {syncProgress.total && (
                  <p className="text-sm text-[#9E9C98]">
                    已处理 {syncProgress.total} 封邮件
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="border-b border-[#EBE9E4] bg-white">
        <div className="max-w-5xl mx-auto px-10 py-12">
          <div className="flex items-end justify-between">
            {/* Left: Greeting */}
            <div className="animate-fade-in-up">
              <p className="text-[11px] font-semibold text-[#C15F3C] uppercase tracking-[0.2em] mb-3">
                {greeting}
              </p>
              <h1 className="text-[32px] font-semibold text-[#1A1918] tracking-tight leading-tight">
                {session?.user?.name || '用户'}
              </h1>
              <p className="mt-3 text-[15px] text-[#6B6966] max-w-md leading-relaxed">
                {isConnected
                  ? 'AI 正在监控您的邮箱，自动识别待办邮件'
                  : '连接账户，让 AI 自动提取邮件中的待办事项'}
              </p>
            </div>

            {/* Right: Quick Actions */}
            <div className="flex items-center gap-3 animate-fade-in-up delay-200">
              <Link
                href="/dashboard/pending"
                className="group inline-flex items-center gap-2 bg-[#1A1918] hover:bg-[#2D2B29] text-white px-5 py-2.5 text-[13px] font-medium tracking-wide rounded-lg transition-all duration-300"
              >
                <Clock className="w-4 h-4" />
                处理待办
                <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
              </Link>
              <button
                onClick={handleSyncEmails}
                disabled={syncing || !isConnected}
                className="inline-flex items-center gap-2 border border-[#1A1918] text-[#1A1918] px-5 py-2.5 text-[13px] font-medium tracking-wide rounded-lg hover:bg-[#1A1918] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
              >
                {syncing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
                {syncing ? '同步中' : '同步邮件'}
              </button>
            </div>
          </div>

          {/* Connection Status */}
          {!isConnected && (
            <div className="mt-8 flex gap-4 animate-fade-in-up delay-300">
              {gmailAccounts.length === 0 && (
                <Link
                  href="/dashboard/accounts"
                  className="group flex items-center gap-4 border-2 border-dashed border-[#D4D2CD] hover:border-[#C15F3C] bg-white px-5 py-4 rounded-lg transition-all duration-300"
                >
                  <div className="w-10 h-10 border border-[#EBE9E4] rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5 text-[#6B6966]" />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-[#1A1918]">连接 Gmail</p>
                    <p className="text-[11px] text-[#9E9C98] mt-0.5">扫描待办邮件</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-[#9E9C98] group-hover:text-[#C15F3C] ml-2 transition-colors" />
                </Link>
              )}
              {taskAccounts.length === 0 && (
                <Link
                  href="/dashboard/accounts"
                  className="group flex items-center gap-4 border-2 border-dashed border-[#D4D2CD] hover:border-[#4A7C59] bg-white px-5 py-4 rounded-lg transition-all duration-300"
                >
                  <div className="w-10 h-10 border border-[#EBE9E4] rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[#6B6966]" />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-[#1A1918]">连接任务平台</p>
                    <p className="text-[11px] text-[#9E9C98] mt-0.5">飞书 / Notion</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-[#9E9C98] group-hover:text-[#4A7C59] ml-2 transition-colors" />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-5xl mx-auto px-10 py-10">
        <div className="grid grid-cols-3 gap-4 animate-fade-in-up delay-400">
          {/* Pending */}
          <Link
            href="/dashboard/pending"
            className="group bg-white p-8 rounded-xl border border-[#EBE9E4] hover:border-[#D4D2CD] hover:shadow-sm transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] font-semibold text-[#9E9C98] uppercase tracking-[0.15em]">
                待处理
              </span>
              <ArrowUpRight className="w-4 h-4 text-[#D4D2CD] group-hover:text-[#C15F3C] transition-colors" />
            </div>
            <div className="text-5xl font-semibold text-[#1A1918] tracking-tight">
              {stats.pending}
            </div>
            <div className="mt-2 text-[12px] text-[#6B6966]">封邮件需要确认</div>
            {stats.pending > 0 && (
              <div className="mt-4 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C15F3C]" />
                <span className="text-[11px] text-[#C15F3C] font-medium">需要处理</span>
              </div>
            )}
          </Link>

          {/* Synced */}
          <div className="bg-white p-8 rounded-xl border border-[#EBE9E4]">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] font-semibold text-[#9E9C98] uppercase tracking-[0.15em]">
                已同步
              </span>
            </div>
            <div className="text-5xl font-semibold text-[#1A1918] tracking-tight">
              {stats.todaySynced}
            </div>
            <div className="mt-2 text-[12px] text-[#6B6966]">任务已同步</div>
            {stats.todaySynced > 0 && (
              <div className="mt-4 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4A7C59]" />
                <span className="text-[11px] text-[#4A7C59] font-medium">运行正常</span>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="bg-white p-8 rounded-xl border border-[#EBE9E4]">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] font-semibold text-[#9E9C98] uppercase tracking-[0.15em]">
                累计
              </span>
            </div>
            <div className="text-5xl font-semibold text-[#1A1918] tracking-tight">
              {stats.totalTasks}
            </div>
            <div className="mt-2 text-[12px] text-[#6B6966]">总任务数</div>
          </div>
        </div>
      </div>

      {/* Recent Tasks Section */}
      <div className="max-w-5xl mx-auto px-10 pb-16">
        <div className="animate-fade-in-up delay-500">
          <RecentTasks />
        </div>
      </div>

      {/* Mobile Quick Actions */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#EBE9E4] p-4 z-50">
        <div className="flex gap-3">
          <Link
            href="/dashboard/pending"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-[#1A1918] text-white py-3 text-[13px] font-medium rounded-lg"
          >
            <Clock className="w-4 h-4" />
            处理待办
          </Link>
          <button
            onClick={handleSyncEmails}
            disabled={syncing || !isConnected}
            className="flex-1 inline-flex items-center justify-center gap-2 border border-[#1A1918] text-[#1A1918] py-3 text-[13px] font-medium rounded-lg disabled:opacity-30"
          >
            {syncing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Mail className="w-4 h-4" />
            )}
            同步
          </button>
        </div>
      </div>
    </div>
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 6) return '夜深了'
  if (hour < 12) return '早上好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
}
