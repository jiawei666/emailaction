import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/session'
import { searchEmails } from '@/lib/gmail'
import { prisma } from '@/lib/db'
import { analyzeEmail } from '@/lib/glm'
import { logger, NotFoundError, UnauthorizedError } from '@/lib/errors'
import { apiSuccess, apiError } from '@/lib/api-response'
import { z } from 'zod'

const syncSchema = z.object({
  accountId: z.string(),
  taskAccountId: z.string().optional(),
  query: z.string().optional().default('is:unread'),
  days: z.coerce.number().min(1).max(365).optional().default(7),
})

/**
 * 执行同步任务
 */
async function processSync(
  userId: string,
  accountId: string,
  taskAccountId: string | undefined,
  query: string,
  days: number
): Promise<{ syncCount: number; emailsProcessed: number }> {
  try {
    logger.info('Sync started', { userId, accountId, taskAccountId, days, query })

    // 验证账户属于当前用户
    const account = await prisma.gmailAccount.findUnique({
      where: { id: accountId },
    })

    if (!account || account.userId !== userId) {
      logger.warn('Gmail account not found or access denied', { userId, accountId })
      return { syncCount: 0, emailsProcessed: 0 }
    }

    // 构建搜索查询
    const searchQuery = `${query} after:${Math.floor(Date.now() / 1000 - days * 86400)}`

    // 搜索邮件
    const result = await searchEmails(userId, accountId, searchQuery, {
      maxResults: 50,
    })
    const emails = result.emails

    logger.info('Found emails to analyze', { count: emails.length })

    // 提取任务信息并创建同步项目
    let syncCount = 0
    for (const email of emails) {
      // 检查是否已经同步过
      const existingSync = await prisma.syncItem.findFirst({
        where: { gmailMessageId: email.id, userId },
      })

      if (existingSync) {
        logger.debug('Email already synced, skipping', { messageId: email.id })
        continue
      }

      try {
        // 使用 AI 分析邮件内容
        const analysis = await analyzeEmail(
          email.subject,
          email.body || email.snippet || '',
          email.from,
        )

        logger.info('Email analysis result', {
          messageId: email.id,
          subject: email.subject,
          hasActionItems: analysis.hasActionItems,
          tasksCount: analysis.tasks.length
        })

        // Create sync items if has action items
        if (analysis.hasActionItems && analysis.tasks.length > 0 && taskAccountId) {
          const priorityMap: Record<string, number> = {
            'HIGH': 4,
            'MEDIUM': 3,
            'LOW': 2,
          }

          for (const task of analysis.tasks) {
            // 验证日期格式，只有有效的日期才使用
            let dueDate: Date | null = null
            if (task.dueDate) {
              const parsedDate = new Date(task.dueDate)
              if (!isNaN(parsedDate.getTime())) {
                dueDate = parsedDate
              }
            }

            await prisma.syncItem.create({
              data: {
                userId,
                gmailAccountId: accountId,
                taskAccountId,
                gmailMessageId: email.id,
                title: task.title,
                description: task.description,
                dueDate,
                priority: priorityMap[task.priority] || 3,
                labels: JSON.stringify([]),
                status: 'PENDING',
              },
            })
            syncCount++
          }
        }
      } catch (error) {
        logger.error('Failed to analyze email', error as Error, { messageId: email.id })
      }
    }

    // 更新账户同步状态
    await prisma.gmailAccount.update({
      where: { id: accountId },
      data: {
        lastSyncAt: new Date(),
        syncStatus: 'SUCCESS',
      },
    })

    logger.info('Sync completed', { userId, accountId, syncCount, emailsProcessed: emails.length })
    return { syncCount, emailsProcessed: emails.length }
  } catch (error) {
    logger.error('Sync failed', error as Error)

    // 更新账户同步状态为失败
    try {
      await prisma.gmailAccount.update({
        where: { id: accountId },
        data: { syncStatus: 'FAILED' },
      })
    } catch {}

    return { syncCount: 0, emailsProcessed: 0 }
  }
}

/**
 * 触发 Gmail 同步
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()

    const { accountId, taskAccountId, query, days } = syncSchema.parse(body)

    logger.info('Gmail sync requested', { userId: user.id, accountId, taskAccountId, days, query })

    // 验证账户属于当前用户
    const account = await prisma.gmailAccount.findUnique({
      where: { id: accountId },
    })

    if (!account || account.userId !== user.id) {
      logger.warn('Gmail account not found or access denied', { userId: user.id, accountId })
      throw new NotFoundError('Gmail account')
    }

    // 更新账户同步状态为进行中
    await prisma.gmailAccount.update({
      where: { id: accountId },
      data: { syncStatus: 'PROCESSING' },
    })

    // 执行同步并等待完成
    const result = await processSync(user.id, accountId, taskAccountId, query, days)

    return apiSuccess({
      message: 'Sync completed',
      accountId,
      synced: result.syncCount,
      emailsProcessed: result.emailsProcessed,
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return apiError('Invalid parameters', {
        code: 'VALIDATION_ERROR',
        details: error.errors,
      })
    }
    if (error.message === 'Unauthorized') {
      throw new UnauthorizedError()
    }

    logger.error('Gmail sync request failed', error)

    return apiError(error.message || 'Sync failed', { status: 500 })
  }
}

/**
 * 获取同步状态
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(req.url)
    const accountId = searchParams.get('accountId')

    if (!accountId) {
      return apiError('accountId is required', {
        code: 'MISSING_PARAMETER',
      })
    }

    const account = await prisma.gmailAccount.findUnique({
      where: { id: accountId },
    })

    if (!account || account.userId !== user.id) {
      throw new NotFoundError('Gmail account')
    }

    const syncItems = await prisma.syncItem.findMany({
      where: {
        gmailAccountId: accountId,
        userId: user.id,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return apiSuccess({
      syncStatus: account.syncStatus,
      lastSyncAt: account.lastSyncAt,
      syncItems,
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      throw new UnauthorizedError()
    }
    logger.error('Failed to fetch sync status', error)
    return apiError(error.message || 'Failed to fetch sync status', { status: 500 })
  }
}
