import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/session'
import { getGmailClient } from '@/lib/gmail'
import { prisma } from '@/lib/db'
import { extractTaskFromEmail } from '@/lib/utils'
import { z } from 'zod'

const scanSchema = z.object({
  query: z.string().optional().default('is:unread'),
  days: z.coerce.number().min(1).max(365).optional().default(7),
})

/**
 * 首次扫描邮件 - Onboarding 专用
 * 自动使用用户的第一个 Gmail 账户和第一个任务平台账户
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const { query, days } = scanSchema.parse(body)

    // 获取用户的第一个 Gmail 账户
    const gmailAccount = await prisma.gmailAccount.findFirst({
      where: { userId: user.id },
    })

    if (!gmailAccount) {
      return NextResponse.json({ error: '请先连接 Gmail 账户' }, { status: 400 })
    }

    // 获取用户的第一个任务平台账户
    const taskAccount = await prisma.taskAccount.findFirst({
      where: { userId: user.id },
    })

    if (!taskAccount) {
      return NextResponse.json({ error: '请先连接任务平台' }, { status: 400 })
    }

    // 构建搜索查询
    const searchQuery = `${query} after:${Math.floor(Date.now() / 1000 - days * 86400)}`

    // 搜索邮件
    const gmail = await getGmailClient(user.id, gmailAccount.id)
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: searchQuery,
      maxResults: 20,
    })

    const messages = response.data.messages || []
    let foundCount = 0
    let syncedCount = 0

    for (const message of messages) {
      if (!message.id) continue

      // 检查是否已经同步过
      const existingSync = await prisma.syncItem.findFirst({
        where: { gmailMessageId: message.id, userId: user.id },
      })

      if (existingSync) continue

      // 获取邮件详情
      const detail = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
        format: 'full',
      })

      const headers = detail.data.payload?.headers || []
      const getHeader = (name: string) => headers.find(h => h?.name?.toLowerCase() === name.toLowerCase())?.value || ''

      // 解析邮件正文
      let body = ''
      const decodeBase64 = (data: string) => Buffer.from(data, 'base64').toString('utf-8')

      if (detail.data.payload?.body?.data) {
        body = decodeBase64(detail.data.payload.body.data)
      } else if (detail.data.payload?.parts) {
        for (const part of detail.data.payload.parts) {
          if (part.mimeType === 'text/html' || part.mimeType === 'text/plain') {
            if (part.body?.data) {
              body = decodeBase64(part.body.data)
              break
            }
          }
          if (part.parts) {
            for (const subPart of part.parts) {
              if (subPart.mimeType === 'text/html' || subPart.mimeType === 'text/plain') {
                if (subPart.body?.data) {
                  body = decodeBase64(subPart.body.data)
                  break
                }
              }
            }
          }
        }
      }

      const email = {
        id: message.id,
        subject: getHeader('Subject'),
        body,
        from: getHeader('From'),
      }

      foundCount++

      // 使用 AI 提取任务信息
      const task = extractTaskFromEmail(email.subject, body, email.from)

      if (task) {
        // 创建同步项
        await prisma.syncItem.create({
          data: {
            userId: user.id,
            gmailAccountId: gmailAccount.id,
            taskAccountId: taskAccount.id,
            gmailMessageId: message.id,
            title: task.title,
            description: task.description,
            dueDate: task.dueDate,
            priority: task.priority,
            labels: JSON.stringify(task.labels || []),
            status: 'PENDING',
          },
        })
        syncedCount++
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

    return NextResponse.json({
      success: true,
      found: foundCount,
      synced: syncedCount,
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('First scan failed:', error)

    return NextResponse.json(
      { error: error.message || '扫描失败，请重试' },
      { status: 500 }
    )
  }
}
