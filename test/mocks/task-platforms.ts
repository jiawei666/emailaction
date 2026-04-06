/**
 * test/mocks/task-platforms.ts
 * 任务平台 API Mock 工具
 */

import { vi } from 'vitest'
import { Platform } from '@prisma/client'

export interface MockTaskResponse {
  id: string
  content?: string
  title?: string
  description?: string
  due?: { date: string } | null
  priority?: number
  completed?: boolean
}

/**
 * Mock Todoist API
 */
export class TodoistMockBuilder {
  private mockFetch: ReturnType<typeof vi.fn>
  private baseUrl = 'https://api.todoist.com/rest/v2'
  private tasks: Map<string, MockTaskResponse> = new Map()

  constructor() {
    this.mockFetch = vi.fn()
    global.fetch = this.mockFetch
  }

  /**
   * Mock 创建任务成功
   */
  withCreateTaskSuccess(taskId: string): this {
    this.mockFetch.mockImplementation((url: string) => {
      if (url.includes('/tasks')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ id: taskId }),
        })
      }
      return Promise.reject(new Error(`Unknown URL: ${url}`))
    })
    return this
  }

  /**
   * Mock 更新任务成功
   */
  withUpdateTaskSuccess(taskId: string): this {
    this.mockFetch.mockImplementation((url: string) => {
      if (url.includes(`/tasks/${taskId}`)) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ id: taskId }),
        })
      }
      return Promise.reject(new Error(`Unknown URL: ${url}`))
    })
    return this
  }

  /**
   * Mock 删除任务成功
   */
  withDeleteTaskSuccess(taskId: string): this {
    this.mockFetch.mockImplementation((url: string) => {
      if (url.includes(`/tasks/${taskId}`)) {
        return Promise.resolve({
          ok: true,
          status: 204,
          json: async () => null,
        })
      }
      return Promise.reject(new Error(`Unknown URL: ${url}`))
    })
    return this
  }

  /**
   * Mock 获取任务列表
   */
  withGetTasks(tasks: MockTaskResponse[]): this {
    tasks.forEach(task => this.tasks.set(task.id, task))
    this.mockFetch.mockImplementation((url: string) => {
      if (url.includes('/tasks') && !url.includes('/tasks/')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => Array.from(this.tasks.values()),
        })
      }
      return Promise.reject(new Error(`Unknown URL: ${url}`))
    })
    return this
  }

  /**
   * Mock 关闭任务
   */
  withCloseTaskSuccess(taskId: string): this {
    this.mockFetch.mockImplementation((url: string) => {
      if (url.includes(`/tasks/${taskId}/close`)) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ id: taskId, completed: true }),
        })
      }
      return Promise.reject(new Error(`Unknown URL: ${url}`))
    })
    return this
  }

  /**
   * Mock 重新打开任务
   */
  withReopenTaskSuccess(taskId: string): this {
    this.mockFetch.mockImplementation((url: string) => {
      if (url.includes(`/tasks/${taskId}/reopen`)) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ id: taskId, completed: false }),
        })
      }
      return Promise.reject(new Error(`Unknown URL: ${url}`))
    })
    return this
  }

  /**
   * Mock 错误响应
   */
  withError(action: 'create' | 'update' | 'delete' | 'get', status: number, message: string): this {
    this.mockFetch.mockImplementation((url: string) => {
      const shouldError =
        (action === 'create' && url.includes('/tasks') && !url.includes('/tasks/')) ||
        (action === 'update' && url.includes('/tasks/') && !url.includes('/close') && !url.includes('/reopen')) ||
        (action === 'delete' && url.includes('/tasks/')) ||
        (action === 'get' && url.includes('/tasks'))

      if (shouldError) {
        return Promise.resolve({
          ok: false,
          status,
          json: async () => ({ error: message }),
          text: async () => JSON.stringify({ error: message }),
        })
      }
      return Promise.reject(new Error(`Unknown URL: ${url}`))
    })
    return this
  }

  /**
   * Mock 网络错误
   */
  withNetworkError(): this {
    this.mockFetch.mockRejectedValue(new Error('Network error'))
    return this
  }

  build() {
    return this.mockFetch
  }

  static create() {
    return new TodoistMockBuilder()
  }
}

