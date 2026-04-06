import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '服务条款 - EmailAction',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-semibold text-[#1A1918] mb-8">服务条款</h1>

        <div className="prose prose-stone max-w-none">
          <p className="text-sm text-[#6B6966] mb-8">最后更新日期：2025年1月</p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1A1918] mb-4">1. 服务说明</h2>
            <p className="text-[#6B6966] leading-relaxed">
              EmailAction 是一项帮助用户从电子邮件中提取待办事项并同步到任务管理工具的服务。使用本服务即表示您同意以下条款。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1A1918] mb-4">2. 账户注册</h2>
            <p className="text-[#6B6966] leading-relaxed">
              您需要通过 Google 或 GitHub 账户登录使用本服务。您负责保护账户安全，并对账户下的所有活动负责。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1A1918] mb-4">3. 可接受使用</h2>
            <p className="text-[#6B6966] leading-relaxed">
              您同意不会：
            </p>
            <ul className="list-disc list-inside text-[#6B6966] mt-2 space-y-1">
              <li>违反任何法律法规</li>
              <li>侵犯他人权利</li>
              <li>传播恶意软件或垃圾邮件</li>
              <li>试图破坏或干扰服务</li>
              <li>未经授权访问他人数据</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1A1918] mb-4">4. 服务变更</h2>
            <p className="text-[#6B6966] leading-relaxed">
              我们保留随时修改、暂停或终止服务的权利，恕不另行通知。重大变更将通知用户。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1A1918] mb-4">5. 免责声明</h2>
            <p className="text-[#6B6966] leading-relaxed">
              本服务按"现状"提供，不提供任何明示或暗示的保证。我们不保证服务将不间断、无错误或完全准确。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1A1918] mb-4">6. 责任限制</h2>
            <p className="text-[#6B6966] leading-relaxed">
              在法律允许的最大范围内，EmailAction 不对任何间接、偶然、特殊或后果性损害承担责任。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1A1918] mb-4">7. 知识产权</h2>
            <p className="text-[#6B6966] leading-relaxed">
              EmailAction 及其所有内容、功能和设计均受版权、商标和其他知识产权法保护。未经许可，不得复制或分发。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1A1918] mb-4">8. 第三方服务</h2>
            <p className="text-[#6B6966] leading-relaxed">
              本服务可能集成第三方服务（如 Google、Notion）。使用这些服务受其各自条款约束。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1A1918] mb-4">9. 条款变更</h2>
            <p className="text-[#6B6966] leading-relaxed">
              我们可能会更新本条款。继续使用服务即表示接受更新后的条款。重大变更将通过邮件通知。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1A1918] mb-4">10. 终止</h2>
            <p className="text-[#6B6966] leading-relaxed">
              您可以随时删除账户终止使用。我们保留因违反条款而终止或暂停您账户的权利。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1A1918] mb-4">11. 适用法律</h2>
            <p className="text-[#6B6966] leading-relaxed">
              本条款受中华人民共和国法律管辖，并按其解释。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-[#1A1918] mb-4">12. 联系我们</h2>
            <p className="text-[#6B6966] leading-relaxed">
              如有条款相关问题，请联系：
            </p>
            <p className="text-[#6B6966] mt-2">
              邮箱：legal@emailaction.vercel.app
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
