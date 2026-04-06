import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '隐私权政策 - EmailAction',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-semibold text-[#1A1918] mb-8">隐私权政策</h1>

        <div className="prose prose-stone max-w-none">
          <p className="text-sm text-[#6B6966] mb-8">最后更新日期：2025年1月</p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1A1918] mb-4">1. 信息收集</h2>
            <p className="text-[#6B6966] leading-relaxed">
              EmailAction 收集以下信息以提供服务：
            </p>
            <ul className="list-disc list-inside text-[#6B6966] mt-2 space-y-1">
              <li>账户信息：电子邮件地址、姓名（通过 Google/GitHub OAuth）</li>
              <li>Gmail 数据：邮件内容用于提取待办事项（仅在您授权后）</li>
              <li>使用数据：操作日志用于改进服务</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1A1918] mb-4">2. 信息使用</h2>
            <p className="text-[#6B6966] leading-relaxed">
              我们使用收集的信息用于：
            </p>
            <ul className="list-disc list-inside text-[#6B6966] mt-2 space-y-1">
              <li>分析邮件内容并提取待办事项</li>
              <li>将任务同步到您授权的任务平台</li>
              <li>提供客户支持</li>
              <li>改进产品功能</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1A1918] mb-4">3. 信息共享</h2>
            <p className="text-[#6B6966] leading-relaxed">
              我们不会出售您的个人信息。仅在以下情况下共享信息：
            </p>
            <ul className="list-disc list-inside text-[#6B6966] mt-2 space-y-1">
              <li>经您明确授权（如同步到 Notion）</li>
              <li>法律要求或保护我们权益时</li>
              <li>与服务提供商共享（他们受保密协议约束）</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1A1918] mb-4">4. 数据安全</h2>
            <p className="text-[#6B6966] leading-relaxed">
              我们采取合理措施保护您的数据，包括加密传输、访问控制和安全存储。但请注意，互联网传输无法保证 100% 安全。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1A1918] mb-4">5. 数据保留</h2>
            <p className="text-[#6B6966] leading-relaxed">
              您可以随时删除您的账户和相关数据。删除后，我们会在 30 天内从活跃系统中清除您的数据。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1A1918] mb-4">6. 您的权利</h2>
            <p className="text-[#6B6966] leading-relaxed">
              您有权：
            </p>
            <ul className="list-disc list-inside text-[#6B6966] mt-2 space-y-1">
              <li>访问和下载您的个人数据</li>
              <li>更正不准确的信息</li>
              <li>删除您的账户和数据</li>
              <li>撤销第三方服务授权</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1A1918] mb-4">7. Cookie 政策</h2>
            <p className="text-[#6B6966] leading-relaxed">
              我们使用 Cookie 来保持登录状态和记住您的偏好设置。您可以通过浏览器设置管理 Cookie。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1A1918] mb-4">8. 联系我们</h2>
            <p className="text-[#6B6966] leading-relaxed">
              如有隐私相关问题，请联系：
            </p>
            <p className="text-[#6B6966] mt-2">
              邮箱：privacy@emailaction.vercel.app
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