/**
 * Mock Notion API
 */
export class NotionMockBuilder {
  private mockFetch: ReturnType<typeof vi.fn>

  constructor() {
    this.mockFetch = vi.fn()
    global.fetch = this.mockFetch
  }

  withCreateTaskSuccess(taskId: string, url: string): this {
    this.mockFetch.mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({
          id: taskId,
          url,
        }),
      })
    })
    return this
  }

  withUpdateTaskSuccess(pageId: string): this {
    this.mockFetch.mockImplementation((url: string) => {
      if (url.includes(`/pages/${pageId}`)) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ id: pageId }),
        })
      }
      return Promise.reject(new Error(`Unknown URL: ${url}`))
    })
    return this
  }

  withError(status: number, message: string): this {
    this.mockFetch.mockResolvedValue({
      ok: false,
      status,
      json: async () => ({ error: message }),
      text: async () => JSON.stringify({ error: message }),
    })
    return this
  }

  withNetworkError(): this {
    this.mockFetch.mockRejectedValue(new Error('Network error'))
    return this
  }

  build() {
    return this.mockFetch
  }

  static create() {
    return new NotionMockBuilder()
  }
}

/**
 * Mock 飞书 API
 */
export class FeishuMockBuilder {
  private mockFetch: ReturnType<typeof vi.fn>

  constructor() {
    this.mockFetch = vi.fn()
    global.fetch = this.mockFetch
  }

  withCreateTaskSuccess(taskId: string): this {
    this.mockFetch.mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({
          code: 0,
          msg: 'success',
          data: {
            task: {
              task_id: taskId,
            },
          },
        }),
      })
    })
    return this
  }

  withUpdateTaskSuccess(taskId: string): this {
    this.mockFetch.mockImplementation((url: string) => {
      if (url.includes(`/tasks/${taskId}`)) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({
            code: 0,
            msg: 'success',
            data: { task_id: taskId },
          }),
        })
      }
      return Promise.reject(new Error(`Unknown URL: ${url}`))
    })
    return this
  }

  withError(code: number, message: string): this {
    this.mockFetch.mockResolvedValue({
      ok: false,
      status: 200, // 飞书通常返回 200，错误在 code 中
      json: async () => ({
        code,
        msg: message,
      }),
    })
    return this
  }

  withNetworkError(): this {
    this.mockFetch.mockRejectedValue(new Error('Network error'))
    return this
  }

  build() {
    return this.mockFetch
  }

  static create() {
    return new FeishuMockBuilder()
  }
}

/**
 * 通用平台 Mock 工厂
 */
export class TaskPlatformMockBuilder {
  static forPlatform(platform: Platform) {
    switch (platform) {
      case Platform.TODOIST:
        return TodoistMockBuilder.create()
      case Platform.NOTION:
        return NotionMockBuilder.create()
      case Platform.FEISHU:
        return FeishuMockBuilder.create()
      default:
        throw new Error(`Unsupported platform: ${platform}`)
    }
  }
}

/**
 * 验证任务平台 API 调用
 */
export function verifyPlatformAPICall(
  mockFetch: ReturnType<typeof vi.fn>,
  platform: Platform,
  action: 'create' | 'update' | 'delete' | 'get'
) {
  expect(mockFetch).toHaveBeenCalled()
  const callArgs = mockFetch.mock.calls[0]
  const url = callArgs[0]

  switch (platform) {
    case Platform.TODOIST:
      expect(url).toContain('todoist.com')
      break
    case Platform.NOTION:
      expect(url).toContain('notion.com')
      break
    case Platform.FEISHU:
      expect(url).toContain('feishu.cn') || expect(url).toContain('larksuite.com')
      break
  }

  const options = callArgs[1]

  switch (action) {
    case 'create':
      expect(options.method).toBe('POST')
      break
    case 'update':
      expect(options.method).toBe('POST') // Todoist 使用 POST 更新
      break
    case 'delete':
      expect(options.method).toBe('DELETE')
      break
    case 'get':
      expect(options.method).toBe('GET')
      break
  }

  return { url, options }
}
