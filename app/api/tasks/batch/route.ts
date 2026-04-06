import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/session'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const batchActionSchema = z.object({
  action: z.enum(['sync', 'ignore', 'delete']),
  taskIds: z.array(z.string()).min(1).max(50),
  taskAccountId: z.string().optional(),
})

/**
 * POST /api/tasks/batch
 * 批量操作任务
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()

    const { action, taskIds, taskAccountId } = batchActionSchema.parse(body)

    // 验证所有任务属于当前用户
    const tasks = await prisma.syncItem.findMany({
      where: {
        id: { in: taskIds },
        userId: user.id,
      },
    })

    if (tasks.length !== taskIds.length) {
      return NextResponse.json(
        { error: 'Some tasks not found or access denied' },
        { status: 404 }
      )
    }

    let successCount = 0
    let failedCount = 0
    const errors: Array<{ taskId: string; error: string }> = []

    if (action === 'sync') {
      // 批量同步
      if (!taskAccountId) {
        return NextResponse.json(
          { error: 'taskAccountId is required for sync action' },
          { status: 400 }
        )
      }

      // 验证任务账户属于当前用户
      const taskAccount = await prisma.taskAccount.findUnique({
        where: { id: taskAccountId },
      })

      if (!taskAccount || taskAccount.userId !== user.id) {
        return NextResponse.json(
          { error: 'Task account not found or access denied' },
          { status: 404 }
        )
      }

      // 更新所有任务的 taskAccountId 并触发同步
      for (const task of tasks) {
        try {
          await prisma.syncItem.update({
            where: { id: task.id },
            data: { taskAccountId },
          })

          // 触发同步（在后台进行）
          fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/tasks/${task.id}/sync`, {
            method: 'POST',
          }).catch(() => {})

          successCount++
        } catch (error) {
          failedCount++
          errors.push({
            taskId: task.id,
            error: error instanceof Error ? error.message : 'Unknown error',
          })
        }
      }
    } else if (action === 'ignore' || action === 'delete') {
      // 批量忽略/删除
      for (const task of tasks) {
        try {
          await prisma.syncItem.delete({
            where: { id: task.id },
          })
          successCount++
        } catch (error) {
          failedCount++
          errors.push({
            taskId: task.id,
            error: error instanceof Error ? error.message : 'Unknown error',
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        total: taskIds.length,
        success: successCount,
        failed: failedCount,
        errors: errors.length > 0 ? errors : undefined,
      },
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid parameters', details: error.errors },
        { status: 400 }
      )
    }
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(
      { error: error.message || 'Batch operation failed' },
      { status: 500 }
    )
  }
}
