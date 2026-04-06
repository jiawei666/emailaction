import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/session'
import { prisma } from '@/lib/db'

/**
 * 获取同步项目列表
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const limit = Number(searchParams.get('limit')) || 20

    const where: any = { userId: user.id }
    if (status) {
      where.status = status
    }

    const tasks = await prisma.syncItem.findMany({
      where,
      include: {
        gmailAccount: {
          select: { email: true },
        },
        taskAccount: {
          select: { platform: true, workspaceName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    // 统计各状态数量
    const stats = await prisma.syncItem.groupBy({
      by: ['status'],
      where: { userId: user.id },
      _count: true,
    })

    return NextResponse.json({
      tasks,
      stats: stats.reduce((acc, item) => {
        acc[item.status] = item._count
        return acc
      }, {} as Record<string, number>),
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: error.message || 'Failed to fetch tasks' }, { status: 500 })
  }
}

/**
 * 创建同步项目
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()

    const { gmailAccountId, taskAccountId, gmailMessageId, title, description, dueDate, priority } = body

    if (!gmailAccountId || !taskAccountId || !gmailMessageId || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: gmailAccountId, taskAccountId, gmailMessageId, title' },
        { status: 400 }
      )
    }

    // 验证账户所有权
    const [gmailAccount, taskAccount] = await Promise.all([
      prisma.gmailAccount.findUnique({ where: { id: gmailAccountId } }),
      prisma.taskAccount.findUnique({ where: { id: taskAccountId } }),
    ])

    if (!gmailAccount || gmailAccount.userId !== user.id) {
      return NextResponse.json({ error: 'Gmail account not found' }, { status: 404 })
    }

    if (!taskAccount || taskAccount.userId !== user.id) {
      return NextResponse.json({ error: 'Task account not found' }, { status: 404 })
    }

    const syncItem = await prisma.syncItem.create({
      data: {
        userId: user.id,
        gmailAccountId,
        taskAccountId,
        gmailMessageId,
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority,
        status: 'PENDING',
      },
    })

    return NextResponse.json(syncItem, { status: 201 })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: error.message || 'Failed to create task' }, { status: 500 })
  }
}
