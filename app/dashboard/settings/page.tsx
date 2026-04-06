'use client'

import { useEffect, useState } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'
import {
  Mail,
  Bell,
  Shield,
  Trash2,
  ExternalLink,
  Check,
  Loader2,
  X,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface UserSettings {
  id: string
  userId: string
}

interface GmailAccount {
  id: string
  email: string
  syncStatus: string
  lastSyncAt: string | null
}

interface TaskAccount {
  id: string
  platform: string
  email?: string
  workspaceName?: string
  isActive: boolean
}

const platformConfig: Record<string, { name: string; color: string }> = {
  FEISHU: { name: '飞书', color: 'text-[#4A7C59]' },
  NOTION: { name: 'Notion', color: 'text-[#1A1918]' },
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [gmailAccounts, setGmailAccounts] = useState<GmailAccount[]>([])
  const [taskAccounts, setTaskAccounts] = useState<TaskAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [connectingGmail, setConnectingGmail] = useState(false)
  const [showPlatformDialog, setShowPlatformDialog] = useState(false)
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null)
  const [platformForm, setPlatformForm] = useState({
    platform: '',
    accessToken: '',
    workspaceName: '',
    workspaceId: '',
  })

  useEffect(() => {
    if (session?.user) {
      fetchSettings()
      fetchAccounts()
    } else {
      setLoading(false)
    }
  }, [session])

  async function fetchSettings() {
    // Settings no longer needed - auto sync removed
  }

  async function fetchAccounts() {
    try {
      const [gmailRes, taskRes] = await Promise.all([
        fetch('/api/gmail/accounts'),
        fetch('/api/task-accounts'),
      ])
      if (gmailRes.ok) {
        const data = await gmailRes.json()
        setGmailAccounts(data)
      }
      if (taskRes.ok) {
        const data = await taskRes.json()
        setTaskAccounts(data)
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteAccount() {
    setIsDeleting(true)
    try {
      const res = await fetch('/api/user/account', { method: 'DELETE' })

      if (res.ok) {
        toast({ title: '账户已删除' })
        setTimeout(() => {
          signOut({ callbackUrl: '/' })
        }, 1500)
      } else {
        throw new Error('Failed to delete account')
      }
    } catch (error) {
      toast({ title: '删除失败', variant: 'destructive' })
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleConnectGmail() {
    setConnectingGmail(true)
    try {
      const response = await fetch('/api/gmail/oauth')
      if (response.ok) {
        const data = await response.json()
        window.location.href = data.authUrl
      } else {
        const error = await response.json()
        toast({ title: '连接失败', description: error.error, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: '连接失败', variant: 'destructive' })
    } finally {
      setConnectingGmail(false)
    }
  }

  async function handleDeleteGmail(accountId: string) {
    if (!confirm('确定要断开这个 Gmail 账户吗？')) return
    try {
      const response = await fetch(`/api/gmail/accounts?id=${accountId}`, { method: 'DELETE' })
      if (response.ok) {
        setGmailAccounts(gmailAccounts.filter(a => a.id !== accountId))
      }
    } catch (error) {
      alert('断开账户失败，请重试')
    }
  }

  async function handleDeleteTask(accountId: string) {
    if (!confirm('确定要断开这个任务平台吗？')) return
    try {
      const response = await fetch(`/api/task-accounts?id=${accountId}`, { method: 'DELETE' })
      if (response.ok) {
        setTaskAccounts(taskAccounts.filter(a => a.id !== accountId))
      }
    } catch (error) {
      alert('断开平台失败，请重试')
    }
  }

  function handleConnectPlatform(platform: string) {
    setPlatformForm({ platform, accessToken: '', workspaceName: '', workspaceId: '' })
    setShowPlatformDialog(true)
  }

  async function handleConnectPlatformSubmit() {
    if (!platformForm.accessToken) {
      toast({ title: '请输入 Token', variant: 'destructive' })
      return
    }

    setConnectingPlatform(platformForm.platform)
    try {
      const response = await fetch('/api/task-accounts/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(platformForm),
      })

      if (response.ok) {
        const newAccount = await response.json()
        setTaskAccounts([...taskAccounts, newAccount])
        setShowPlatformDialog(false)
        toast({ title: '连接成功' })
      } else {
        const error = await response.json()
        toast({ title: '连接失败', description: error.error, variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: '连接失败', variant: 'destructive' })
    } finally {
      setConnectingPlatform(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Header */}
      <div className="border-b border-[#EBE9E4] bg-white">
        <div className="max-w-3xl mx-auto px-10 py-10">
          <p className="text-[10px] font-semibold text-[#9E9C98] uppercase tracking-[0.2em] mb-2">
            偏好
          </p>
          <h1 className="text-[28px] font-semibold text-[#1A1918] tracking-tight">
            设置
          </h1>
          <p className="mt-2 text-[14px] text-[#6B6966]">
            管理您的账户和偏好设置
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-10 py-8 space-y-8">
        {/* Gmail 账户 */}
        <section className="bg-white border border-[#EBE9E4] rounded-xl">
          <div className="px-8 py-6 border-b border-[#EBE9E4]">
            <p className="text-[10px] font-semibold text-[#9E9C98] uppercase tracking-[0.2em] mb-1">
              邮箱
            </p>
            <h2 className="text-lg font-semibold text-[#1A1918]">Gmail 账户</h2>
          </div>
          <div className="p-8">
            {loading ? (
              <div className="space-y-4">
                <div className="h-16 bg-[#FAFAF8] animate-pulse" />
              </div>
            ) : gmailAccounts.length === 0 ? (
              <div className="py-6 text-center">
                <Mail className="w-8 h-8 text-[#D4D2CD] mx-auto mb-3" />
                <p className="text-[13px] text-[#9E9C98]">还没有连接 Gmail 账户</p>
              </div>
            ) : (
              <div className="divide-y divide-[#F0EFEB]">
                {gmailAccounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-[14px] font-medium text-[#1A1918]">{account.email}</p>
                      <p className="text-[12px] text-[#9E9C98]">
                        上次同步: {account.lastSyncAt
                          ? new Date(account.lastSyncAt).toLocaleString('zh-CN')
                          : '未同步'}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-[11px] font-medium flex items-center gap-1 ${
                        account.syncStatus === 'SUCCESS' ? 'text-[#4A7C59]' : 'text-[#9E9C98]'
                      }`}>
                        <Check className="w-3 h-3" />
                        {account.syncStatus === 'SUCCESS' ? '已连接' : '待同步'}
                      </span>
                      <button
                        onClick={() => handleDeleteGmail(account.id)}
                        className="text-[12px] text-[#9E9C98] hover:text-[#B85450] transition-colors"
                      >
                        断开
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6 pt-6 border-t border-[#F0EFEB]">
              <button
                onClick={handleConnectGmail}
                disabled={connectingGmail}
                className="w-full py-3 border border-[#EBE9E4] text-[#6B6966] text-[12px] font-medium hover:border-[#1A1918] hover:text-[#1A1918] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {connectingGmail ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    连接中...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4" />
                    添加 Gmail 账户
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* 任务平台 */}
        <section className="bg-white border border-[#EBE9E4] rounded-xl">
          <div className="px-8 py-6 border-b border-[#EBE9E4]">
            <h2 className="text-lg font-semibold text-[#1A1918]">任务平台</h2>
          </div>
          <div className="p-8">
            {loading ? (
              <div className="space-y-4">
                <div className="h-16 bg-[#FAFAF8] animate-pulse" />
              </div>
            ) : taskAccounts.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-[13px] text-[#9E9C98] mb-4">还没有连接任务平台</p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => handleConnectPlatform('NOTION')}
                    className="px-5 py-2 border border-[#1A1918] text-[#1A1918] text-[12px] font-medium hover:bg-[#1A1918] hover:text-white transition-colors"
                  >
                    连接 Notion
                  </button>
                  <button
                    disabled
                    className="px-5 py-2 border border-[#EBE9E4] text-[#B1ADA1] text-[12px] font-medium cursor-not-allowed"
                  >
                    飞书 · 敬请期待
                  </button>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-[#F0EFEB]">
                {taskAccounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-[14px] font-medium text-[#1A1918]">
                        {platformConfig[account.platform]?.name || account.platform}
                      </p>
                      <p className="text-[12px] text-[#9E9C98]">
                        {account.email || account.workspaceName || '已连接'}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-[11px] font-medium ${
                        account.isActive ? 'text-[#4A7C59]' : 'text-[#9E9C98]'
                      }`}>
                        {account.isActive ? '活跃' : '未激活'}
                      </span>
                      <button
                        onClick={() => handleDeleteTask(account.id)}
                        className="text-[12px] text-[#9E9C98] hover:text-[#B85450] transition-colors"
                      >
                        断开
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 安全设置 */}
        <section className="bg-white border border-[#EBE9E4] rounded-xl">
          <div className="px-8 py-6 border-b border-[#EBE9E4] flex items-center gap-4">
            <Shield className="w-5 h-5 text-[#6B6966]" />
            <h2 className="text-lg font-semibold text-[#1A1918]">安全</h2>
          </div>
          <div className="p-8 space-y-2">
            <button className="w-full px-4 py-3 text-left text-[13px] border border-[#EBE9E4] hover:border-[#1A1918] transition-colors flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-[#9E9C98]" />
              修改密码
            </button>
            <button className="w-full px-4 py-3 text-left text-[13px] border border-[#EBE9E4] hover:border-[#1A1918] transition-colors flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#9E9C98]" />
              登录历史
            </button>
          </div>
        </section>

        {/* 危险区域 */}
        <section className="bg-white border border-[#B85450]/30">
          <div className="px-8 py-6 border-b border-[#B85450]/20">
            <p className="text-[10px] font-semibold text-[#B85450] uppercase tracking-[0.2em] mb-1">
              危险区域
            </p>
            <h2 className="text-lg font-semibold text-[#1A1918]">删除账户</h2>
          </div>
          <div className="p-8">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="w-full px-4 py-3 border border-[#B85450] text-[#B85450] text-[13px] font-medium hover:bg-[#B85450]/10 transition-colors flex items-center justify-center gap-2">
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  删除账户
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-white border border-[#EBE9E4] rounded-xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-xl font-semibold text-[#1A1918]">确认删除账户？</AlertDialogTitle>
                  <AlertDialogDescription className="text-[#6B6966]">
                    此操作将永久删除您的账户和所有相关数据，包括 Gmail 连接、任务平台连接和所有同步项目。此操作不可撤销。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border border-[#EBE9E4] text-[#6B6966]">取消</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.preventDefault()
                      handleDeleteAccount()
                    }}
                    className="bg-[#B85450] hover:bg-[#964440] text-white"
                  >
                    确认删除
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </section>
      </div>

      {/* Platform Dialog */}
      {showPlatformDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white p-8 w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-xl font-medium text-[#1A1918]">
                连接 {platformConfig[platformForm.platform]?.name || platformForm.platform}
              </h3>
              <button
                onClick={() => setShowPlatformDialog(false)}
                className="text-[#9E9C98] hover:text-[#1A1918] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-[11px] font-semibold text-[#9E9C98] uppercase tracking-wider mb-2">
                  Access Token <span className="text-[#B85450]">*</span>
                </label>
                <input
                  type="password"
                  value={platformForm.accessToken}
                  onChange={(e) => setPlatformForm({ ...platformForm, accessToken: e.target.value })}
                  className="w-full px-0 py-2 border-0 border-b border-[#EBE9E4] focus:border-[#1A1918] focus:ring-0 text-[#1A1918] text-[15px]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#9E9C98] uppercase tracking-wider mb-2">
                  工作空间名称（可选）
                </label>
                <input
                  type="text"
                  value={platformForm.workspaceName}
                  onChange={(e) => setPlatformForm({ ...platformForm, workspaceName: e.target.value })}
                  className="w-full px-0 py-2 border-0 border-b border-[#EBE9E4] focus:border-[#1A1918] focus:ring-0 text-[#1A1918] text-[15px]"
                />
              </div>

              {platformForm.platform === 'NOTION' && (
                <div>
                  <label className="block text-[11px] font-semibold text-[#9E9C98] uppercase tracking-wider mb-2">
                    Database ID <span className="text-[#B85450]">*</span>
                  </label>
                  <input
                    type="text"
                    value={platformForm.workspaceId}
                    onChange={(e) => setPlatformForm({ ...platformForm, workspaceId: e.target.value })}
                    className="w-full px-0 py-2 border-0 border-b border-[#EBE9E4] focus:border-[#1A1918] focus:ring-0 text-[#1A1918] text-[15px]"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowPlatformDialog(false)}
                  className="flex-1 py-3 border border-[#EBE9E4] text-[#6B6966] text-[13px] font-medium hover:border-[#1A1918] hover:text-[#1A1918] transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleConnectPlatformSubmit}
                  disabled={connectingPlatform !== null || !platformForm.accessToken}
                  className="flex-1 py-3 bg-[#1A1918] text-white text-[13px] font-medium hover:bg-[#2D2B29] disabled:opacity-50 transition-colors"
                >
                  {connectingPlatform ? '连接中...' : '连接'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
