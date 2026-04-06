'use client'

import { useEffect, useState } from 'react'
import { Plus, Trash2, Mail, Loader2, X, ArrowUpRight } from 'lucide-react'

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

const platformConfig: Record<string, { name: string; color: string; icon: string; disabled?: boolean }> = {
  FEISHU: { name: '飞书', color: 'text-[#4A7C59]', icon: '飞', disabled: true },
  NOTION: { name: 'Notion', color: 'text-[#1A1918]', icon: 'N' },
}

export function AccountManagement() {
  const [gmailAccounts, setGmailAccounts] = useState<GmailAccount[]>([])
  const [taskAccounts, setTaskAccounts] = useState<TaskAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [connectingGmail, setConnectingGmail] = useState(false)
  const [showConnectDialog, setShowConnectDialog] = useState(false)
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null)
  const [connectForm, setConnectForm] = useState({
    platform: '',
    accessToken: '',
    workspaceName: '',
    workspaceId: '',
    email: '',
  })

  useEffect(() => {
    fetchAccounts()
  }, [])

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

  async function handleConnectGmail() {
    setConnectingGmail(true)
    try {
      const response = await fetch('/api/gmail/oauth')
      if (response.ok) {
        const data = await response.json()
        window.location.href = data.authUrl
      } else {
        const error = await response.json()
        alert(`连接失败: ${error.error || '未知错误'}`)
      }
    } catch (error) {
      console.error('Failed to connect Gmail:', error)
      alert('连接 Gmail 失败，请重试')
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
      console.error('Failed to delete account:', error)
    }
  }

  async function handleConnectFeishu() {
    try {
      const response = await fetch('/api/feishu/oauth')
      if (response.ok) {
        const data = await response.json()
        window.location.href = data.data.authUrl
      }
    } catch (error) {
      console.error('Failed to connect Feishu:', error)
      alert('连接飞书失败，请重试')
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
      console.error('Failed to delete account:', error)
    }
  }

  function openConnectDialog(platform: string) {
    if (platform === 'FEISHU') {
      handleConnectFeishu()
    } else {
      setConnectForm({ platform, accessToken: '', workspaceName: '', workspaceId: '', email: '' })
      setShowConnectDialog(true)
    }
  }

  async function handleConnectPlatform() {
    if (!connectForm.accessToken) {
      alert('请输入 Access Token')
      return
    }

    if (connectForm.platform === 'NOTION' && !connectForm.workspaceId) {
      alert('请输入 Notion Database ID')
      return
    }

    setConnectingPlatform(connectForm.platform)
    try {
      const response = await fetch('/api/task-accounts/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: connectForm.platform,
          accessToken: connectForm.accessToken,
          workspaceName: connectForm.workspaceName || undefined,
          workspaceId: connectForm.workspaceId || undefined,
        }),
      })

      if (response.ok) {
        const newAccount = await response.json()
        setTaskAccounts([...taskAccounts, newAccount])
        setShowConnectDialog(false)
        setConnectForm({ platform: '', accessToken: '', workspaceName: '', workspaceId: '', email: '' })
      } else {
        const error = await response.json()
        alert(`连接失败: ${error.error || '未知错误'}`)
      }
    } catch (error) {
      console.error('Failed to connect platform:', error)
      alert('连接失败，请重试')
    } finally {
      setConnectingPlatform(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="bg-white border border-[#EBE9E4] h-48 animate-pulse" />
        <div className="bg-white border border-[#EBE9E4] h-64 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Gmail 账户 */}
      <section className="bg-white border border-[#EBE9E4] rounded-xl">
        <div className="px-8 py-6 border-b border-[#EBE9E4] flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-[#9E9C98] uppercase tracking-[0.2em] mb-1">
              邮箱
            </p>
            <h2 className="text-[20px] font-medium text-[#1A1918]">Gmail 账户</h2>
            <p className="text-[13px] text-[#9E9C98] mt-1">连接您的 Gmail 以扫描待办邮件</p>
          </div>
          <button
            onClick={handleConnectGmail}
            disabled={connectingGmail}
            className="inline-flex items-center gap-2 border border-[#1A1918] text-[#1A1918] px-5 py-2.5 rounded-lg text-[12px] font-medium tracking-wide hover:bg-[#1A1918] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {connectingGmail ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                连接中
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                添加账户
              </>
            )}
          </button>
        </div>

        <div className="p-8">
          {gmailAccounts.length === 0 ? (
            <div className="py-8 text-center">
              <Mail className="w-10 h-10 text-[#D4D2CD] mx-auto mb-3" />
              <p className="text-[14px] text-[#9E9C98]">还没有连接 Gmail 账户</p>
            </div>
          ) : (
            <div className="divide-y divide-[#F0EFEB]">
              {gmailAccounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#FAFAF8] flex items-center justify-center">
                      <Mail className="w-5 h-5 text-[#6B6966]" />
                    </div>
                    <div>
                      <p className="text-[14px] font-medium text-[#1A1918]">{account.email}</p>
                      <p className="text-[12px] text-[#9E9C98]">
                        {account.syncStatus === 'SUCCESS' ? '已同步' : '待同步'}
                        {account.lastSyncAt && ` · ${new Date(account.lastSyncAt).toLocaleDateString('zh-CN')}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteGmail(account.id)}
                    className="p-2 text-[#D4D2CD] hover:text-[#B85450] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 任务平台 */}
      <section className="bg-white border border-[#EBE9E4] rounded-xl">
        <div className="px-8 py-6 border-b border-[#EBE9E4]">
          <p className="text-[10px] font-semibold text-[#9E9C98] uppercase tracking-[0.2em] mb-1">
            同步
          </p>
          <h2 className="text-[20px] font-medium text-[#1A1918]">任务平台</h2>
          <p className="text-[13px] text-[#9E9C98] mt-1">连接您使用的任务管理平台</p>
        </div>

        <div className="p-8">
          {/* 平台选择 */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {Object.entries(platformConfig).map(([key, config]) => (
              config.disabled ? (
                <div
                  key={key}
                  className="p-5 border border-dashed border-[#D4D2CD] bg-[#FAFAF8] opacity-60"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-8 bg-[#F0EFEB] flex items-center justify-center font-semibold ${config.color}`}>
                      {config.icon}
                    </div>
                    <span className="text-[14px] font-medium text-[#1A1918]">{config.name}</span>
                  </div>
                  <p className="text-[12px] text-[#B1ADA1]">敬请期待</p>
                </div>
              ) : (
                <button
                  key={key}
                  onClick={() => openConnectDialog(key)}
                  className="p-5 border border-[#EBE9E4] hover:border-[#1A1918] rounded-lg hover:bg-[#FAFAF8] transition-all text-left group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-8 bg-[#F0EFEB] group-hover:bg-[#1A1918] flex items-center justify-center font-semibold ${config.color} group-hover:text-white transition-colors`}>
                      {config.icon}
                    </div>
                    <span className="text-[14px] font-medium text-[#1A1918]">{config.name}</span>
                  </div>
                  <p className="text-[12px] text-[#9E9C98] group-hover:text-[#6B6966] transition-colors">
                    点击连接 {config.name} 账户
                  </p>
                </button>
              )
            ))}
          </div>

          {/* 已连接账户 */}
          {taskAccounts.length > 0 && (
            <div className="border-t border-[#F0EFEB] pt-8">
              <p className="text-[10px] font-semibold text-[#9E9C98] uppercase tracking-[0.2em] mb-4">
                已连接
              </p>
              <div className="divide-y divide-[#F0EFEB]">
                {taskAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 bg-[#F0EFEB] flex items-center justify-center font-semibold ${
                        platformConfig[account.platform]?.color || 'text-[#6B6966]'
                      }`}>
                        {platformConfig[account.platform]?.icon || account.platform[0]}
                      </div>
                      <div>
                        <p className="text-[14px] font-medium text-[#1A1918]">
                          {platformConfig[account.platform]?.name || account.platform}
                        </p>
                        <p className="text-[12px] text-[#9E9C98]">
                          {account.email || account.workspaceName || '已连接'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[11px] font-medium ${
                        account.isActive ? 'text-[#4A7C59]' : 'text-[#9E9C98]'
                      }`}>
                        {account.isActive ? '活跃' : '未激活'}
                      </span>
                      <button
                        onClick={() => handleDeleteTask(account.id)}
                        className="p-2 text-[#D4D2CD] hover:text-[#B85450] transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 连接对话框 */}
      {showConnectDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white p-8 w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-medium text-[#1A1918]">
                连接 {platformConfig[connectForm.platform]?.name}
              </h3>
              <button
                onClick={() => setShowConnectDialog(false)}
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
                  value={connectForm.accessToken}
                  onChange={(e) => setConnectForm({ ...connectForm, accessToken: e.target.value })}
                  placeholder={
                    connectForm.platform === 'NOTION'
                      ? '输入 Notion Integration Token'
                      : '输入 Todoist API Token'
                  }
                  className="w-full px-0 py-2 border-0 border-b border-[#EBE9E4] focus:border-[#1A1918] focus:ring-0 text-[#1A1918] text-[15px]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#9E9C98] uppercase tracking-wider mb-2">
                  工作空间名称（可选）
                </label>
                <input
                  type="text"
                  value={connectForm.workspaceName}
                  onChange={(e) => setConnectForm({ ...connectForm, workspaceName: e.target.value })}
                  placeholder="例如：个人工作区"
                  className="w-full px-0 py-2 border-0 border-b border-[#EBE9E4] focus:border-[#1A1918] focus:ring-0 text-[#1A1918] text-[15px]"
                />
              </div>

              {connectForm.platform === 'NOTION' && (
                <div>
                  <label className="block text-[11px] font-semibold text-[#9E9C98] uppercase tracking-wider mb-2">
                    Database ID <span className="text-[#B85450]">*</span>
                  </label>
                  <input
                    type="text"
                    value={connectForm.workspaceId}
                    onChange={(e) => setConnectForm({ ...connectForm, workspaceId: e.target.value })}
                    placeholder="例如：1cbb4697b4108096997cf3f9a147afd0"
                    className="w-full px-0 py-2 border-0 border-b border-[#EBE9E4] focus:border-[#1A1918] focus:ring-0 text-[#1A1918] text-[15px]"
                  />
                </div>
              )}

              {/* 帮助说明 */}
              {connectForm.platform === 'NOTION' && (
                <div className="p-4 bg-[#FAFAF8] text-[12px] text-[#6B6966] space-y-3">
                  <div className="p-3 bg-[#C15F3C]/10 border border-[#C15F3C]/20">
                    <p className="font-medium text-[#C15F3C] text-[11px] mb-1">开始前请先在 Notion 创建一个 Database</p>
                    <p className="text-[11px] text-[#6B6966]">新建页面，输入 /database 创建空数据库</p>
                  </div>
                  <div>
                    <p className="font-medium text-[#1A1918] text-[11px] mb-1">步骤 1：获取 Integration Token</p>
                    <ol className="list-decimal list-inside text-[11px] space-y-0.5">
                      <li>访问 <a href="https://www.notion.so/my-integrations" target="_blank" className="text-[#C15F3C] hover:underline">notion.so/my-integrations</a></li>
                      <li>点击"新建集成"，填写名称后提交</li>
                      <li>复制"内部集成密钥"</li>
                    </ol>
                  </div>
                  <div>
                    <p className="font-medium text-[#1A1918] text-[11px] mb-1">步骤 2：获取 Database ID</p>
                    <ol className="list-decimal list-inside text-[11px] space-y-0.5">
                      <li>在 Notion 中打开要同步的数据库</li>
                      <li>查看浏览器地址栏 URL</li>
                      <li>复制 notion.so/ 后面到 ?v= 之间的字符串</li>
                    </ol>
                    <p className="text-[11px] mt-2 bg-white p-2">
                      示例：notion.so/user/<span className="text-[#C15F3C] font-medium">1cbb4697...</span>?v=xxx
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-[#1A1918] text-[11px] mb-1">步骤 3：连接集成</p>
                    <p className="text-[11px]">在数据库页面点击 ... → 连接 → 添加连接 → 选择集成</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowConnectDialog(false)}
                  className="flex-1 py-3 border border-[#EBE9E4] text-[#6B6966] text-[13px] font-medium hover:border-[#1A1918] hover:text-[#1A1918] transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleConnectPlatform}
                  disabled={connectingPlatform !== null || !connectForm.accessToken}
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
