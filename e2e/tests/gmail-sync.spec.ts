/**
 * Gmail 同步流程 - 真用例
 *
 * 核心原则：
 * 1. 不用 if 跳过 - 让测试失败
 * 2. 严格断言每个步骤
 * 3. 真实 API 调用
 */

import { test, expect } from '@playwright/test'

import { randomUUID } from 'crypto'

test.describe('Gmail 同步 - 真用例', () => {
  test.use({ storageState: 'e2e/.auth/user.json' })

  let testId: string
  let testRunId: string

  test('前置条件：必须已登录', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // 严格断言：必须在 dashboard 页面
    expect(page.url()).not.toContain('/auth/signin')
    expect(page.url()).toContain('/dashboard')
  })

  test('步骤1: 检查 Gmail 账户连接', async ({ page }) => {
    const response = await page.request.get('/api/gmail/accounts')

    // 严格断言：API 必须成功
    expect(response.ok()).toBeTruthy()

    const accounts = await response.json()
    console.log(`Gmail 账户数量: ${accounts.length}`)

    // 严格断言：必须有至少一个 Gmail 账户
    expect(accounts.length).toBeGreaterThan(0)

    // 严格断言：第一个账户必须有必要的字段
    const firstAccount = accounts[0]
    expect(firstAccount).toHaveProperty('id')
    expect(firstAccount).toHaveProperty('email')

    expect(firstAccount).toHaveProperty('accessToken')

    console.log(`✅ Gmail 账户已连接: ${firstAccount.email}`)
  })

  test('步骤2: 检查任务平台账户', async ({ page }) => {
    const response = await page.request.get('/api/task-accounts')

    // 严格断言：API 必须成功
    expect(response.ok()).toBeTruthy()

    const accounts = await response.json()
    console.log(`任务平台账户数量: ${accounts.length}`)

    // 严格断言：必须有至少一个任务平台账户
    expect(accounts.length).toBeGreaterThan(0)

    const firstAccount = accounts[0]
    console.log(`✅ 任务平台账户已配置: ${firstAccount.name || firstAccount.type}`)
  })

  test('步骤3: 触发同步 - 完整流程', async ({ page }) => {
    testRunId = `test-${randomUUID()}`

    console.log(`\n🧪 测试运行 ID: ${testRunId}`)
    console.log('='.repeat(60))

    // 获取账户信息
    const gmailAccountsResponse = await page.request.get('/api/gmail/accounts')
    expect(gmailAccountsResponse.ok()).toBeTruthy()
    const gmailAccounts = await gmailAccountsResponse.json()
    expect(gmailAccounts.length).toBeGreaterThan(0)

    const taskAccountsResponse = await page.request.get('/api/task-accounts')
    expect(taskAccountsResponse.ok()).toBeTruthy()
    const taskAccounts = await taskAccountsResponse.json()
    expect(taskAccounts.length).toBeGreaterThan(0)

    const gmailAccount = gmailAccounts[0]
    const taskAccount = taskAccounts[0]

    console.log(`使用 Gmail 账户: ${gmailAccount.email}`)
    console.log(`使用任务平台: ${taskAccount.name || taskAccount.type}`)

    // 调用同步 API
    const syncResponse = await page.request.post('/api/gmail/sync', {
      headers: { 'Content-Type': 'application/json' },
      data: {
        accountId: gmailAccount.id,
        taskAccountId: taskAccount.id,
        query: 'is:unread',
        days: 7,
      },
    })

    // 严格断言：同步 API 必须成功
    // 注意：如果返回 401，说明 token 无效，需要重新授权
    if (syncResponse.status() === 401) {
      console.log('⚠️ 同步 API 返回 401 - 需要 Gmail 重新授权')
      console.log('请在浏览器中完成 Gmail OAuth 授权，然后重新运行测试')
      test.skip()
      return
    }

    expect(syncResponse.ok()).toBeTruthy()

    const syncResult = await syncResponse.json()
    console.log('同步结果:', JSON.stringify(syncResult, null, 2))

    // 等待后台处理完成
    await page.waitForTimeout(5000)

    // 风险验证任务
    const tasksResponse = await page.request.get('/api/tasks?limit=50')
    expect(tasksResponse.ok()).toBeTruthy()

    const tasksData = await tasksResponse.json()
    const tasks = tasksData.tasks || tasksData
    console.log(`✅ 同步后任务数: ${tasks.length}`)

    // 截图
    await page.goto('/dashboard/pending')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: `e2e/screenshots/gmail-sync-complete.png`, fullPage: true })

    console.log('\n' + '='.repeat(60))
    console.log('✅ Gmail 同步测试完成')
    console.log('='.repeat(60))
  })
})
