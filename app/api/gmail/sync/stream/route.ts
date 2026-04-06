import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/session'
import { searchEmails } from '@/lib/gmail'
import { prisma } from '@/lib/db'
import { analyzeEmail } from '@/lib/glm'
import { logger } from '@/lib/errors'
import { z } from 'zod'

const syncSchema = z.object({
  accountId: z.string(),
  taskAccountId: z.string().optional(),
  query: z.string().optional().default('is:unread'),
  days: z.coerce.number().min(1).max(365).optional().default(7),
})

// SSE 事件类型
type SyncEvent =
  | { type: 'searching' }
  | { type: 'found'; count: number }
  | { type: 'analyzing'; current: number; total: number; subject: string }
  | { type: 'created'; title: string }
  | { type: 'complete'; synced: number; emailsProcessed: number }
  | { type: 'error'; message: string }

function encodeEvent(event: SyncEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`
}

/**
 * SSE 流式同步接口
 */
export async function POST(req: NextRequest) {
  // 验证用户
  const user = await requireAuth()

  // 解析请求体
  const body = await req.json()
  const parseResult = syncSchema.safeParse(body)

  if (!parseResult.success) {
    return new Response(JSON.stringify({ error: 'Invalid parameters' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { accountId, taskAccountId, query, days } = parseResult.data

  // 验证账户
  const account = await prisma.gmailAccount.findUnique({
    where: { id: accountId },
  })

  if (!account || account.userId !== user.id) {
    return new Response(JSON.stringify({ error: 'Gmail account not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // 更新状态为处理中
  await prisma.gmailAccount.update({
    where: { id: accountId },
    data: { syncStatus: 'PROCESSING' },
  })

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()

      const sendEvent = (event: SyncEvent) => {
        try {
          controller.enqueue(encoder.encode(encodeEvent(event)))
        } catch {
          // 客户端可能已断开
        }
      }

      try {
        sendEvent({ type: 'searching' })

        // 搜索邮件
        const searchQuery = `${query} after:${Math.floor(Date.now() / 1000 - days * 86400)}`
        const result = await searchEmails(user.id, accountId, searchQuery, {
          maxResults: 50,
        })
        const emails = result.emails

        sendEvent({ type: 'found', count: emails.length })
        logger.info('Found emails to analyze', { count: emails.length })

        // 分析每封邮件
        let syncCount = 0
        const priorityMap: Record<string, number> = {
          HIGH: 4,
          MEDIUM: 3,
          LOW: 2,
        }

        for (let i = 0; i < emails.length; i++) {
          const email = emails[i]

          sendEvent({
            type: 'analyzing',
            current: i + 1,
            total: emails.length,
            subject: email.subject?.slice(0, 50) || '(无主题)',
          })

          // 检查是否已同步
          const existingSync = await prisma.syncItem.findFirst({
            where: { gmailMessageId: email.id, userId: user.id },
          })

          if (existingSync) {
            continue
          }

          try {
            const analysis = await analyzeEmail(
              email.subject,
              email.body || email.snippet || '',
              email.from,
            )

            if (analysis.hasActionItems && analysis.tasks.length > 0 && taskAccountId) {
              for (const task of analysis.tasks) {
                let dueDate: Date | null = null
                if (task.dueDate) {
                  const parsedDate = new Date(task.dueDate)
                  if (!isNaN(parsedDate.getTime())) {
                    dueDate = parsedDate
                  }
                }

                await prisma.syncItem.create({
                  data: {
                    userId: user.id,
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

                sendEvent({ type: 'created', title: task.title })
                syncCount++
              }
            }
          } catch (error) {
            logger.error('Failed to analyze email', error as Error, {
              messageId: email.id,
            })
          }
        }

        // 更新账户状态
        await prisma.gmailAccount.update({
          where: { id: accountId },
          data: {
            lastSyncAt: new Date(),
            syncStatus: 'SUCCESS',
          },
        })

        sendEvent({
          type: 'complete',
          synced: syncCount,
          emailsProcessed: emails.length,
        })

        logger.info('Sync completed', { userId: user.id, accountId, syncCount })
      } catch (error) {
        logger.error('Sync failed', error as Error)
        sendEvent({
          type: 'error',
          message: error instanceof Error ? error.message : '同步失败',
        })

        // 更新失败状态
        try {
          await prisma.gmailAccount.update({
            where: { id: accountId },
            data: { syncStatus: 'FAILED' },
          })
        } catch {}
      }

      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
