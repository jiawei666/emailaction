/**
 * 手动登录并保存认证状态的脚本
 * 运行: npx playwright test explore-auth --headed
 */

import { test as base } from '@playwright/test'

const baseURL = 'http://localhost:3003'

base('手动登录并保存状态', async ({ page, context }) => {
  // 导航到登录页
  await page.goto(baseURL + '/api/auth/signin')

  console.log('\n========================================')
  console.log('请在浏览器��完成登录')
  console.log('（可以等待更长时间，没有超时限制）')
  console.log('========================================\n')

  // 使用一个更长的等待循环，检测登录状态
  let isLoggedIn = false
  const maxWaitTime = 300000 // 5分钟

  for (let i = 0; i < maxWaitTime / 1000; i++) {
    await page.waitForTimeout(1000)

    const url = page.url()

    // 检查是否已经登录��跳转到 dashboard
    if (url.includes('/dashboard')) {
      isLoggedIn = true
      break
    }

    // 每30秒打印一次提示
    if (i % 30 === 0 && i > 0) {
      console.log(`等待中... 已等待 ${i} 秒`)
    }
  }

  if (!isLoggedIn) {
    console.log('等待超时，未能检测到登录状态')
    console.log('如果已经登录，请检查当前 URL:', page.url())
  } else {
    console.log('检测到登录成功！当前 URL:', page.url())

    // 额外等待确保页面完全加载
    await page.waitForTimeout(2000)

    // 保存认证状态
    await context.storageState({ path: 'e2e/.auth/user.json' })

    console.log('认证状态已保存到 e2e/.auth/user.json')
    console.log('现在可以运行其他测试了')
  }
})
