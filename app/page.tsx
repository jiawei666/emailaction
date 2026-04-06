'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { ParallaxBackground } from '@/components/ParallaxBackground'
import { Logo } from '@/components/logo'

function ScrollReveal({
  children,
  className = '',
  delay = 0
}: {
  children: React.ReactNode
  className?: string
  delay?: 0 | 1 | 2 | 3 | 4
}) {
  const { ref, isVisible } = useScrollReveal(0.1)
  const delayClass = delay ? `scroll-reveal-delay-${delay}` : ''

  return (
    <div
      ref={ref}
      className={`scroll-reveal ${delayClass} ${isVisible ? 'is-visible' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

export default function HomePage() {
  const { data: session, status } = useSession()

  return (
    <main className="min-h-screen bg-[#F4F3EE] relative">
      {/* Parallax Background */}
      <ParallaxBackground />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#F4F3EE]/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-8 lg:px-16 py-5 flex items-center justify-between">
          <Logo size="md" />
          <nav className="flex items-center gap-6">
            {status === 'authenticated' && session ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm text-[#6B6966] hover:text-[#1A1918] transition-colors"
                >
                  控制台
                </Link>
                <Link
                  href="/dashboard"
                  className="bg-[#C15F3C] hover:bg-[#A64D2E] text-white text-sm px-5 py-2.5 rounded-full font-medium transition-all duration-300"
                >
                  进入控制台
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="text-sm text-[#6B6966] hover:text-[#1A1918] transition-colors"
                >
                  登录
                </Link>
                <Link
                  href="/auth/signin"
                  className="bg-[#C15F3C] hover:bg-[#A64D2E] text-white text-sm px-5 py-2.5 rounded-full font-medium transition-all duration-300"
                >
                  开始使用
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-8 lg:px-16 pt-20 relative">
        <div className="max-w-6xl mx-auto w-full text-center">
          {/* Tag */}
          <ScrollReveal delay={1}>
            <p className="text-xs tracking-[0.3em] text-[#9E9C98] uppercase mb-8">
              Email × Task × AI
            </p>
          </ScrollReveal>

          {/* Main Title */}
          <ScrollReveal delay={2}>
            <h1 className="text-5xl lg:text-7xl font-medium text-[#1A1918] leading-[1.05] mb-6">
              邮件里的待办
              <br />
              <span className="text-[#C15F3C]">自动进入任务列表</span>
            </h1>
          </ScrollReveal>

          {/* Description */}
          <ScrollReveal delay={3}>
            <p className="text-lg text-[#6B6966] leading-relaxed max-w-md mx-auto mb-10">
              AI 从邮件中识别待办事项，
              <br />
              一键同步到 Notion 或飞书
            </p>
          </ScrollReveal>

          {/* CTA */}
          <ScrollReveal delay={4}>
            <div className="flex items-center justify-center gap-6">
              <Link
                href={status === 'authenticated' ? '/dashboard' : '/auth/signin'}
                className="inline-flex items-center gap-2 bg-[#C15F3C] hover:bg-[#A64D2E] text-white px-8 py-4 rounded-full font-medium transition-all duration-300 hover:shadow-xl hover:shadow-[#C15F3C]/20"
              >
                {status === 'authenticated' ? '进入控制台' : '开始使用'}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#intelligence"
                className="text-[#6B6966] hover:text-[#C15F3C] transition-colors group"
              >
                了解更多
                <ArrowRight className="w-4 h-4 inline ml-1 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </ScrollReveal>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#9E9C98]">
          <span className="text-xs tracking-[0.2em] uppercase">Scroll</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </div>
      </section>

      {/* Section 2: Intelligence */}
      <section id="intelligence" className="min-h-screen flex items-center px-8 lg:px-16 py-24">
        <div className="max-w-6xl mx-auto w-full">
          {/* Tag */}
          <ScrollReveal>
            <p className="text-xs tracking-[0.3em] text-[#9E9C98] uppercase mb-8">
              Intelligence
            </p>
          </ScrollReveal>

          {/* Title */}
          <ScrollReveal delay={1}>
            <h2 className="text-5xl lg:text-7xl font-medium text-[#1A1918] leading-[1.05] mb-8">
              不遗漏任何
              <br />
              <span className="text-[#C15F3C]">重要事项</span>
            </h2>
          </ScrollReveal>

          {/* Divider */}
          <ScrollReveal delay={2}>
            <div className="border-t border-[#E8E6E1] w-24 mb-8" />
          </ScrollReveal>

          {/* Keywords */}
          <ScrollReveal delay={2}>
            <p className="text-lg text-[#1A1918] font-medium mb-4">
              邮件内容 · 截止日期 · 优先级
            </p>
          </ScrollReveal>

          {/* Description */}
          <ScrollReveal delay={3}>
            <p className="text-lg text-[#6B6966] leading-relaxed max-w-lg">
              AI 自动分析邮件，提取待办事项、截止日期和优先级，
              <br />
              你只需要确认即可
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Section 3: Sync */}
      <section className="min-h-screen flex items-center px-8 lg:px-16 py-24">
        <div className="max-w-6xl mx-auto w-full">
          {/* Tag */}
          <ScrollReveal>
            <p className="text-xs tracking-[0.3em] text-[#9E9C98] uppercase mb-8">
              Sync
            </p>
          </ScrollReveal>

          {/* Title */}
          <ScrollReveal delay={1}>
            <h2 className="text-5xl lg:text-7xl font-medium text-[#1A1918] leading-[1.05] mb-8">
              一键同步
              <br />
              <span className="text-[#C15F3C]">到你的工具</span>
            </h2>
          </ScrollReveal>

          {/* Platform Cards */}
          <ScrollReveal delay={2}>
            <div className="flex gap-6 mt-12">
              {/* Notion */}
              <div className="w-40 h-40 bg-white border border-[#E8E6E1] rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-[#B1ADA1] transition-colors">
                <div className="w-12 h-12 bg-[#C15F3C]/10 rounded-xl flex items-center justify-center">
                  <span className="text-2xl font-bold text-[#C15F3C]">N</span>
                </div>
                <span className="text-sm font-medium text-[#1A1918]">Notion</span>
              </div>

              {/* 飞书 */}
              <div className="w-40 h-40 bg-white border border-[#E8E6E1] rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-[#B1ADA1] transition-colors">
                <div className="w-12 h-12 bg-[#4A7C59]/10 rounded-xl flex items-center justify-center">
                  <span className="text-2xl font-bold text-[#4A7C59]">飞</span>
                </div>
                <span className="text-sm font-medium text-[#1A1918]">飞书</span>
              </div>
            </div>
          </ScrollReveal>

          {/* Coming soon */}
          <ScrollReveal delay={3}>
            <p className="text-sm text-[#9E9C98] mt-8">
              支持更多平台 <span className="text-[#C15F3C]">Coming soon...</span>
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA Section */}
      <section className="min-h-[60vh] flex items-center justify-center px-8 lg:px-16 py-24 bg-[#1A1918]">
        <div className="text-center">
          <ScrollReveal>
            <p className="text-xs tracking-[0.3em] text-[#6B6966] uppercase mb-8">
              Start Now
            </p>
          </ScrollReveal>
          <ScrollReveal delay={1}>
            <h2 className="text-4xl lg:text-5xl font-medium text-white leading-[1.1] mb-6">
              准备好了吗？
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={2}>
            <p className="text-[#9E9C98] mb-10">
              免费开始使用，无需信用卡
            </p>
          </ScrollReveal>
          <ScrollReveal delay={3}>
            <Link
              href={status === 'authenticated' ? '/dashboard' : '/auth/signin'}
              className="inline-flex items-center gap-2 bg-[#C15F3C] hover:bg-[#A64D2E] text-white px-8 py-4 rounded-full font-medium transition-all duration-300 hover:shadow-xl hover:shadow-[#C15F3C]/30"
            >
              {status === 'authenticated' ? '进入控制台' : '立即开始'}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-8 lg:px-16 border-t border-[#E8E6E1]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <Logo size="sm" />
            <p className="text-sm text-[#9E9C98] mt-2">把邮件变成行动</p>
          </div>
          <div className="flex items-center gap-6 text-sm text-[#6B6966]">
            <Link href="/privacy" className="hover:text-[#1A1918] transition-colors">隐私权政策</Link>
            <Link href="/terms" className="hover:text-[#1A1918] transition-colors">服务条款</Link>
          </div>
          <p className="text-sm text-[#9E9C98]">© 2026 EmailAction</p>
        </div>
      </footer>
    </main>
  )
}
