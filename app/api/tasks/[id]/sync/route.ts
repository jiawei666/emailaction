import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/session'
import { prisma } from '@/lib/db'
import { FeishuClient } from '@/lib/task-platforms/feishu'
import { NotionClient } from '@/lib/task-platforms/notion'
import { TodoistClient } from '@/lib/task-platforms/todoist'
import { Platform } from '@prisma/client'

/**
 * 执行任务同步到目标平台
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params

    const syncItem = await prisma.syncItem.findUnique({
      where: { id },
      include: {
        taskAccount: true,
      },
    })

    if (!syncItem || syncItem.userId !== user.id) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // 更新状态为处理中
    await prisma.syncItem.update({
      where: { id },
      data: { status: 'PROCESSING' },
    })

    try {
      let taskId: string | null = null

      // 根据平台类型创建任务
      switch (syncItem.taskAccount.platform) {
        case 'FEISHU':
          // 使用用户级别的 access token
          if (!syncItem.taskAccount.accessToken) {
            throw new Error('No access token for Feishu')
          }
          // 这里简化处理，实际可能需要获取 user_id
          break

        case 'NOTION':
          if (!syncItem.taskAccount.accessToken) {
            throw new Error('No access token for Notion')
          }
          const notionClient = new NotionClient(syncItem.taskAccount.accessToken)
          // 优先使用 workspaceId，其次从 metadata 获取
          const databaseId = syncItem.taskAccount.workspaceId || (syncItem.taskAccount.metadata as any)?.databaseId
          if (!databaseId) {
            throw new Error('No database ID configured for Notion')
          }
          // 确保数据库有所需的属性
          await notionClient.ensureDatabaseProperties(databaseId)
          const notionResult = await notionClient.createTask({
            databaseId,
            title: syncItem.title,
            description: syncItem.description || undefined,
            dueDate: syncItem.dueDate || undefined,
            priority: syncItem.priority || undefined,
          })
          taskId = notionResult.taskId
          break

        case 'TODOIST':
          if (!syncItem.taskAccount.accessToken) {
            throw new Error('No access token for Todoist')
          }
          const todoistClient = new TodoistClient(syncItem.taskAccount.accessToken)
          const todoistResult = await todoistClient.createTask({
            title: syncItem.title,
            description: syncItem.description || undefined,
            dueDate: syncItem.dueDate || undefined,
            priority: syncItem.priority || undefined,
          })
          taskId = todoistResult.taskId
          break

        default:
          throw new Error(`Unsupported platform: ${syncItem.taskAccount.platform}`)
      }

      // 更新同步成功状态
      const updated = await prisma.syncItem.update({
        where: { id },
        data: {
          status: 'SUCCESS',
          taskId,
          syncedAt: new Date(),
        },
      })

      return NextResponse.json(updated)
    } catch (syncError: any) {
      // 更新失败状态
      await prisma.syncItem.update({
        where: { id },
        data: {
          status: 'FAILED',
          error: syncError.message,
          retryCount: { increment: 1 },
        },
      })
      throw syncError
    }
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: error.message || 'Sync failed' }, { status: 500 })
  }
}
