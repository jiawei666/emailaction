/**
 * test/mocks/glm.ts
 * GLM API Mock 工具
 */

import { vi } from 'vitest'
import type { EmailAnalysis } from '@/lib/glm'

export interface MockGLMResponse {
  tasks: Array<{
    title: string
    description: string
    dueDate?: string
    priority: 'HIGH' | 'MEDIUM' | 'LOW'
  }>
  sender: string
  summary: string
  hasActionItems: boolean
}

/**
 * 创建成功响应的 GLM Mock
 */
export function mockGLMSuccess(response: Partial<MockGLMResponse> = {}) {
  const defaultResponse: MockGLMResponse = {
    tasks: [
      {
        title: '完成周报',
        description: '需要在周五前完成本周工作总结',
        dueDate: '2025-01-17',
        priority: 'HIGH',
      },
    ],
    sender: '项目经理',
    summary: '要求完成周报',
    hasActionItems: true,
    ...response,
  }

  return mockGLMJSONResponse(defaultResponse)
}

/**
 * 创建返回 JSON 的 GLM Mock
 */
export function mockGLMJSONResponse(data: MockGLMResponse) {
  const mockFetch = vi.fn()
  mockFetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({
      id: 'mock-glm-id',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: JSON.stringify(data),
          },
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: 100,
        completion_tokens: 50,
        total_tokens: 150,
      },
    }),
    text: async () => JSON.stringify({ choices: [{ message: { content: JSON.stringify(data) } }] }),
  })

  global.fetch = mockFetch
  return mockFetch
}

/**
 * 创建 GLM 错误 Mock
 */
export function mockGLMError(error: { status?: number; message?: string } = {}) {
  const mockFetch = vi.fn()
  mockFetch.mockResolvedValue({
    ok: false,
    status: error.status || 500,
    json: async () => ({ error: error.message || 'GLM API error' }),
    text: async () => JSON.stringify({ error: error.message || 'GLM API error' }),
  })

  global.fetch = mockFetch
  return mockFetch
}

/**
 * 创建 GLM 网络错误 Mock
 */
export function mockGLMNetworkError() {
  const mockFetch = vi.fn()
  mockFetch.mockRejectedValue(new Error('Network error'))

  global.fetch = mockFetch
  return mockFetch
}

/**
 * 创建无待办事项的 GLM Mock
 */
export function mockGLMNoActionItems() {
  return mockGLMSuccess({
    tasks: [],
    sender: '发件人',
    summary: '普通邮件，无需处理',
    hasActionItems: false,
  })
}

/**
 * 创建快速检查的 GLM Mock（返回 true/false）
 */
export function mockGLMQuickCheck(result: boolean) {
  const mockFetch = vi.fn()
  mockFetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({
      id: 'mock-glm-id',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: result ? 'true' : 'false',
          },
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: 50,
        completion_tokens: 5,
        total_tokens: 55,
      },
    }),
  })

  global.fetch = mockFetch
  return mockFetch
}

/**
 * 创建多个待办事项的 GLM Mock
 */
export function mockGLMMultipleTasks(count: number) {
  const tasks = Array.from({ length: count }, (_, i) => ({
    title: `任务 ${i + 1}`,
    description: `任务描述 ${i + 1}`,
    dueDate: `2025-01-${String(i + 15).padStart(2, '0')}`,
    priority: ['HIGH', 'MEDIUM', 'LOW'][i % 3] as 'HIGH' | 'MEDIUM' | 'LOW',
  }))

  return mockGLMSuccess({ tasks })
}

/**
 * GLM Mock 构建器
 */
export class GLMMockBuilder {
  private mockFetch: ReturnType<typeof vi.fn>

  constructor() {
    this.mockFetch = vi.fn()
    global.fetch = this.mockFetch
  }

  withSuccessResponse(response: MockGLMResponse): this {
    this.mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        id: 'mock-glm-id',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: JSON.stringify(response),
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
          total_tokens: 150,
        },
      }),
    })
    return this
  }

  withPlainTextResponse(text: string): this {
    this.mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        id: 'mock-glm-id',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: text,
            },
            finish_reason: 'stop',
          },
        ],
      }),
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
    return new GLMMockBuilder()
  }
}

/**
 * 验证 GLM API 调用
 */
export function verifyGLMAPICall(
  mockFetch: ReturnType<typeof vi.fn>,
  expectedModel: string = 'glm-4'
) {
  expect(mockFetch).toHaveBeenCalled()
  const callArgs = mockFetch.mock.calls[0]
  expect(callArgs[0]).toContain('chat/completions')

  const options = callArgs[1]
  expect(options.method).toBe('POST')
  expect(options.headers.Authorization).toMatch(/Bearer .+/)

  const body = JSON.parse(options.body)
  expect(body.model).toBe(expectedModel)
  expect(body.messages).toBeDefined()
  expect(body.messages).toHaveLength(2) // system + user

  return body
}
