import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/session'
import { prisma } from '@/lib/db'

/**
 * 重试失败的同步任务
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params

    const task = await prisma.syncItem.findUnique({
      where: { id },
    })

    if (!task || task.userId !== user.id) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    if (task.status !== 'FAILED') {
      return NextResponse.json({ error: 'Only failed tasks can be retried' }, { status: 400 })
    }

    // 重置状态为待处理
    const updated = await prisma.syncItem.update({
      where: { id },
      data: {
        status: 'PENDING',
        error: null,
        retryCount: 0,
      },
    })

    // 触发同步
    await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/tasks/${id}/sync`, {
      method: 'POST',
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: error.message || 'Retry failed' }, { status: 500 })
  }
}
