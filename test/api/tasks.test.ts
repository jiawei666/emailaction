/**
 * test/api/tasks.test.ts - 修复版
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cleanupDatabase, createTestUser, createTestGmailAccount, createTestTaskAccount, getPrisma } from '../../test/setup'

const prisma = getPrisma()

// Mock NextAuth
vi.mock('@/lib/session', () => ({
  requireAuth: vi.fn(async () => ({ id: 'test-user-id' })),
}))

describe('/api/tasks', () => {
  beforeEach(async () => {
    await cleanupDatabase()
    // 创建默认测试用户
    await createTestUser({ id: 'test-user-id' })
  })

  afterEach(async () => {
    await cleanupDatabase()
  })

  describe('GET /api/tasks', () => {
    it('应该返回用户的任务列表', async () => {
      const gmailAccount = await createTestGmailAccount('test-user-id')
      const taskAccount = await createTestTaskAccount('test-user-id')

      await prisma.syncItem.create({
        data: {
          id: 'sync-1',
          userId: 'test-user-id',
          gmailAccountId: gmailAccount.id,
          taskAccountId: taskAccount.id,
          gmailMessageId: 'msg-1',
          title: 'Task 1',
          description: 'Description 1',
          status: 'PENDING',
          labels: '[]',
        },
      })

      await prisma.syncItem.create({
        data: {
          id: 'sync-2',
          userId: 'test-user-id',
          gmailAccountId: gmailAccount.id,
          taskAccountId: taskAccount.id,
          gmailMessageId: 'msg-2',
          title: 'Task 2',
          status: 'SUCCESS',
          labels: '[]',
        },
      })

      const { GET } = await import('@/app/api/tasks/route')
      const request = new Request('http://localhost:3000/api/tasks')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.tasks).toHaveLength(2)
    })

    it('应该支持状态过滤', async () => {
      const gmailAccount = await createTestGmailAccount('test-user-id')
      const taskAccount = await createTestTaskAccount('test-user-id')

      await prisma.syncItem.createMany({
        data: [
          {
            id: 'sync-1',
            userId: 'test-user-id',
            gmailAccountId: gmailAccount.id,
            taskAccountId: taskAccount.id,
            gmailMessageId: 'msg-1',
            title: 'Pending Task',
            status: 'PENDING',
            labels: '[]',
          },
          {
            id: 'sync-2',
            userId: 'test-user-id',
            gmailAccountId: gmailAccount.id,
            taskAccountId: taskAccount.id,
            gmailMessageId: 'msg-2',
            title: 'Success Task',
            status: 'SUCCESS',
            labels: '[]',
          },
        ],
      })

      const { GET } = await import('@/app/api/tasks/route')
      const request = new Request('http://localhost:3000/api/tasks?status=SUCCESS')
      const response = await GET(request)
      const data = await response.json()

      expect(data.tasks).toHaveLength(1)
      expect(data.tasks[0].status).toBe('SUCCESS')
    })
  })

  describe('POST /api/tasks', () => {
    it('应该创建新的同步项目', async () => {
      const gmailAccount = await createTestGmailAccount('test-user-id')
      const taskAccount = await createTestTaskAccount('test-user-id')

      const body = {
        gmailAccountId: gmailAccount.id,
        taskAccountId: taskAccount.id,
        gmailMessageId: 'msg-new',
        title: 'New Task',
        description: 'Test description',
      }

      const { POST } = await import('@/app/api/tasks/route')
      const request = new Request('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify(body),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.title).toBe('New Task')
    })
  })
})

describe('/api/tasks/[id]', () => {
  beforeEach(async () => {
    await cleanupDatabase()
    await createTestUser({ id: 'test-user-id' })
  })

  afterEach(async () => {
    await cleanupDatabase()
  })

  describe('GET /api/tasks/:id', () => {
    it('应该返回任务详情', async () => {
      const gmailAccount = await createTestGmailAccount('test-user-id')
      const taskAccount = await createTestTaskAccount('test-user-id')

      const task = await prisma.syncItem.create({
        data: {
          id: 'sync-1',
          userId: 'test-user-id',
          gmailAccountId: gmailAccount.id,
          taskAccountId: taskAccount.id,
          gmailMessageId: 'msg-1',
          title: 'Test Task',
          labels: '[]',
        },
      })

      const { GET } = await import('@/app/api/tasks/[id]/route')
      const request = new Request(`http://localhost:3000/api/tasks/${task.id}`)
      const response = await GET(request, { params: { id: task.id } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.id).toBe(task.id)
    })
  })

  describe('DELETE /api/tasks/:id', () => {
    it('应该删除任务', async () => {
      const gmailAccount = await createTestGmailAccount('test-user-id')
      const taskAccount = await createTestTaskAccount('test-user-id')

      const task = await prisma.syncItem.create({
        data: {
          id: 'sync-1',
          userId: 'test-user-id',
          gmailAccountId: gmailAccount.id,
          taskAccountId: taskAccount.id,
          gmailMessageId: 'msg-1',
          title: 'Test Task',
          labels: '[]',
        },
      })

      const { DELETE } = await import('@/app/api/tasks/[id]/route')
      const request = new Request(`http://localhost:3000/api/tasks/${task.id}`, {
        method: 'DELETE',
      })

      const response = await DELETE(request, { params: { id: task.id } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })
})
