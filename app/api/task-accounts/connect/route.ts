import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/session'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const connectSchema = z.object({
  platform: z.enum(['NOTION', 'TODOIST', 'FEISHU']),
  accessToken: z.string().min(1),
  workspaceName: z.string().optional(),
  workspaceId: z.string().optional(), // Notion Database ID
  email: z.string().email().optional(),
})

/**
 * 手动连接任务平台（通过 API Token）
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()

    const { platform, accessToken, workspaceName, workspaceId, email } = connectSchema.parse(body)

    // 验证 token 有效性
    let isValid = false
    let accountId = ''

    if (platform === 'NOTION') {
      // 验证 Notion token
      const res = await fetch('https://api.notion.com/v1/users/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Notion-Version': '2022-06-28',
        },
      })
      if (res.ok) {
        const data = await res.json()
        accountId = data.id || 'notion-user'
        isValid = true
      }
    } else if (platform === 'TODOIST') {
      // 验证 Todoist token
      const res = await fetch('https://api.todoist.com/rest/v2/user', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })
      if (res.ok) {
        const data = await res.json()
        accountId = String(data.id)
        isValid = true
      }
    } else if (platform === 'FEISHU') {
      // 飞书需要通过 OAuth 流程，不支持手动 token
      return NextResponse.json(
        { error: '飞书请使用 OAuth 连接' },
        { status: 400 }
      )
    }

    if (!isValid) {
      return NextResponse.json(
        { error: 'Token 无效或已过期' },
        { status: 400 }
      )
    }

    // 保存或更新任务账户
    const taskAccount = await prisma.taskAccount.upsert({
      where: {
        userId_platform_accountId: {
          userId: user.id,
          platform,
          accountId,
        },
      },
      create: {
        userId: user.id,
        platform,
        accountId,
        accessToken,
        workspaceName,
        workspaceId,
        email,
        isActive: true,
      },
      update: {
        accessToken,
        workspaceName,
        workspaceId,
        email,
        isActive: true,
      },
    })

    return NextResponse.json(taskAccount)
  } catch (error: any) {
    console.error('Failed to connect task platform:', error)
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: '参数无效', details: error.errors },
        { status: 400 }
      )
    }
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }
    return NextResponse.json(
      { error: error.message || '连接失败' },
      { status: 500 }
    )
  }
}
