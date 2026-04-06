/**
 * 任务同步服务
 * 将邮件中的待办事项同步到任务平台（飞书/Notion/Todoist）
 */

import { prisma } from './db'
import { analyzeEmail, type EmailAnalysis, type ExtractedTask } from './glm'
import { FeishuClient } from './task-platforms/feishu'
import { NotionClient } from './task-platforms/notion'
import { TodoistClient } from './task-platforms/todoist'
import { Platform, SyncStatus, type SyncItem, type TaskAccount, type GmailAccount } from '@prisma/client'

export interface SyncEmailParams {
  userId: string
  gmailAccountId: string
  taskAccountId: string
  gmailMessageId: string
  emailSubject: string
  emailBody: string
  emailFrom: string
  emailDate?: string
}

export interface SyncResult {
  success: boolean
  syncItemId: string
  taskId?: string
  error?: string
  analysis?: EmailAnalysis
}

export interface BatchSyncResult {
  total: number
  success: number
  failed: number
  results: SyncResult[]
}

/**
 * 获取任务平台客户端
 */
function getTaskPlatformClient(taskAccount: TaskAccount) {
  switch (taskAccount.platform) {
    case Platform.FEISHU:
      return new FeishuClient()
    case Platform.NOTION:
      if (!taskAccount.accessToken) {
        throw new Error('Notion access token not found')
      }
      return new NotionClient(taskAccount.accessToken)
    case Platform.TODOIST:
      if (!taskAccount.accessToken) {
        throw new Error('Todoist access token not found')
      }
      return new TodoistClient(taskAccount.accessToken)
    default:
      throw new Error(`Unsupported platform: ${taskAccount.platform}`)
  }
}

/**
 * 映射优先级字符串到数字
 */
function mapPriority(priority: 'HIGH' | 'MEDIUM' | 'LOW'): number {
  switch (priority) {
    case 'HIGH':
      return 4
    case 'MEDIUM':
      return 3
    case 'LOW':
      return 1
    default:
      return 2
  }
}

/**
 * 同步单封邮件到任务平台
 */
