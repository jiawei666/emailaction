/**
 * 测试辅助函数
 */

import { vi } from 'vitest'
import { MockFetchBuilder } from './test-factory'

/**
 * 创建 Mock Request
 */
export function createMockRequest(
  url: string,
  options: RequestInit = {}
): Request {
  return new Request(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
}

/**
 * 创建 Mock Response
 */
export function createMockResponse(
  data: unknown,
  status = 200,
  headers: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  })
}

/**
 * 解析响应 JSON
 */
export async function parseResponse<T = unknown>(response: Response): Promise<T> {
  return response.json() as Promise<T>
}

/**
 * 等待异步操作
 */
export async function waitFor(condition: () => boolean, timeout = 5000): Promise<void> {
  const startTime = Date.now()
  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error(`Timeout waiting for condition`)
    }
    await new Promise(resolve => setTimeout(resolve, 10))
  }
}

/**
 * 延迟
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Mock NextAuth Session
 */
export function mockSession(overrides: Record<string, unknown> = {}) {
  const session = {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      ...overrides,
    },
    expires: new Date(Date.now() + 3600000).toISOString(),
  }

  vi.doMock('@/lib/session', () => ({
    requireAuth: vi.fn(async () => session.user),
    getCurrentUser: vi.fn(async () => session.user),
  }))

  return session
}

/**
 * 设置环境变量
 */
export function setEnvVars(vars: Record<string, string>) {
  for (const [key, value] of Object.entries(vars)) {
    process.env[key] = value
  }
}

/**
 * 清除环境变量
 */
export function clearEnvVars(...keys: string[]) {
  for (const key of keys) {
    delete process.env[key]
  }
}

/**
 * 创建测试环境变量
 */
export function createTestEnvVars() {
  return {
    DATABASE_URL: 'file:./test.db',
    NEXTAUTH_SECRET: 'test-secret',
    NEXTAUTH_URL: 'http://localhost:3000',
    GITHUB_CLIENT_ID: 'test-github-id',
    GITHUB_CLIENT_SECRET: 'test-github-secret',
    GOOGLE_CLIENT_ID: 'test-google-id',
    GOOGLE_CLIENT_SECRET: 'test-google-secret',
    ANTHROPIC_API_KEY: 'test-anthropic-key',
    FEISHU_APP_ID: 'test-feishu-id',
    FEISHU_APP_SECRET: 'test-feishu-secret',
  }
}

/**
 * 断言工具
 */
export const assertions = {
  // 断言响应状态
  async expectStatus(response: Response, status: number) {
    if (response.status !== status) {
      const text = await response.text()
      throw new Error(`Expected status ${status} but got ${response.status}: ${text}`)
    }
  },

  // 断言响应包含数据
  async expectContains<T>(response: Response, path: string, value: unknown) {
    const data = await response.json() as Record<string, unknown>
    const keys = path.split('.')
    let current: unknown = data
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = (current as Record<string, unknown>)[key]
      } else {
        throw new Error(`Path "${path}" not found in response`)
      }
    }
    if (current !== value) {
      throw new Error(`Expected ${path} to be ${value} but got ${current}`)
    }
  },

  // 断言数组长度
  async expectArrayLength(response: Response, path: string, length: number) {
    const data = await response.json() as Record<string, unknown>
    const keys = path.split('.')
    let current: unknown = data
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = (current as Record<string, unknown>)[key]
      } else {
        throw new Error(`Path "${path}" not found in response`)
      }
    }
    if (!Array.isArray(current) || current.length !== length) {
      throw new Error(`Expected ${path} to be array of length ${length}`)
    }
  },
}
