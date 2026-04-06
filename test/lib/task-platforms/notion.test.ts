/**
 * Notion 客户端测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NotionClient } from '@/lib/task-platforms/notion'

describe('NotionClient', () => {
  let client: NotionClient
  let mockFetch: ReturnType<typeof vi.fn>

  beforeEach(() => {
    client = new NotionClient('test-token')
    mockFetch = vi.fn()
    global.fetch = mockFetch
  })

  describe('createTask', () => {
    it('应该创建基本任务', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'page-123' }),
      })

      const result = await client.createTask({
        databaseId: 'db-123',
        title: 'Test Task',
      })

      expect(result.taskId).toBe('page-123')
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.notion.com/v1/pages',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
            'Notion-Version': '2022-06-28',
          }),
        })
      )
    })

    it('应该创建带描述的任务', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'page-123' }),
      })

      await client.createTask({
        databaseId: 'db-123',
        title: 'Test Task',
        description: 'Test description',
      })

      const body = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(body.properties.Description).toBeDefined()
    })

    it('应该创建带截止日期的任务', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'page-123' }),
      })

      const dueDate = new Date('2025-01-15T10:00:00Z')
      await client.createTask({
        databaseId: 'db-123',
        title: 'Test Task',
        dueDate,
      })

      const body = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(body.properties['Due Date']).toBeDefined()
    })

    it('应该创建带优先级的任务', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'page-123' }),
      })

      await client.createTask({
        databaseId: 'db-123',
        title: 'Test Task',
        priority: 4,
      })

      const body = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(body.properties.Priority).toBeDefined()
    })

    it('应该正确映射优先级', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'page-123' }),
      })

      // 高优先级
      await client.createTask({
        databaseId: 'db-123',
        title: 'High Priority',
        priority: 4,
      })

      let body = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(body.properties.Priority.select.name).toBe('High')

      // 中优先级
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'page-456' }),
      })

      await client.createTask({
        databaseId: 'db-123',
        title: 'Medium Priority',
        priority: 3,
      })

      body = JSON.parse(mockFetch.mock.calls[1][1].body)
      expect(body.properties.Priority.select.name).toBe('Medium')
    })

    it('应该处理创建失败', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Invalid database' }),
      })

      await expect(
        client.createTask({
          databaseId: 'db-123',
          title: 'Test Task',
        })
      ).rejects.toThrow('Failed to create Notion task')
    })
  })

  describe('updateTask', () => {
    it('应该更新任务标题', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      })

      await client.updateTask('page-123', { title: 'Updated Title' })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.notion.com/v1/pages/page-123',
        expect.objectContaining({
          method: 'PATCH',
        })
      )

      const body = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(body.properties.Name).toBeDefined()
    })

    it('应该更新任务截止日期', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      })

      const dueDate = new Date('2025-01-20')
      await client.updateTask('page-123', { dueDate })

      const body = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(body.properties['Due Date']).toBeDefined()
    })

    it('应该标记任务为完成', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      })

      await client.updateTask('page-123', { completed: true })

      const body = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(body.properties.Status.status.name).toBe('Done')
    })

    it('应该标记任务为未完成', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      })

      await client.updateTask('page-123', { completed: false })

      const body = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(body.properties.Status.status.name).toBe('Not Started')
    })

    it('应该处理更新失败', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Page not found' }),
      })

      await expect(
        client.updateTask('page-123', { title: 'New' })
      ).rejects.toThrow('Failed to update Notion task')
    })
  })

  describe('searchDatabase', () => {
    it('应该搜索数据库', async () => {
      const mockResults = [
        { id: 'db-1', object: 'database', title: [{ plain_text: 'Project DB' }] },
      ]

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ results: mockResults }),
      })

      const result = await client.searchDatabase('Project')

      expect(result).toEqual(mockResults)
    })

    it('应该处理搜索失败', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Invalid search' }),
      })

      await expect(client.searchDatabase('test')).rejects.toThrow('Failed to search Notion')
    })
  })
})
