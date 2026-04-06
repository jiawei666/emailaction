'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Clock, ArrowUpRight, RefreshCw, Mail, Sparkles, AlertCircle, CheckCircle2, X } from 'lucide-react'
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

type SyncStatus = 'idle' | 'syncing' | 'success' | 'error' | 'need-setup'

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<Stats>({ pending: 0, todaySynced: 0, totalTasks: 0 })
  const [gmailAccounts, setGmailAccounts] = useState<GmailAccount[]>([])
  const [taskAccounts, setTaskAccounts] = useState<TaskAccount[]>([])
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')
  const [syncMessage, setSyncMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [showSyncResult, setShowSyncResult] = useState(false)

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
    // 检查 Gmail 是否已连接
    if (gmailAccounts.length === 0) {
      setSyncStatus('need-setup')
      setSyncMessage('请先连接 Gmail 账户')
      return
    }

    // 检查任务平台是否已连接
    if (taskAccounts.length === 0) {
      setSyncStatus('need-setup')
      setSyncMessage('请先连接任务平台（飞书/Notion）')
      return
    }

    setSyncStatus('syncing')
    setSyncMessage('正在同步邮件...')

    try {
      const response = await fetch('/api/gmail/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: gmailAccounts[0].id,
          taskAccountId: taskAccounts[0].id,
          query: 'is:unread',
          days: 7,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setSyncStatus('success')
        setSyncMessage(`同步完成！共同步 ${data.synced || 0} 个待办事项`)
        setShowSyncResult(true)

        // 刷新数据
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        const error = await response.json()
        setSyncStatus('error')
        setSyncMessage(error.error || '同步失败，请重试')
        setShowSyncResult(true)
      }
    } catch (error) {
      console.error('Sync error:', error)
      setSyncStatus('error')
      setSyncMessage('同步失败，请检查网络连接')
      setShowSyncResult(true)
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
                disabled={syncStatus === 'syncing'}
                className={`inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-medium tracking-wide rounded-lg transition-all duration-300 ${
                  syncStatus === 'syncing'
                    ? 'bg-[#F4F3EE] text-[#6B6966] cursor-wait'
                    : 'border border-[#1A1918] text-[#1A1918] hover:bg-[#1A1918] hover:text-white'
                }`}
              >
                {syncStatus === 'syncing' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    同步中...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    同步邮件
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sync Status Banner */}
          {showSyncResult && (
            <div className={`mt-6 p-4 rounded-lg flex items-center justify-between animate-fade-in-up ${
              syncStatus === 'success'
                ? 'bg-[#4A7C59]/10 border border-[#4A7C59]/20'
                : syncStatus === 'error' || syncStatus === 'need-setup'
                  ? 'bg-[#C15F3C]/10 border border-[#C15F3C]/20'
                  : ''
            }`}>
              <div className="flex items-center gap-3">
                {syncStatus === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-[#4A7C59]" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-[#C15F3C]" />
                )}
                <span className={`text-[14px] font-medium ${
                  syncStatus === 'success' ? 'text-[#4A7C59]' : 'text-[#C15F3C]'
                }`}>
                  {syncMessage}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {(syncStatus === 'error' || syncStatus === 'need-setup') && (
                  <Link
                    href="/dashboard/accounts"
                    className="text-[12px] font-medium text-[#1A1918] hover:text-[#C15F3C] transition-colors"
                  >
                    前往配置 →
                  </Link>
                )}
                <button
                  onClick={() => setShowSyncResult(false)}
                  className="p-1 hover:bg-white/50 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-[#6B6966]" />
                </button>
              </div>
            </div>
          )}

          {/* Connection Status */}
          {!isConnected && !showSyncResult && (
            <div className="mt-8 flex gap-4 animate-fade-in-up delay-300">
              {gmailAccounts.length === 0 && (
                <Link
                  href="/dashboard/accounts"
                  className="group flex items-center gap-4 border border-dashed border-[#D4D2CD] hover:border-[#C15F3C] bg-white px-5 py-4 rounded-lg transition-all duration-300"
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
                  className="group flex items-center gap-4 border border-dashed border-[#D4D2CD] hover:border-[#4A7C59] bg-white px-5 py-4 rounded-lg transition-all duration-300"
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

          {/* Connection Status - Connected */}
          {isConnected && !showSyncResult && (
            <div className="mt-6 flex items-center gap-6 text-[12px]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#4A7C59]" />
                <span className="text-[#6B6966]">Gmail 已连接</span>
                <span className="text-[#9E9C98]">({gmailAccounts[0]?.email})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#4A7C59]" />
                <span className="text-[#6B6966]">任务平台已连接</span>
                <span className="text-[#9E9C98]">
                  ({taskAccounts[0]?.platform === 'FEISHU' ? '飞书' : 'Notion'})
                </span>
              </div>
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
            disabled={syncStatus === 'syncing'}
            className="flex-1 inline-flex items-center justify-center gap-2 border border-[#1A1918] text-[#1A1918] py-3 text-[13px] font-medium rounded-lg disabled:opacity-50"
          >
            {syncStatus === 'syncing' ? (
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
