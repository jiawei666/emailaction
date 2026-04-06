/**
 * E2E 测试 Mock 固件
 * 为现有测试提供向后兼容的接口
 */

import { Page, BrowserContext, test as base } from '@playwright/test'

// 测试用户信息（与 middleware.ts 中的 TEST_USER 保持一致）
export const defaultTestUser = {
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
 * Mock 所有外部服务（页面级别）
 * 此函数为现有测试提供向后兼容
 */
export async function mockAllExternalServices(page: Page) {
  const context = page.context()

  // 在任何请求之前设置测试模式 cookie
  await setTestModeCookies(context)

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

  // Mock 认证 API - 返回已登录状态
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

  // Mock Gmail 账户 API
  await page.route('**/api/gmail/accounts', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'gmail-1',
            email: 'test@gmail.com',
            syncStatus: 'SUCCESS',
            lastSyncAt: new Date().toISOString(),
          }
        ]),
      })
    } else {
      await route.continue()
    }
  })

  // Mock 任务账户 API
  await page.route('**/api/task-accounts', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'task-1',
            platform: 'FEISHU',
            email: 'test@feishu.cn',
            isActive: true,
          }
        ]),
      })
    } else {
      await route.continue()
    }
  })

  // Mock 任务 API
  await page.route('**/api/tasks*', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tasks: [
            {
              id: 'task-1',
              subject: '测试邮件任务',
              status: 'PENDING',
              priority: 'HIGH',
              createdAt: new Date().toISOString(),
            }
          ]
        }),
      })
    } else {
      await route.continue()
    }
  })

  // Mock 用户设置 API
  await page.route('**/api/user/settings', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          emailNotifications: true,
          autoSync: true,
          syncFrequency: 'FIFTEEN_MINUTES',
        }),
      })
    } else if (route.request().method() === 'PUT') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      })
    } else {
      await route.continue()
    }
  })
}

// 扩展 Playwright test 以支持认证
export const test = base.extend<{
  authenticatedPage: Page
}>({
  authenticatedPage: async ({ page }, use) => {
    // 设置测试模式
    await setTestModeCookies(page.context())
    await mockAllExternalServices(page)
    await use(page)
  },
})
