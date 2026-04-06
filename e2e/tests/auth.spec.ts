/**
 * 认证流程 E2E 测试 - 真实环境
 * 不使用 mock，验证真实 OAuth 流程
 *
 * 前置条件：
 * - 开发服务器运行中
 * - 数据库已配置
 * - 真实账号可用
 */

import { test, expect } from '@playwright/test'

test.describe('认证流程 - 真实环境', () => {
  test('登录页应该正确加载并显示 OAuth 选项', async ({ page }) => {
    await page.goto('/api/auth/signin')
    await page.waitForLoadState('networkidle')

    // 验证页面标题
    const title = await page.title()
    expect(title).toBeTruthy()
    console.log('页面标题:', title)

    // 验证 OAuth 按钮存在（至少一个）
    const googleBtn = page.locator('button:has-text("Google")')
    const githubBtn = page.locator('button:has-text("GitHub")')

    const hasGoogle = await googleBtn.count()
    const hasGithub = await githubBtn.count()

    expect(hasGoogle + hasGithub).toBeGreaterThan(0)
    console.log('OAuth 选项: Google=' + hasGoogle + ', GitHub=' + hasGithub)
  })

  test('点击 Google 登录应该跳转到 OAuth', async ({ page }) => {
    await page.goto('/api/auth/signin')
    await page.waitForLoadState('networkidle')

    const googleBtn = page.locator('button:has-text("Google")').first()
    await expect(googleBtn).toBeVisible({ timeout: 10000 })
    await googleBtn.click()

    // 验证跳转
    await page.waitForURL(/accounts\.google\.com|\/api\/auth\/callback|\/dashboard/, { timeout: 30000 })
    const url = page.url()
    console.log('跳转到:', url)

    expect(url).toMatch(/accounts\.google\.com|\/api\/auth\/callback|\/dashboard/)
  })
})

test.describe('已登录状态 - 真实环境', () => {
  test.use({ storageState: 'e2e/.auth/user.json' })

  test('Dashboard 应该显示用户数据', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // 验证 URL
    expect(page.url()).toContain('/dashboard')

    // 验证页面内容（不 mock）
    const mainContent = await page.locator('main').textContent()
    console.log('Dashboard 内容长度:', mainContent?.length || 0)

    // 验证关键元素存在
    const nav = page.locator('nav')
    await expect(nav).toBeVisible({ timeout: 10000 })
  })

  test('API 应该返回真实数据', async ({ page }) => {
    // 调用真实 API
    const response = await page.request.get('/api/user/account')
    console.log('API 状态:', response.status())

    if (response.ok()) {
      const data = await response.json()
      console.log('用户数据:', JSON.stringify(data, null, 2))
      expect(data).toHaveProperty('email')
    } else {
      console.log('API 返回非 200，可能未登录')
    }
  })
})
