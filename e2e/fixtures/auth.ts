/**
 * 认证测试固件
 * 提供登录状态模拟和用户会话管理
 */

import { test as base, Page, BrowserContext } from '@playwright/test'

// 测试用户信息
export interface TestUser {
  id: string
  email: string
  name: string
}

// 默认测试用户
export const defaultTestUser: TestUser = {
  id: 'test-user-e2e',
  email: 'e2e-test@example.com',
  name: 'E2E Test User',
}

/**
 * 创建模拟的会话 cookie
 */
async function createSessionCookie(context: BrowserContext, user: TestUser) {
  // 在实际应用中，这里需要生成有效的 NextAuth session token
  // 对于 E2E 测试，我们可以：
  // 1. 通过 API 创建真实的会话
  // 2. 或者 Mock 认证检查

  await context.addCookies([
    {
      name: 'next-auth.session-token',
      value: `mock-session-${user.id}`,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
      expires: Math.floor(Date.now() / 1000) + 3600, // 1小时后过期
    },
  ])
}

/**
 * 认证固件类型定义
 */
type AuthFixtures = {
  authenticatedPage: Page
  testUser: TestUser
}

/**
 * 扩展的 test 对象，包含认证功能
 */
export const test = base.extend<AuthFixtures>({
  // 提供已认证的页面
  authenticatedPage: async ({ page, context }, use) => {
    await createSessionCookie(context, defaultTestUser)

    // Mock 认证 API 响应
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: defaultTestUser,
          expires: new Date(Date.now() + 3600000).toISOString(),
        }),
      })
    })

    await use(page)
  },

  // 提供测试用户信息
  testUser: async ({}, use) => {
    await use(defaultTestUser)
  },
})

/**
 * 辅助函数：登录用户
 */
export async function loginUser(page: Page, user: TestUser = defaultTestUser) {
  // 访问登录页面
  await page.goto('/api/auth/signin')

  // 等待登录页面加载
  await page.waitForLoadState('networkidle')

  // 在实际应用中，这里需要：
  // 1. 点击 GitHub 登录按钮
  // 2. 在 GitHub OAuth 页面完成授权
  // 3. 等待重定向回应用

  // 对于测试，我们直接设置 cookie
  const context = page.context()
  await createSessionCookie(context, user)
}

/**
 * 辅助函数：登出用户
 */
export async function logoutUser(page: Page) {
  await page.goto('/api/auth/signout')
  await page.waitForLoadState('networkidle')

  // 清除会话 cookie
  const context = page.context()
  await context.clearCookies()
}

export { expect } from '@playwright/test'
