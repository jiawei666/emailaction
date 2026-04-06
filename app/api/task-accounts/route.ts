import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/session'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const createAccountSchema = z.object({
  platform: z.enum(['FEISHU', 'NOTION', 'TODOIST']),
  accountId: z.string(),
  email: z.string().optional(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  workspaceId: z.string().optional(),
  workspaceName: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

/**
 * 获取用户的任务平台账户列表
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()

    const accounts = await prisma.taskAccount.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(accounts)
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: error.message || 'Failed to fetch accounts' }, { status: 500 })
  }
}

/**
 * 创建任务平台账户
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()

    const data = createAccountSchema.parse(body)

    const account = await prisma.taskAccount.create({
      data: {
        userId: user.id,
        platform: data.platform,
        accountId: data.accountId,
        email: data.email,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        workspaceId: data.workspaceId,
        workspaceName: data.workspaceName,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      },
    })

    return NextResponse.json(account, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid parameters', details: error.errors }, { status: 400 })
    }
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // 唯一约束冲突
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Account already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message || 'Failed to create account' }, { status: 500 })
  }
}

/**
 * 删除任务平台账户
 */
export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(req.url)
    const accountId = searchParams.get('id')

    if (!accountId) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 })
    }

    const account = await prisma.taskAccount.findUnique({
      where: { id: accountId },
    })

    if (!account || account.userId !== user.id) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    await prisma.taskAccount.delete({
      where: { id: accountId },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: error.message || 'Failed to delete account' }, { status: 500 })
  }
}
