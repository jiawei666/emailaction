import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { searchEmails } from '@/lib/gmail'
import { analyzeEmail } from '@/lib/glm'
import { logger } from '@/lib/errors'
import { SyncStatus } from '@prisma/client'

/**
 * Cron Job: 定时同步 Gmail 邮件
 *
 * 调用方式：
 * - GET /api/cron/sync?secret=YOUR_CRON_SECRET
 *
 * 建议配置：
 * - Vercel Cron: 每 15 分钟执行一次
 * - 或使用外部 cron 服务（如 cron-job.org）
 */
export async function GET(req: NextRequest) {
  // 验证 cron secret
  const secret = process.env.CRON_SECRET
  const { searchParams } = new URL(req.url)
  const querySecret = searchParams.get('secret')
  const authHeader = req.headers.get('authorization')
  const bearerSecret = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length).trim() : null
  const providedSecret = querySecret || bearerSecret

  if (!secret || providedSecret !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  logger.info('Cron job started: Gmail sync')

  try {
    // 获取所有活跃的 Gmail 账户
    const gmailAccounts = await prisma.gmailAccount.findMany({
      where: {
        syncStatus: 'SUCCESS', // 只同步之前成功过的账户
      },
    })

    logger.info(`Found ${gmailAccounts.length} Gmail accounts to sync`)

    let totalProcessed = 0
    let totalNewTasks = 0
    const errors: Array<{ accountId: string; email: string; error: string }> = []

    // 获取用户的默认任务账户
    const taskAccounts = await prisma.taskAccount.findMany({
      where: {
        isActive: true,
      },
      take: gmailAccounts.length,
    })

    for (const gmailAccount of gmailAccounts) {
      try {
        // 查找用户的任务账户
        const userTaskAccounts = taskAccounts.filter(ta => ta.userId === gmailAccount.userId)
        if (userTaskAccounts.length === 0) {
          logger.warn(`No task account found for user ${gmailAccount.userId}`)
          continue
        }

        const taskAccount = userTaskAccounts[0]

        // 搜索最近 1 小时的未读邮件
        const oneHourAgo = Math.floor(Date.now() / 1000 - 3600)
        const { emails } = await searchEmails(
          gmailAccount.userId,
          gmailAccount.id,
          `is:unread after:${oneHourAgo}`,
          { maxResults: 10 }
        )

        logger.info(`Found ${emails.length} unread emails for ${gmailAccount.email}`)

        for (const email of emails) {
          // 检查是否已存在
          const existingSync = await prisma.syncItem.findFirst({
            where: {
              gmailMessageId: email.id,
              userId: gmailAccount.userId,
            },
          })

          if (existingSync) continue

          totalProcessed++

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
                userId: gmailAccount.userId,
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

            totalNewTasks++
            logger.info(`Created new sync item for email ${email.id}`)
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

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        logger.error(`Failed to sync account ${gmailAccount.id}`, error as Error)
        errors.push({
          accountId: gmailAccount.id,
          email: gmailAccount.email,
          error: errorMessage,
        })

        // 更新账户同步状态为失败
        await prisma.gmailAccount.update({
          where: { id: gmailAccount.id },
          data: { syncStatus: 'FAILED' },
        })
      }
    }

    logger.info('Cron job completed', {
      totalProcessed,
      totalNewTasks,
      errorsCount: errors.length,
    })

    return NextResponse.json({
      success: true,
      data: {
        accountsProcessed: gmailAccounts.length,
        emailsProcessed: totalProcessed,
        newTasksCreated: totalNewTasks,
        errors: errors.length > 0 ? errors : undefined,
      },
    })
  } catch (error) {
    logger.error('Cron job failed', error as Error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * 兼容 POST 请求（某些 cron 服务使用 POST）
 */
export async function POST(req: NextRequest) {
  return GET(req)
}
