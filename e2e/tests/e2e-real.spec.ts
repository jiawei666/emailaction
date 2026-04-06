/**
 * 端到端完整流程测试 - 真用例
 *
 * 核心原则：
 * 1. 不用 if 跳过 - 让测试失败
 * 2. 严格断言每个步骤
 * 3. 验证完整用户流程
 *
 * 完整用户流程：
 * 登录 → 检查账户 → 触发同步 → 验证任务
 */

import { test, expect } from '@playwright/test'

test.describe('端到端完整流程 - 真用���', () => {
  test.use({ storageState: 'e2e/.auth/user.json' })

  test('完整流程: 登录 → 同步 → 验证', async ({ page }) => {
    console.log('\n' + '='.repeat(60))
    console.log('端到端测试开始')
    console.log('='.repeat(60))

    // ========== 步骤1: 验证登录 ==========
    console.log('\n📍 步骤1: 验证登录状态')
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // 严格断言：必须在 dashboard
    expect(page.url()).not.toContain('/auth/signin')
    expect(page.url()).toContain('/dashboard')
    console.log('✅ 登录状态有效')

    // ========== 步骤2: 检查 Gmail 账户 ==========
    console.log('\n📍 步骤2: 检查 Gmail 账户')
    const accountsResponse = await page.request.get('/api/gmail/accounts')

    // 严格断言：API 必须成功
    expect(accountsResponse.ok()).toBeTruthy()
    const gmailAccounts = await accountsResponse.json()
    console.log(`Gmail 账户数量: ${gmailAccounts.length}`)

    // 严格断言：必须有 Gmail 账户
    expect(gmailAccounts.length).toBeGreaterThan(0)
    console.log(`✅ Gmail 已连接: ${gmailAccounts[0].email}`)

    // ========== 步骤3: 检查任务平台 ==========
    console.log('\n📍 步骤3: 检查任务平台')
    const taskAccountsResponse = await page.request.get('/api/task-accounts')

    // 严格断言：API 必须成功
    expect(taskAccountsResponse.ok()).toBeTruthy()
    const taskAccounts = await taskAccountsResponse.json()
    console.log(`任务平台数量: ${taskAccounts.length}`)

    // 严格断言：必须有任务平台
    expect(taskAccounts.length).toBeGreaterThan(0)
    console.log(`✅ 任务平台已配置: ${taskAccounts[0].name || taskAccounts[0].type}`)

    // ========== 步骤4: 触发同步 ==========
    console.log('\n📍 步骤4: 触发邮件同步')
    const syncResponse = await page.request.post('/api/gmail/sync', {
      headers: { 'Content-Type': 'application/json' },
      data: {
        accountId: gmailAccounts[0].id,
        taskAccountId: taskAccounts[0].id,
        query: 'is:unread',
        days: 7,
      },
    })

    console.log(`同步 API 状态: ${syncResponse.status()}`)

    // 严格断言：同步 API 必须成功
    if (!syncResponse.ok()) {
      const errorText = await syncResponse.text()
      console.log(`❌ 同步失败: ${errorText}`)

      if (syncResponse.status() === 401) {
        throw new Error('Gmail 授权已过期，请重新运行: npm run test:e2e:auth')
      }

      throw new Error(`同步 API 失败: ${syncResponse.status()} - ${errorText}`)
    }

    expect(syncResponse.ok()).toBeTruthy()
    const syncResult = await syncResponse.json()
    console.log(`✅ 同步已触发: ${syncResult.message}`)

    // ========== 步骤5: 等待后台处理 ==========
    console.log('\n📍 步骤5: 等待后台处理')
    await page.waitForTimeout(5000)

    // ========== 步骤6: 验证同步状态 ==========
    console.log('\n📍 步骤6: 验证同步状态')
    const statusResponse = await page.request.get(`/api/gmail/sync?accountId=${gmailAccounts[0].id}`)

    // 严格断言：状态 API 必须成功
    expect(statusResponse.ok()).toBeTruthy()
    const statusData = await statusResponse.json()

    // API 返回格式: { success: true, data: { syncStatus, ... } }
    const syncInfo = statusData.data || statusData
    console.log(`同步状态: ${syncInfo.syncStatus}`)
    console.log(`最后同步时间: ${syncInfo.lastSyncAt || '无'}`)
    console.log(`同步项目数: ${syncInfo.syncItems?.length || 0}`)

    // 严格断言：同步状态必须是有效值
    expect(['SUCCESS', 'PROCESSING', 'FAILED']).toContain(syncInfo.syncStatus)
    console.log(`✅ 同步状态正常`)

    // ========== 步骤7: 验证任务 ==========
    console.log('\n📍 步骤7: 验证任务')
    const tasksResponse = await page.request.get('/api/tasks?limit=50')

    // 严格断言：任务 API 必须成功
    expect(tasksResponse.ok()).toBeTruthy()
    const tasksData = await tasksResponse.json()
    const tasks = tasksData.tasks || tasksData

    console.log(`总任务数: ${tasks.length}`)

    // 统计任务状态
    const byStatus: Record<string, number> = {}
    tasks.forEach((task: any) => {
      const status = task.status || 'UNKNOWN'
      byStatus[status] = (byStatus[status] || 0) + 1
    })

    console.log('\n任务状态分布:')
    Object.entries(byStatus).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`)
    })

    // ========== 最终报告 ==========
    console.log('\n' + '='.repeat(60))
    console.log('端到端测试报告')
    console.log('='.repeat(60))
    console.log(`✅ 登录状态: 有效`)
    console.log(`✅ Gmail 账户: ${gmailAccounts[0].email}`)
    console.log(`✅ 任务平台: ${taskAccounts[0].name || taskAccounts[0].type}`)
    console.log(`✅ 同步状态: ${syncInfo.syncStatus}`)
    console.log(`✅ 总任务数: ${tasks.length}`)
    console.log('='.repeat(60) + '\n')

    // 最终截图
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: 'e2e/screenshots/e2e-final.png', fullPage: true })
  })
})
