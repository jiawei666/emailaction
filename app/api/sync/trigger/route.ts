import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/session'
import { prisma } from '@/lib/db'
import { searchEmails } from '@/lib/gmail'
import { analyzeEmail } from '@/lib/glm'
import { logger, UnauthorizedError } from '@/lib/errors'
import { apiSuccess, apiError } from '@/lib/api-response'
import { SyncStatus } from '@prisma/client'

/**
 * 手动触发邮件同步
 *
 * POST /api/sync/trigger
 * Body: { accountId?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const { accountId } = body

    logger.info('Manual sync triggered', { userId: user.id, accountId })

    // 获取用户的 Gmail 账户
    const where = accountId
      ? { id: accountId, userId: user.id }
      : { userId: user.id }

    const gmailAccounts = await prisma.gmailAccount.findMany({
      where,
      take: 1, // 限制一次同步一个账户
    })

    if (gmailAccounts.length === 0) {
      return apiError('No Gmail account found', {
        code: 'NO_ACCOUNT',
      })
    }

    const gmailAccount = gmailAccounts[0]

    // 获取用户的任务账户
    const taskAccounts = await prisma.taskAccount.findMany({
      where: {
        userId: user.id,
        isActive: true,
      },
      take: 1,
    })

    if (taskAccounts.length === 0) {
      return apiError('No task account found. Please connect a task platform first.', {
        code: 'NO_TASK_ACCOUNT',
      })
    }

    const taskAccount = taskAccounts[0]

    // 搜索最近 24 小时的未读邮件
    const oneDayAgo = Math.floor(Date.now() / 1000 - 86400)
    const { emails } = await searchEmails(
      user.id,
      gmailAccount.id,
      `is:unread after:${oneDayAgo}`,
      { maxResults: 20 }
    )

    logger.info(`Found ${emails.length} unread emails for ${gmailAccount.email}`)

    let newTasks = 0
    const skipped = []

    for (const email of emails) {
      // 检查是否已存在
      const existingSync = await prisma.syncItem.findFirst({
        where: {
          gmailMessageId: email.id,
          userId: user.id,
        },
      })

      if (existingSync) {
        skipped.push({ emailId: email.id, reason: 'already_synced' })
        continue
      }

      // 使用 AI 分析邮件
      const analysis = await analyzeEmail(
        email.subject,
        email.body,
        email.from,
        email.date?.toISOString()
      )

      // 如果有待办事项，创建同步项目
      if (analysis.hasActionItems && analysis.tasks.length > 0) {
        const mainTask = analysis.tasks[0]

        await prisma.syncItem.create({
          data: {
            userId: user.id,
            gmailAccountId: gmailAccount.id,
            taskAccountId: taskAccount.id,
            gmailMessageId: email.id,
            title: mainTask.title,
            description: mainTask.description,
            dueDate: mainTask.dueDate ? new Date(mainTask.dueDate) : null,
            priority: mainTask.priority === 'HIGH' ? 4 : mainTask.priority === 'MEDIUM' ? 3 : 1,
            status: SyncStatus.PENDING,
          },
        })

        newTasks++
        logger.info(`Created new sync item for email ${email.id}`, {
          userId: user.id,
          title: mainTask.title,
        })
      } else {
        skipped.push({ emailId: email.id, reason: 'no_action_items' })
      }
    }

    // 更新账户同步状态
    await prisma.gmailAccount.update({
      where: { id: gmailAccount.id },
      data: {
        lastSyncAt: new Date(),
        syncStatus: 'SUCCESS',
      },
    })

    logger.info('Manual sync completed', {
      userId: user.id,
      accountId: gmailAccount.id,
      emailsProcessed: emails.length,
      newTasks,
      skipped: skipped.length,
    })

    return apiSuccess({
      accountId: gmailAccount.id,
      accountEmail: gmailAccount.email,
      emailsProcessed: emails.length,
      newTasksCreated: newTasks,
      skipped,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      throw new UnauthorizedError()
    }
    logger.error('Manual sync failed', error as Error)
    return apiError(error instanceof Error ? error.message : 'Sync failed', { status: 500 })
  }
}
