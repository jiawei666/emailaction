import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth.config'
import { syncEmailToTask, syncEmails, getSyncStatus } from '@/lib/sync'
import { SyncStatus } from '@prisma/client'
import { logger, UnauthorizedError, ValidationError } from '@/lib/errors'
import { apiSuccess, apiError } from '@/lib/api-response'

/**
 * POST /api/sync
 * 同步邮件到任务平台
 *
 * 请求体:
 * - mode: 'single' | 'batch'
 * - 单封邮件同步:
 *   { gmailAccountId, taskAccountId, gmailMessageId, email }
 * - 批量同步:
 *   { items: [{ gmailAccountId, taskAccountId, gmailMessageId, email }, ...] }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      throw new UnauthorizedError()
    }

    const body = await request.json()
    const { mode = 'single' } = body

    if (mode === 'single') {
      const { gmailAccountId, taskAccountId, gmailMessageId, email } = body

      if (!gmailAccountId || !taskAccountId || !gmailMessageId || !email?.subject) {
        throw new ValidationError('Missing required fields: gmailAccountId, taskAccountId, gmailMessageId, email')
      }

      logger.info('Single sync started', { userId: session.user.id, gmailMessageId })

      const result = await syncEmailToTask({
        userId: session.user.id,
        gmailAccountId,
        taskAccountId,
        gmailMessageId,
        emailSubject: email.subject,
        emailBody: email.body || '',
        emailFrom: email.from || '未知发件人',
        emailDate: email.date,
      })

      logger.info('Single sync completed', { userId: session.user.id, success: result.success })

      return apiSuccess({
        syncItemId: result.syncItemId,
        taskId: result.taskId,
        analysis: result.analysis,
        error: result.error,
      })
    }

    if (mode === 'batch') {
      const { items } = body

      if (!Array.isArray(items) || items.length === 0) {
        throw new ValidationError('items must be a non-empty array')
      }

      // 限制批量同步数量
      if (items.length > 10) {
        throw new ValidationError('Maximum 10 items per batch')
      }

      const syncParams = items.map((item: any) => ({
        userId: session.user.id,
        gmailAccountId: item.gmailAccountId,
        taskAccountId: item.taskAccountId,
        gmailMessageId: item.gmailMessageId,
        emailSubject: item.email.subject,
        emailBody: item.email.body,
        emailFrom: item.email.from,
        emailDate: item.email.date,
      }))

      logger.info('Batch sync started', { userId: session.user.id, count: syncParams.length })

      const result = await syncEmails(syncParams)

      logger.info('Batch sync completed', { userId: session.user.id, total: result.total, success: result.success })

      return apiSuccess(result)
    }

    throw new ValidationError('Invalid mode. Use "single" or "batch"')
  } catch (error) {
    logger.error('Sync error', error as Error)
    return apiError(
      'Failed to sync email',
      { details: error instanceof Error ? error.message : 'Unknown error' }
    )
  }
}

/**
 * GET /api/sync
 * 获取同步状态和历史
 *
 * 查询参数:
 * - status: 过滤状态 (PENDING, PROCESSING, SUCCESS, FAILED, CANCELLED)
 * - limit: 返回数量 (默认 20)
 * - offset: 偏移量 (默认 0)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      throw new UnauthorizedError()
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as SyncStatus | null
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    // 验证状态值
    const validStatuses = Object.values(SyncStatus)
    const filterStatus = status && validStatuses.includes(status) ? status : undefined

    const result = await getSyncStatus(session.user.id, {
      status: filterStatus,
      limit,
      offset,
    })

    return apiSuccess(result)
  } catch (error) {
    logger.error('Get sync status error', error as Error)
    return apiError(
      'Failed to get sync status',
{ details: error instanceof Error ? error.message : 'Unknown error' }
    )
  }
}
