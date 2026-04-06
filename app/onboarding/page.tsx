'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  CheckCircle2,
  ChevronRight,
  Loader2,
  ArrowLeft,
  Sparkles,
  Mail,
} from 'lucide-react'
import Link from 'next/link'
import { Logo } from '@/components/logo'

interface OnboardingStatus {
  isCompleted: boolean
  currentStep: number
  steps: {
    gmail: { completed: boolean; count: number }
    taskPlatform: { completed: boolean; count: number }
    firstScan: { completed: boolean; count: number }
  }
}

const steps = [
  {
    id: 1,
    title: '连接 Gmail',
    description: '授权访问您的邮箱，让我们帮助您管理邮件中的待办事项',
    icon: Mail,
    key: 'gmail' as const,
  },
  {
    id: 2,
    title: '连接任务平台',
    description: '选择您常用的任务管理工具，待办事项将自动同步到这里',
    icon: CheckCircle2,
    key: 'taskPlatform' as const,
  },
  {
    id: 3,
    title: '首次扫描邮件',
    description: '扫描最近 7 天的邮件，AI 将识别其中的待办事项',
    icon: Sparkles,
    key: 'firstScan' as const,
  },
]

const taskPlatforms = [
  { id: 'feishu', name: '飞书', color: 'bg-[#00D6B9]' },
  { id: 'notion', name: 'Notion', color: 'bg-[#000000]' },
  { id: 'todoist', name: 'Todoist', color: 'bg-[#E44332]' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [statusData, setStatusData] = useState<OnboardingStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [scanResult, setScanResult] = useState<{ found: number; synced: number } | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin')
    } else if (status === 'authenticated') {
      fetchStatus()
    }
  }, [status, router])

  useEffect(() => {
    if (statusData?.isCompleted) {
      router.push('/dashboard')
    }
  }, [statusData, router])

  async function fetchStatus() {
    try {
      const response = await fetch('/api/onboarding/status')
      if (response.ok) {
        const data = await response.json()
        setStatusData(data)
      }
    } catch (error) {
      console.error('Failed to fetch onboarding status:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleGmailConnect() {
    // 触发 Google OAuth，需要 Gmail 权限
    router.push('/auth/signin?callbackUrl=/onboarding')
  }

  async function handleTaskPlatformConnect(platform: string) {
    // 根据不同平台跳转到对应的 OAuth 页面
    if (platform === 'feishu') {
      router.push('/api/feishu/oauth?callbackUrl=/onboarding')
    } else if (platform === 'notion') {
      // TODO: 实现 Notion OAuth
      alert('Notion 集成即将推出')
    } else if (platform === 'todoist') {
      // TODO: 实现 Todoist OAuth
      alert('Todoist 集成即将推出')
    }
  }

  async function handleFirstScan() {
    setScanning(true)
    setScanResult(null)

    try {
      const response = await fetch('/api/onboarding/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'is:unread',
          days: 7,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setScanResult({ found: data.found || 0, synced: data.synced || 0 })

        // 扫描完成后刷新状态
        setTimeout(() => {
          fetchStatus()
        }, 1000)
      } else {
        const error = await response.json()
        alert(`扫描失败: ${error.error || '未知错误'}`)
      }
    } catch (error) {
      console.error('Scan error:', error)
      alert('扫描失败，请重试')
    } finally {
      setScanning(false)
    }
  }

  if (loading || !statusData) {
    return (
      <div className="min-h-screen bg-[#F4F3EE] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C15F3C]" />
      </div>
    )
  }

  const currentStepData = steps[statusData.currentStep - 1] || steps[0]

  return (
    <div className="min-h-screen bg-[#F4F3EE]">
      {/* 顶部导航 */}
      <header className="bg-white border-b border-[#E8E6E1]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-[#6B6966] hover:text-[#1A1918] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">返回</span>
          </Link>
          <Logo size="sm" />
          <div className="w-16" /> {/* 占位保持居中 */}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-16">
        {/* 进度指示器 */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => {
              const stepNumber = index + 1
              const isCompleted = stepNumber < statusData.currentStep
              const isCurrent = stepNumber === statusData.currentStep

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all ${
                        isCompleted
                          ? 'bg-[#4A7C59] text-white'
                          : isCurrent
                            ? 'bg-[#C15F3C] text-white'
                            : 'bg-white border-2 border-[#E8E6E1] text-[#9E9C98]'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <span>{stepNumber}</span>
                      )}
                    </div>
                    <span
                      className={`text-xs mt-2 font-medium ${
                        isCurrent ? 'text-[#C15F3C]' : isCompleted ? 'text-[#4A7C59]' : 'text-[#9E9C98]'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-2 transition-colors ${
                        isCompleted ? 'bg-[#4A7C59]' : 'bg-[#E8E6E1]'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* 当前步骤内容 */}
        <div className="bg-white rounded-xl p-8 shadow-card border border-[#E8E6E1]">
          <div className="flex items-start gap-4 mb-6">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                statusData.currentStep > 3
                  ? 'bg-[#4A7C59]/10'
                  : 'bg-[#C15F3C]/10'
              }`}
            >
              <currentStepData.icon
                className={`w-6 h-6 ${
                  statusData.currentStep > 3 ? 'text-[#4A7C59]' : 'text-[#C15F3C]'
                }`}
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#1A1918] mb-2">
                {currentStepData.title}
              </h2>
              <p className="text-[#6B6966]">{currentStepData.description}</p>
            </div>
          </div>

          {/* Step 1: Gmail 连接 */}
          {statusData.currentStep === 1 && (
            <div className="space-y-4">
              <button
                onClick={handleGmailConnect}
                className="w-full flex items-center justify-between p-4 border border-[#E8E6E1] rounded-lg hover:border-[#C15F3C] hover:bg-[#C15F3C]/5 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-[#E8E6E1]">
                    <Mail className="w-5 h-5 text-[#EA4335]" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-[#1A1918]">连接 Gmail</p>
                    <p className="text-sm text-[#6B6966]">使用 Google 账户授权</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#9E9C98] group-hover:text-[#C15F3C] transition-colors" />
              </button>

              {statusData.steps.gmail.count > 0 && (
                <div className="flex items-center gap-2 p-3 bg-[#4A7C59]/10 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-[#4A7C59]" />
                  <span className="text-sm text-[#4A7C59]">
                    已连接 {statusData.steps.gmail.count} 个 Gmail 账户
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Step 2: 任务平台连接 */}
          {statusData.currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid gap-3">
                {taskPlatforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => handleTaskPlatformConnect(platform.id)}
                    className="flex items-center justify-between p-4 border border-[#E8E6E1] rounded-lg hover:border-[#C15F3C] hover:bg-[#C15F3C]/5 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${platform.color}`}>
                        <span className="text-white text-xs font-bold">
                          {platform.name[0]}
                        </span>
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-[#1A1918]">{platform.name}</p>
                        <p className="text-sm text-[#6B6966]">同步待办到此平台</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#9E9C98] group-hover:text-[#C15F3C] transition-colors" />
                  </button>
                ))}
              </div>

              {statusData.steps.taskPlatform.count > 0 && (
                <div className="flex items-center gap-2 p-3 bg-[#4A7C59]/10 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-[#4A7C59]" />
                  <span className="text-sm text-[#4A7C59]">
                    已连接 {statusData.steps.taskPlatform.count} 个任务平台
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Step 3: 首次扫描 */}
          {statusData.currentStep === 3 && (
            <div className="space-y-6">
              <div className="p-4 bg-[#F4F3EE] rounded-lg">
                <p className="text-sm text-[#6B6966]">
                  我们将扫描您最近 7 天的未读邮件，AI 会识别其中的待办事项并同步到您选择的任务平台。
                </p>
              </div>

              <button
                onClick={handleFirstScan}
                disabled={scanning}
                className="w-full bg-[#C15F3C] hover:bg-[#A64D2E] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {scanning ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    扫描中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    开始扫描邮件
                  </>
                )}
              </button>

              {scanResult && (
                <div className="p-4 bg-[#4A7C59]/10 rounded-lg">
                  <p className="text-sm font-medium text-[#4A7C59] mb-2">
                    <CheckCircle2 className="w-4 h-4 inline mr-1" />
                    扫描完成！
                  </p>
                  <p className="text-sm text-[#6B6966]">
                    发现 {scanResult.found} 封待办邮件，已同步 {scanResult.synced} 个任务
                  </p>
                </div>
              )}

              {statusData.steps.firstScan.count > 0 && !scanResult && (
                <div className="flex items-center gap-2 p-3 bg-[#4A7C59]/10 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-[#4A7C59]" />
                  <span className="text-sm text-[#4A7C59]">
                    已扫描并同步 {statusData.steps.firstScan.count} 个待办事项
                  </span>
                </div>
              )}
            </div>
          )}

          {/* 完成 */}
          {statusData.currentStep > 3 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-[#4A7C59] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#1A1918] mb-2">
                设置完成！
              </h3>
              <p className="text-[#6B6966] mb-6">
                您现在可以开始使用 EmailAction 了
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-[#C15F3C] hover:bg-[#A64D2E] text-white py-3 px-6 rounded-lg font-medium transition-colors"
              >
                前往控制台
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* 跳过按钮 */}
        {statusData.currentStep <= 3 && (
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-sm text-[#9E9C98] hover:text-[#6B6966] transition-colors"
            >
              稍后再说，跳过引导
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
