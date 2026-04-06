/**
 * E2E 测试全局 fixtures
 * 在 context 级别设置 mock 和认证，确保在页面导航前生效
 */

import { test as base, BrowserContext, Page } from '@playwright/test'

// 测试用户信息（与 middleware.ts 中的 TEST_USER 保持一致）
export interface TestUser {
  id: string
  email: string
  name: string
}

export const defaultTestUser: TestUser = {
  id: 'test-user-e2e',
  email: 'e2e-test@example.com',
  name: 'E2E Test User',
}

/**
 * 设置测试模式 cookie
 */
async function setTestModeCookies(context: BrowserContext) {
  await context.addCookies([
    {
      name: 'e2e-test-mode',
      value: 'true',
      domain: 'localhost',
      path: '/',
      sameSite: 'Lax',
    },
  ])
}

/**
 * Mock 所有外部服务（在 context 级别）
 */
async function mockContextServices(context: BrowserContext) {
  // Mock GLM API
  await context.route('**/open.bigmodel.cn/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        choices: [{
          message: {
            content: JSON.stringify({
              tasks: [{ title: '测试任务', priority: 'HIGH' }],
              hasActionItems: true,
              summary: '测试摘要'
            })
          }
        }]
      }),
    })
  })

  // Mock 认证 API（客户端会话获取）
  await context.route('**/api/auth/session', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: defaultTestUser,
        expires: new Date(Date.now() + 3600000).toISOString(),
      }),
    })
  })
}

/**
 * Mock 外部服务（页面级别，用于不使用 authenticatedPage 的测试）
 */
export async function mockAllExternalServices(page: Page) {
  // Mock GLM API
  await page.route('**/open.bigmodel.cn/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        choices: [{
          message: {
            content: JSON.stringify({
              tasks: [{ title: '测试任务', priority: 'HIGH' }],
              hasActionItems: true,
              summary: '测试摘要'
            })
          }
        }]
      }),
    })
  })

  // Mock 认证 API
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
}

/**
 * 测试 fixtures 类型
 */
type TestFixtures = {
  authenticatedPage: Page
}

/**
 * 扩展的 test 对象，包含认证功能
 * 使用这个 test 对象的测试会自动获得认证状态
 */
export const test = base.extend<TestFixtures>({
  // 提供已认证的页面
  authenticatedPage: async ({ page, context }, use) => {
    // 先设置测试模式和 mock（在页面导航前）
    await setTestModeCookies(context)
    await mockContextServices(context)

    await use(page)
  },
})

// 导出标准 expect，保持兼容性
export { expect } from '@playwright/test'
