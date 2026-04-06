'use client'

import { signIn, useSession } from 'next-auth/react'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Logo } from '@/components/logo'

function SignInContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false)
  const [isLoadingGitHub, setIsLoadingGitHub] = useState(false)
  const [error, setError] = useState<string>('')

  // 获取 callbackUrl，默认为 /dashboard
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  // 问题1修复：如果已登录，重定向到 dashboard 或 callbackUrl
  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push(callbackUrl)
    }
  }, [status, session, router, callbackUrl])

  const handleGoogleSignIn = async () => {
    setIsLoadingGoogle(true)
    setError('')

    try {
      await signIn('google', { callbackUrl })
    } catch (err) {
      setError('登录失败，请重试')
      setIsLoadingGoogle(false)
    }
  }

  const handleGitHubSignIn = async () => {
    setIsLoadingGitHub(true)
    setError('')

    try {
      await signIn('github', { callbackUrl })
    } catch (err) {
      setError('登录失败，请重试')
      setIsLoadingGitHub(false)
    }
  }

  // 加载中或已登录时显示加载状态
  if (status === 'loading' || status === 'authenticated') {
    return (
      <main className="min-h-screen bg-[#F4F3EE] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C15F3C] border-t-transparent rounded-full animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F4F3EE] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" showText={false} />
          </div>
          <h1 className="text-2xl font-semibold text-[#1A1918] mb-2">
            欢迎使用 <span className="text-[#C15F3C]">EmailAction</span>
          </h1>
          <p className="text-[#6B6966]">
            连接您的 Gmail 账户开始使用
          </p>
        </div>

        {/* 登录卡片 */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E8E6E1] p-8">
          {/* Google 登录按钮 */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoadingGoogle || isLoadingGitHub}
            className="w-full flex items-center justify-center gap-3 bg-white border border-[#E8E6E1] hover:border-[#B1ADA1] hover:bg-[#F4F3EE] text-[#1A1918] px-6 py-4 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingGoogle ? (
              <div className="w-5 h-5 border-2 border-[#C15F3C] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>使用 Google 继续</span>
              </>
            )}
          </button>

          {/* 分割线 */}
          <div className="my-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E8E6E1]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-[#9E9C98]">或</span>
            </div>
          </div>

          {/* GitHub 登录按钮 */}
          <button
            onClick={handleGitHubSignIn}
            disabled={isLoadingGoogle || isLoadingGitHub}
            className="w-full flex items-center justify-center gap-3 bg-[#1A1918] hover:bg-[#2D2A26] text-white px-6 py-4 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingGitHub ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span>使用 GitHub 继续</span>
              </>
            )}
          </button>

          {/* 错误提示 */}
          {error && (
            <div className="mt-4 p-3 bg-[#FEE2E2] text-[#B85450] text-sm rounded-lg text-center">
              {error}
            </div>
          )}

          {/* 分割线 */}
          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E8E6E1]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-[#9E9C98]">安全加密</span>
            </div>
          </div>

          {/* 安全说明 */}
          <div className="mt-6 space-y-2 text-sm text-[#9E9C98]">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-[#4A7C59] mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <p>您的数据安全存储，我们不会读取您的邮件内容</p>
            </div>
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-[#4A7C59] mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M2.166 4.999A11.954 11.954 0 0010 1.944c11.954 0 11.954 11.954 0 10.844a11.954 11.954 0 01-7.834-1.945zM10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <p>仅使用 Gmail 只读权限访问您的邮件</p>
            </div>
          </div>
        </div>

        {/* 返回首页链接 */}
        <p className="text-center mt-8 text-sm text-[#9E9C98]">
          <a href="/" className="hover:text-[#1A1918] transition-colors">
            ← 返回首页
          </a>
        </p>
      </div>
    </main>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#F4F3EE] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C15F3C] border-t-transparent rounded-full animate-spin" />
      </main>
    }>
      <SignInContent />
    </Suspense>
  )
}
