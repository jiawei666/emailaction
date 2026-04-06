/**
 * 任务列表 - 真用例
 *
 * 核心原则：
 * 1. 不用 if 跳过 - 使用 expect 断言
 * 2. API 失败必须让测试失败
 * 3. 验证真实数据完整性
 */

import { test, expect } from '@playwright/test'

test.describe('任务列表 - 真用例', () => {
  test.use({ storageState: 'e2e/.auth/user.json' })

  test('前置条件：必须已登录', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // 严格断言：必须在 dashboard
    expect(page.url()).not.toContain('/auth/signin')
    expect(page.url()).toContain('/dashboard')
  })

  test('待处理任务 API 必须返回有效数据', async ({ page }) => {
    const response = await page.request.get('/api/tasks?status=PENDING&limit=50')

    // 严格断言：API 必须成功
    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)

    const data = await response.json()
    const tasks = data.tasks || data

    // 严格断言：必须是数组
    expect(Array.isArray(tasks)).toBeTruthy()

    console.log('待处理任务数量:', tasks.length)

    // 如果有任务，验证数据结构
    if (tasks.length > 0) {
      const firstTask = tasks[0]

      // 严格断言：任务必须有必要的字段
      expect(firstTask).toHaveProperty('id')
      expect(firstTask).toHaveProperty('status')

      console.log('第一个任务:', JSON.stringify(firstTask, null, 2))
    }

    await page.goto('/dashboard/pending')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: 'e2e/screenshots/pending-tasks.png' })
  })

  test('任务历史 API 必须返回有效数据', async ({ page }) => {
    const response = await page.request.get('/api/tasks?limit=20')

    // 严格断言：API 必须成功
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    const tasks = data.tasks || data

    console.log('历史任务数量:', tasks.length)

    // 统计各状态数量
    const byStatus: Record<string, number> = {}
    tasks.forEach((task: any) => {
      const status = task.status || 'UNKNOWN'
      byStatus[status] = (byStatus[status] || 0) + 1
    })

    console.log('\n=== 任务状态分布 ===')
    Object.entries(byStatus).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`)
    })

    await page.goto('/dashboard/history')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: 'e2e/screenshots/task-history.png' })
  })

  test('任务平台账户 API 必须返回有效数据', async ({ page }) => {
    const response = await page.request.get('/api/task-accounts')

    // 严格断言：API 必须成功
    expect(response.ok()).toBeTruthy()

    const accounts = await response.json()

    // 严格断言：必须是数组
    expect(Array.isArray(accounts)).toBeTruthy()

    console.log('任务平台账户数量:', accounts.length)

    // 打印账户详情
    accounts.forEach((acc: any, i: number) => {
      console.log(`${i + 1}. ${acc.name || acc.type} (${acc.type})`)
    })

    await page.screenshot({ path: 'e2e/screenshots/task-accounts.png' })
  })

  test('用户设置 API 必须返回有效数据', async ({ page }) => {
    const response = await page.request.get('/api/user/settings')

    // 严格断言：API 必须成功
    expect(response.ok()).toBeTruthy()

    const settings = await response.json()

    console.log('用户设置:', JSON.stringify(settings, null, 2))

    // 验证设置字段
    expect(settings).toHaveProperty('autoSync')

    await page.goto('/dashboard/settings')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: 'e2e/screenshots/settings.png' })
  })

  test('API 健康检查 - 所有关键 API', async ({ page }) => {
    const apis = [
      { name: 'Gmail 账户', url: '/api/gmail/accounts', required: true },
      { name: '任务列表', url: '/api/tasks?limit=10', required: true },
      { name: '任务平台', url: '/api/task-accounts', required: true },
      { name: '用户账户', url: '/api/user/account', required: true },
      { name: '用户设置', url: '/api/user/settings', required: true },
    ]

    console.log('\n=== API 健康检查 ===')

    const failedApis: string[] = []

    for (const api of apis) {
      const response = await page.request.get(api.url)
      const status = response.status()
      const ok = response.ok()

      let dataStr = ''
      if (ok) {
        try {
          const data = await response.json()
          if (Array.isArray(data)) {
            dataStr = `[${data.length} 项]`
          } else {
            dataStr = JSON.stringify(data).slice(0, 100)
          }
        } catch {
          dataStr = '(非 JSON)'
        }
      }

      console.log(`${api.name}: ${status} ${ok ? '✅' : '❌'} ${dataStr}`)

      // 严格断言：required API 必须成功
      if (api.required) {
        if (!ok) {
          failedApis.push(`${api.name} (${status})`)
        }
      }
    }

    console.log('===================\n')

    // 严格断言：所有 required API 必须成功
    if (failedApis.length > 0) {
      throw new Error(`关键 API 失败: ${failedApis.join(', ')}`)
    }
  })
})
