/**
 * lib/task-platforms/todoist.test.ts
 * Todoist 客户端测试 - 修复版
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { TodoistClient } from '@/lib/task-platforms/todoist'

describe('TodoistClient', () => {
  let client: TodoistClient
  let mockFetch: ReturnType<typeof vi.fn>

  beforeEach(() => {
    client = new TodoistClient('test-token')
    mockFetch = vi.fn()
    global.fetch = mockFetch
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const createMockResponse = (data: unknown, ok = true, status = 200) => ({
    ok,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
  })

  describe('createTask', () => {
    it('应该创建基本任务', async () => {
      mockFetch.mockResolvedValue(createMockResponse({ id: 'task-123' }))

      const result = await client.createTask({
        title: 'Test Task',
      })

      expect(result.taskId).toBe('task-123')
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/tasks'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      )
    })

    it('应该创建带描述的任务', async () => {
      mockFetch.mockResolvedValue(createMockResponse({ id: 'task-123' }))

      await client.createTask({
        title: 'Test Task',
        description: 'Test description',
      })

      const body = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(body.description).toBe('Test description')
    })

    it('应该创建带截止日期的任务', async () => {
      mockFetch.mockResolvedValue(createMockResponse({ id: 'task-123' }))

      const dueDate = new Date('2025-01-15')
      await client.createTask({
        title: 'Test Task',
        dueDate,
      })

      const body = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(body.due_date).toBe('2025-01-15')
    })

    it('应该创建带优先级的任务', async () => {
      mockFetch.mockResolvedValue(createMockResponse({ id: 'task-123' }))

      await client.createTask({
        title: 'Test Task',
        priority: 4,
      })

      const body = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(body.priority).toBe(4)
    })

    it('应该创建带项目 ID 的任务', async () => {
      mockFetch.mockResolvedValue(createMockResponse({ id: 'task-123' }))

      await client.createTask({
        title: 'Test Task',
        projectId: 'project-123',
      })

      const body = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(body.project_id).toBe('project-123')
    })

    it('应该处理创建失败', async () => {
      mockFetch.mockResolvedValue(createMockResponse({ error: 'Invalid request' }, false, 400))

      await expect(
        client.createTask({ title: 'Test Task' })
      ).rejects.toThrow('Failed to create Todoist task')
    })
  })

  describe('updateTask', () => {
    it('应该更新任务标题', async () => {
      mockFetch.mockResolvedValue(createMockResponse({}))

      await client.updateTask('task-123', { title: 'Updated Title' })

      const body = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(body.content).toBe('Updated Title')
    })

    it('应该更新任务描述', async () => {
      mockFetch.mockResolvedValue(createMockResponse({}))

      await client.updateTask('task-123', { description: 'New description' })

      const body = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(body.description).toBe('New description')
    })

    it('应该更新任务截止日期', async () => {
      mockFetch.mockResolvedValue(createMockResponse({}))

      const dueDate = new Date('2025-01-20')
      await client.updateTask('task-123', { dueDate })

      const body = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(body.due_date).toBe('2025-01-20')
    })

    it('应该标记任务为完成', async () => {
      mockFetch.mockResolvedValue(createMockResponse({}))

      await client.updateTask('task-123', { completed: true })

      const body = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(body.is_completed).toBe(true)
    })

    it('应该更新优先级', async () => {
      mockFetch.mockResolvedValue(createMockResponse({}))

      await client.updateTask('task-123', { priority: 4 })

      const body = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(body.priority).toBe(4)
    })

    it('应该处理更新失败', async () => {
      mockFetch.mockResolvedValue(createMockResponse({ error: 'Task not found' }, false, 404))

      await expect(
        client.updateTask('task-123', { title: 'New' })
      ).rejects.toThrow('Failed to update Todoist task')
    })
  })

  describe('deleteTask', () => {
    it('应该删除任务', async () => {
      mockFetch.mockResolvedValue(createMockResponse(null))

      await client.deleteTask('task-123')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/tasks/task-123'),
        expect.objectContaining({
          method: 'DELETE',
        })
      )
    })

    it('应该处理删除失败', async () => {
      mockFetch.mockResolvedValue(createMockResponse({ error: 'Not found' }, false, 404))

      await expect(client.deleteTask('task-123')).rejects.toThrow('Failed to delete Todoist task')
    })
  })

  describe('getTasks', () => {
    it('应该获取任务列表', async () => {
      const mockTasks = [
        { id: '1', content: 'Task 1', completed: false },
        { id: '2', content: 'Task 2', completed: true },
      ]

      mockFetch.mockResolvedValue(createMockResponse(mockTasks))

      const result = await client.getTasks()

      expect(result).toEqual(mockTasks)
    })

    it('应该处理获取失败', async () => {
      mockFetch.mockResolvedValue(createMockResponse({ error: 'Unauthorized' }, false, 401))

      await expect(client.getTasks()).rejects.toThrow('Failed to get Todoist tasks')
    })
  })

  describe('closeTask', () => {
    it('应该关闭任务', async () => {
      mockFetch.mockResolvedValue(createMockResponse(null))

      await client.closeTask('task-123')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/tasks/task-123/close'),
        expect.objectContaining({
          method: 'POST',
        })
      )
    })
  })

  describe('reopenTask', () => {
    it('应该重新打开任务', async () => {
      mockFetch.mockResolvedValue(createMockResponse(null))

      await client.reopenTask('task-123')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/tasks/task-123/reopen'),
        expect.objectContaining({
          method: 'POST',
        })
      )
    })
  })
})
