/**
 * test/lib/sync.test.ts
 * 同步服务模块单元测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { vi } from 'vitest'
import { Platform, SyncStatus } from '@prisma/client'

// Mock db module - 使用简单的 mock factory
vi.mock('@/lib/db', () => ({
  prisma: {
    gmailAccount: {
      findUnique: vi.fn(),
    },
    taskAccount: {
      findUnique: vi.fn(),
    },
    syncItem: {
      create: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    notification: {
      create: vi.fn(),
    },
    $disconnect: vi.fn(),
  },
}))

// Mock GLM
vi.mock('@/lib/glm', async () => {
  const actual = await vi.importActual('@/lib/glm')
  return {
    ...actual,
    analyzeEmail: vi.fn(),
  }
})

// 导入被测试的模块
import { syncEmailToTask, syncEmails, retrySync, cancelSync, getSyncStatus } from '@/lib/sync'
import { prisma } from '@/lib/db'

describe('Sync - 邮件同步服务', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // 设置默认 mock 值
    ;(prisma.gmailAccount.findUnique as any).mockResolvedValue({
      id: 'gmail-1',
      userId: 'test-user-id',
      email: 'test@gmail.com',
    })

    ;(prisma.taskAccount.findUnique as any).mockResolvedValue({
      id: 'task-1',
      userId: 'test-user-id',
      platform: 'TODOIST',
      accessToken: 'test-token',
    })

    ;(prisma.syncItem.create as any).mockResolvedValue({
      id: 'sync-1',
      userId: 'test-user-id',
      status: 'PENDING',
    })

    ;(prisma.syncItem.update as any).mockResolvedValue({
      id: 'sync-1',
      status: 'SUCCESS',
    })

    ;(prisma.syncItem.count as any).mockResolvedValue(0)

    ;(prisma.notification.create as any).mockResolvedValue({ id: 'notif-1' })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('syncEmailToTask - 单封邮件同步', () => {
    it('应该成功同步包含待办的邮件', async () => {
      const { analyzeEmail } = await import('@/lib/glm')
      vi.mocked(analyzeEmail).mockResolvedValue({
        tasks: [
          {
            title: '完成项目报告',
            description: 'Q4项目总结报告',
            dueDate: '2025-01-17',
            priority: 'HIGH',
          },
        ],
        sender: '项目经理',
        summary: '要求完成报告',
        hasActionItems: true,
      } as any)

      // Mock Todoist API
      const mockFetch = vi.fn()
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ id: 'todoist-task-123' }),
      })
      global.fetch = mockFetch

      const result = await syncEmailToTask({
        userId: 'test-user-id',
        gmailAccountId: 'gmail-1',
        taskAccountId: 'task-1',
        gmailMessageId: 'msg-123',
        emailSubject: '项目报告提醒',
        emailBody: '请在周五前完成报告',
        emailFrom: 'manager@company.com',
        emailDate: '2025-01-15',
      })

      expect(result.success).toBe(true)
      expect(result.taskId).toBe('todoist-task-123')
      expect(result.analysis?.hasActionItems).toBe(true)
    })

    it('应该处理无待办的邮件', async () => {
      const { analyzeEmail } = await import('@/lib/glm')
      vi.mocked(analyzeEmail).mockResolvedValue({
        tasks: [],
        sender: '发件人',
        summary: '普通邮件',
        hasActionItems: false,
      } as any)

      ;(prisma.syncItem.update as any).mockResolvedValue({
        id: 'sync-1',
        status: SyncStatus.CANCELLED,
      })

      const result = await syncEmailToTask({
        userId: 'test-user-id',
        gmailAccountId: 'gmail-1',
        taskAccountId: 'task-1',
        gmailMessageId: 'msg-123',
        emailSubject: '普通通知',
        emailBody: '只是一条普通通知',
        emailFrom: 'info@company.com',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('No action items found in email')
    })

    it('应该处理 Gmail 账户不存在的情况', async () => {
      ;(prisma.gmailAccount.findUnique as any).mockResolvedValue(null)

      const result = await syncEmailToTask({
        userId: 'test-user-id',
        gmailAccountId: 'non-existent',
        taskAccountId: 'task-1',
        gmailMessageId: 'msg-123',
        emailSubject: '测试',
        emailBody: '内容',
        emailFrom: 'test@example.com',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Gmail account not found or access denied')
    })

    it('应该处理任务账户不存在的情况', async () => {
      ;(prisma.gmailAccount.findUnique as any).mockResolvedValue({
        id: 'gmail-1',
        userId: 'test-user-id',
      })
      ;(prisma.taskAccount.findUnique as any).mockResolvedValue(null)

      const result = await syncEmailToTask({
        userId: 'test-user-id',
        gmailAccountId: 'gmail-1',
        taskAccountId: 'non-existent',
        gmailMessageId: 'msg-123',
        emailSubject: '测试',
        emailBody: '内容',
        emailFrom: 'test@example.com',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Task account not found or access denied')
    })

    it('应该处理 API 错误', async () => {
      const { analyzeEmail } = await import('@/lib/glm')
      vi.mocked(analyzeEmail).mockResolvedValue({
        tasks: [{ title: '任务', description: '描述', priority: 'HIGH' }],
        sender: '发件人',
        summary: '摘要',
        hasActionItems: true,
      } as any)

      ;(prisma.syncItem.update as any).mockResolvedValue({
        id: 'sync-1',
        status: SyncStatus.FAILED,
      })

      const mockFetch = vi.fn()
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      })
      global.fetch = mockFetch

      const result = await syncEmailToTask({
        userId: 'test-user-id',
        gmailAccountId: 'gmail-1',
        taskAccountId: 'task-1',
        gmailMessageId: 'msg-123',
        emailSubject: '测试',
        emailBody: '内容',
        emailFrom: 'test@example.com',
      })

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('retrySync - 重试失败的同步', () => {
    it('应该成功重试失败的同步', async () => {
      const { analyzeEmail } = await import('@/lib/glm')
      vi.mocked(analyzeEmail).mockResolvedValue({
        tasks: [{ title: '任务', description: '描述', priority: 'HIGH' }],
        sender: '发件人',
        summary: '摘要',
        hasActionItems: true,
      } as any)

      ;(prisma.syncItem.findUnique as any).mockResolvedValue({
        id: 'sync-1',
        userId: 'test-user-id',
        status: SyncStatus.FAILED,
        gmailAccountId: 'gmail-1',
        taskAccountId: 'task-1',
        gmailMessageId: 'msg-123',
        title: '原始任务',
        description: '原始描述',
        gmailAccount: { email: 'test@gmail.com' },
        taskAccount: { platform: Platform.TODOIST, accessToken: 'test-token' },
      })

      const mockFetch = vi.fn()
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ id: 'task-123' }),
      })
      global.fetch = mockFetch

      const result = await retrySync('test-user-id', 'sync-1')

      expect(result.success).toBe(true)
    })

    it('应该拒绝重试不存在的同步项', async () => {
      ;(prisma.syncItem.findUnique as any).mockResolvedValue(null)

      const result = await retrySync('test-user-id', 'non-existent')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Sync item not found or access denied')
    })

    it('应该只允许重试失败的同���', async () => {
      ;(prisma.syncItem.findUnique as any).mockResolvedValue({
        id: 'sync-1',
        userId: 'test-user-id',
        status: SyncStatus.SUCCESS,
      })

      const result = await retrySync('test-user-id', 'sync-1')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Only failed syncs can be retried')
    })
  })

  describe('cancelSync - 取消同步', () => {
    it('应该成功取消待处理的同步', async () => {
      ;(prisma.syncItem.findUnique as any).mockResolvedValue({
        id: 'sync-1',
        userId: 'test-user-id',
        status: SyncStatus.PENDING,
      })

      const result = await cancelSync('test-user-id', 'sync-1')

      expect(result).toBe(true)
    })

    it('应该拒绝取消已完成的同步', async () => {
      ;(prisma.syncItem.findUnique as any).mockResolvedValue({
        id: 'sync-1',
        userId: 'test-user-id',
        status: SyncStatus.SUCCESS,
      })

      const result = await cancelSync('test-user-id', 'sync-1')

      expect(result).toBe(false)
    })
  })

  describe('getSyncStatus - 获取同步状态', () => {
    it('应该返回用户的同步记录', async () => {
      const mockItems = [
        { id: 'sync-1', title: '任务1', status: SyncStatus.SUCCESS },
        { id: 'sync-2', title: '任务2', status: SyncStatus.PENDING },
      ]

      ;(prisma.syncItem.findMany as any).mockResolvedValue(mockItems)
      ;(prisma.syncItem.count as any).mockResolvedValue(2)

      const result = await getSyncStatus('test-user-id')

      expect(result.items).toEqual(mockItems)
      expect(result.total).toBe(2)
    })

    it('应该支持状态过滤', async () => {
      ;(prisma.syncItem.findMany as any).mockResolvedValue([])
      ;(prisma.syncItem.count as any).mockResolvedValue(0)

      const result = await getSyncStatus('test-user-id', { status: SyncStatus.FAILED })

      expect(result.total).toBe(0)
    })

    it('应该支持分页', async () => {
      ;(prisma.syncItem.findMany as any).mockResolvedValue([])
      ;(prisma.syncItem.count as any).mockResolvedValue(25)

      const result = await getSyncStatus('test-user-id', { limit: 10, offset: 20 })

      expect(result.hasMore).toBe(true)
    })
  })
})
