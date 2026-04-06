/**
 * lib/task-platforms/feishu.test.ts - 修复版
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { FeishuClient } from '@/lib/task-platforms/feishu'

describe('FeishuClient', () => {
  let client: FeishuClient
  let mockFetch: ReturnType<typeof vi.fn>

  beforeEach(() => {
    process.env.FEISHU_APP_ID = 'test-app-id'
    process.env.FEISHU_APP_SECRET = 'test-app-secret'
    client = new FeishuClient()
    mockFetch = vi.fn()
    global.fetch = mockFetch
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const createMockResponse = (data: unknown, ok = true) => ({
    ok,
    json: async () => data,
  })

  describe('getAccessToken', () => {
    it('应该获取访问令牌', async () => {
      mockFetch.mockResolvedValue(createMockResponse({
        code: 0,
        tenant_access_token: 'test-access-token',
        expire: 7200,
      }))

      const token = await client.getAccessToken()

      expect(token).toBe('test-access-token')
    })

    it('应该缓存访问令牌', async () => {
      mockFetch.mockResolvedValue(createMockResponse({
        code: 0,
        tenant_access_token: 'test-access-token',
        expire: 7200,
      }))

      await client.getAccessToken()
      await client.getAccessToken()

      expect(mockFetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('createTask', () => {
    beforeEach(() => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('auth')) {
          return Promise.resolve(createMockResponse({
            code: 0,
            tenant_access_token: 'test-token',
            expire: 7200,
          }))
        }
        return Promise.resolve(createMockResponse({
          code: 0,
          data: { task: { task_id: 'task-123' } },
        }))
      })
    })

    it('应该创建基本任务', async () => {
      const result = await client.createTask({
        userId: 'user-123',
        title: 'Test Task',
      })

      expect(result.taskId).toBe('task-123')
    })

    it('应该创建带描述的任务', async () => {
      const result = await client.createTask({
        userId: 'user-123',
        title: 'Test Task',
        description: 'Test description',
      })

      expect(result.taskId).toBe('task-123')
    })
  })

  describe('updateTask', () => {
    beforeEach(() => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('auth')) {
          return Promise.resolve(createMockResponse({
            code: 0,
            tenant_access_token: 'test-token',
            expire: 7200,
          }))
        }
        return Promise.resolve(createMockResponse({ code: 0 }))
      })
    })

    it('应该更新任务标题', async () => {
      await client.updateTask('task-123', { title: 'Updated Title' })
      expect(mockFetch).toHaveBeenCalled()
    })
  })

  describe('deleteTask', () => {
    beforeEach(() => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('auth')) {
          return Promise.resolve(createMockResponse({
            code: 0,
            tenant_access_token: 'test-token',
            expire: 7200,
          }))
        }
        return Promise.resolve(createMockResponse({ code: 0 }))
      })
    })

    it('应该删除任务', async () => {
      await client.deleteTask('task-123')
      expect(mockFetch).toHaveBeenCalled()
    })
  })

  describe('getTasks', () => {
    beforeEach(() => {
      mockFetch.mockImplementation((url: string) => {
        if (url.includes('auth')) {
          return Promise.resolve(createMockResponse({
            code: 0,
            tenant_access_token: 'test-token',
            expire: 7200,
          }))
        }
        return Promise.resolve(createMockResponse({
          code: 0,
          data: {
            items: [
              { task_id: '1', title: 'Task 1', completed: false },
              { task_id: '2', title: 'Task 2', completed: true },
            ],
          },
        }))
      })
    })

    it('应该获取任务列表', async () => {
      const result = await client.getTasks('user-123')
      expect(result).toHaveLength(2)
    })
  })
})