export async function syncEmailToTask(params: SyncEmailParams): Promise<SyncResult> {
  const { userId, gmailAccountId, taskAccountId, gmailMessageId, emailSubject, emailBody, emailFrom, emailDate } = params

  // 1. 获取账户信息
  const [gmailAccount, taskAccount] = await Promise.all([
    prisma.gmailAccount.findUnique({
      where: { id: gmailAccountId },
    }),
    prisma.taskAccount.findUnique({
      where: { id: taskAccountId },
    }),
  ])

  if (!gmailAccount || gmailAccount.userId !== userId) {
    return {
      success: false,
      syncItemId: '',
      error: 'Gmail account not found or access denied',
    }
  }

  if (!taskAccount || taskAccount.userId !== userId) {
    return {
      success: false,
      syncItemId: '',
      error: 'Task account not found or access denied',
    }
  }

  // 2. 创建待处理的 SyncItem
  const syncItem = await prisma.syncItem.create({
    data: {
      userId,
      gmailAccountId,
      taskAccountId,
      gmailMessageId,
      title: emailSubject,
      description: `来自: ${emailFrom}`,
      status: SyncStatus.PROCESSING,
    },
  })

  try {
    // 3. 调用 GLM 分析邮件
    const analysis = await analyzeEmail(emailSubject, emailBody, emailFrom, emailDate)

    // 检查是否有待办事项
    if (!analysis.hasActionItems || analysis.tasks.length === 0) {
      await prisma.syncItem.update({
        where: { id: syncItem.id },
        data: {
          status: SyncStatus.CANCELLED,
          description: '邮件中未检测到待办事项',
        },
      })

      return {
        success: false,
        syncItemId: syncItem.id,
        error: 'No action items found in email',
        analysis,
      }
    }

    // 4. 获取第一个任务（主任务）
    const mainTask = analysis.tasks[0]
    const priority = mapPriority(mainTask.priority)

    // 5. 更新 SyncItem 信息
    await prisma.syncItem.update({
      where: { id: syncItem.id },
      data: {
        title: mainTask.title,
        description: mainTask.description,
        dueDate: mainTask.dueDate ? new Date(mainTask.dueDate) : null,
        priority,
      },
    })

    // 6. 调用任务平台 API 创建任务
    const client = getTaskPlatformClient(taskAccount)
    let taskId: string

    switch (taskAccount.platform) {
      case Platform.FEISHU: {
        const feishuClient = client as FeishuClient
        const result = await feishuClient.createTask({
          userId: taskAccount.accountId,
          title: mainTask.title,
          description: mainTask.description,
          dueDate: mainTask.dueDate ? new Date(mainTask.dueDate) : undefined,
          priority,
        })
        taskId = result.taskId
        break
      }
      case Platform.NOTION: {
        const notionClient = client as NotionClient
        if (!taskAccount.workspaceId) {
          throw new Error('Notion database ID not configured')
        }
        const result = await notionClient.createTask({
          databaseId: taskAccount.workspaceId,
          title: mainTask.title,
          description: mainTask.description,
          dueDate: mainTask.dueDate ? new Date(mainTask.dueDate) : undefined,
          priority,
        })
        taskId = result.taskId
        break
      }
      case Platform.TODOIST: {
        const todoistClient = client as TodoistClient
        const result = await todoistClient.createTask({
          title: mainTask.title,
          description: mainTask.description,
          dueDate: mainTask.dueDate ? new Date(mainTask.dueDate) : undefined,
          priority,
        })
        taskId = result.taskId
        break
      }
      default:
        throw new Error(`Unsupported platform: ${taskAccount.platform}`)
    }

    // 7. 更新 SyncItem 状态为成功
    await prisma.syncItem.update({
      where: { id: syncItem.id },
      data: {
        taskId,
        status: SyncStatus.SUCCESS,
        syncedAt: new Date(),
      },
    })

    // 8. 创建通知
    await prisma.notification.create({
      data: {
        userId,
        type: 'SYNC_SUCCESS',
        title: '任务同步成功',
        message: `"${mainTask.title}" 已同步到 ${taskAccount.platform}`,
      },
    })

    return {
      success: true,
      syncItemId: syncItem.id,
      taskId,
      analysis,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    // 更新 SyncItem 状态为失败
    await prisma.syncItem.update({
      where: { id: syncItem.id },
      data: {
        status: SyncStatus.FAILED,
        error: errorMessage,
      },
    })

    // 创建失败通知
    await prisma.notification.create({
      data: {
        userId,
        type: 'SYNC_FAILED',
        title: '任务同步失败',
        message: `"${emailSubject}" 同步失败: ${errorMessage}`,
      },
    })

    return {
      success: false,
      syncItemId: syncItem.id,
      error: errorMessage,
    }
  }
}

/**
 * 批量同步邮件
 */
export async function syncEmails(paramsList: SyncEmailParams[]): Promise<BatchSyncResult> {
  const results: SyncResult[] = []
  let success = 0
  let failed = 0

  // 串行处理以避免 API 限流
  for (const params of paramsList) {
    const result = await syncEmailToTask(params)
    results.push(result)

    if (result.success) {
      success++
    } else {
      failed++
    }
  }

  return {
    total: paramsList.length,
    success,
    failed,
    results,
  }
}

/**
 * 获取同步状态
 */
export async function getSyncStatus(userId: string, options?: {
  status?: SyncStatus
  limit?: number
  offset?: number
}) {
  const where = {
    userId,
    ...(options?.status && { status: options.status }),
  }

  const [items, total] = await Promise.all([
    prisma.syncItem.findMany({
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
      take: options?.limit || 20,
      skip: options?.offset || 0,
    }),
    prisma.syncItem.count({ where }),
  ])

  return {
    items,
    total,
    hasMore: (options?.offset || 0) + items.length < total,
  }
}

/**
 * 重试失败的同步
 */
export async function retrySync(userId: string, syncItemId: string): Promise<SyncResult> {
  const syncItem = await prisma.syncItem.findUnique({
    where: { id: syncItemId },
    include: {
      gmailAccount: true,
      taskAccount: true,
    },
  })

  if (!syncItem || syncItem.userId !== userId) {
    return {
      success: false,
      syncItemId: '',
      error: 'Sync item not found or access denied',
    }
  }

  if (syncItem.status !== SyncStatus.FAILED) {
    return {
      success: false,
      syncItemId: syncItem.id,
      error: 'Only failed syncs can be retried',
    }
  }

  // 更新重试计数
  await prisma.syncItem.update({
    where: { id: syncItemId },
    data: {
      status: SyncStatus.PENDING,
      retryCount: { increment: 1 },
      error: null,
    },
  })

  // 重新同步
  return syncEmailToTask({
    userId,
    gmailAccountId: syncItem.gmailAccountId,
    taskAccountId: syncItem.taskAccountId,
    gmailMessageId: syncItem.gmailMessageId,
    emailSubject: syncItem.title,
    emailBody: syncItem.description || '',
    emailFrom: syncItem.gmailAccount.email,
  })
}

/**
 * 取消同步
 */
export async function cancelSync(userId: string, syncItemId: string): Promise<boolean> {
  const syncItem = await prisma.syncItem.findUnique({
    where: { id: syncItemId },
  })

  if (!syncItem || syncItem.userId !== userId) {
    return false
  }

  if (syncItem.status !== SyncStatus.PENDING && syncItem.status !== SyncStatus.PROCESSING) {
    return false
  }

  await prisma.syncItem.update({
    where: { id: syncItemId },
    data: { status: SyncStatus.CANCELLED },
  })

  return true
}
