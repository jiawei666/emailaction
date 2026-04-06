import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { analyzeEmail, analyzeEmails, quickCheckActionItems } from '@/lib/glm'

/**
 * POST /api/emails/analyze
 * 分析邮件内容，提取待办事项
 *
 * 请求体:
 * - mode: 'single' | 'batch' | 'quick'
 * - email: 单封邮件数据 (mode: 'single')
 * - emails: 邮件数组 (mode: 'batch')
 * - subject, snippet: 快速检查 (mode: 'quick')
 */
export async function POST(request: NextRequest) {
  try {
    // 验证用户登录状态
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { mode = 'single' } = body

    // 检查 GLM API 配置
    if (!process.env.GLM_API_KEY) {
      return NextResponse.json(
        { error: 'GLM API is not configured' },
        { status: 500 }
      )
    }

    switch (mode) {
      case 'single': {
        const { email } = body
        if (!email?.subject || !email?.body) {
          return NextResponse.json(
            { error: 'Missing required fields: subject, body' },
            { status: 400 }
          )
        }

        const analysis = await analyzeEmail(
          email.subject,
          email.body,
          email.from || '未知发件人',
          email.date
        )

        return NextResponse.json({
          success: true,
          data: analysis,
        })
      }

      case 'batch': {
        const { emails } = body
        if (!Array.isArray(emails) || emails.length === 0) {
          return NextResponse.json(
            { error: 'emails must be a non-empty array' },
            { status: 400 }
          )
        }

        // 限制批量处理数量
        if (emails.length > 10) {
          return NextResponse.json(
            { error: 'Maximum 10 emails per batch' },
            { status: 400 }
          )
        }

        const results = await analyzeEmails(
          emails.map((e: any) => ({
            id: e.id,
            subject: e.subject,
            body: e.body,
            from: e.from || '未知发件人',
            date: e.date,
          }))
        )

        // 转换 Map 为对象
        const resultsObject: Record<string, any> = {}
        results.forEach((value, key) => {
          resultsObject[key] = value
        })

        return NextResponse.json({
          success: true,
          data: resultsObject,
        })
      }

      case 'quick': {
        const { subject, snippet } = body
        if (!subject || !snippet) {
          return NextResponse.json(
            { error: 'Missing required fields: subject, snippet' },
            { status: 400 }
          )
        }

        const hasActionItems = await quickCheckActionItems(subject, snippet)

        return NextResponse.json({
          success: true,
          data: { hasActionItems },
        })
      }

      default:
        return NextResponse.json(
          { error: 'Invalid mode. Use "single", "batch", or "quick"' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Email analysis error:', error)
    return NextResponse.json(
      {
        error: 'Failed to analyze email',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
