import { Suspense } from 'react'
import { AccountManagement } from '@/components/account-management'

export default function AccountsPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Header */}
      <div className="border-b border-[#EBE9E4] bg-white">
        <div className="max-w-5xl mx-auto px-10 py-10">
          <p className="text-[10px] font-semibold text-[#9E9C98] uppercase tracking-[0.2em] mb-2">
            设置
          </p>
          <h1 className="text-[28px] font-semibold text-[#1A1918] tracking-tight">
            账户管理
          </h1>
          <p className="mt-2 text-[14px] text-[#6B6966]">
            管理您的 Gmail 和任务平台账户
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-10 py-8">
        <Suspense fallback={<div className="bg-white border border-[#EBE9E4] h-64 animate-pulse" />}>
          <AccountManagement />
        </Suspense>
      </div>
    </div>
  )
}
