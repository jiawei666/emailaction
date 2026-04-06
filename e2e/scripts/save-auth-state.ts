/**
 * 手动登录并保存状态脚本
 * 运行: node e2e/scripts/save-auth-state.ts
 */

import { chromium } from 'playwright'

const baseURL = 'http://localhost:3003'

async function saveAuthState() {
  console.log('\n========================================')
  console.log('Playwright 手动登录工具')
  console.log('========================================\n')

  const browser = await chromium.launch({
    headless: false,
    slowMo: 50,
  })

  const context = await browser.newContext({
    baseURL,
  })

  const page = await context.newPage()

  // 导航到登录页
  await page.goto('/api/auth/signin')

  console.log('浏览器已打开，请在浏览器中完成登录')
  console.log('支持 Google 或 GitHub OAuth 登录\n')
  console.log('登录成功后，脚本会自动检测并保存状态...')
  console.log('（检测超时时间：5分钟）\n')

  // 等待用户登录
  let isLoggedIn = false
  const maxWaitTime = 300000 // 5分钟

  for (let i = 0; i < maxWaitTime / 1000; i++) {
    await page.waitForTimeout(1000)

    try {
      const url = page.url()

      // 检查是否已经登录（跳转到 dashboard 或首页）
      if (url.includes('/dashboard') || url.includes('/home')) {
        isLoggedIn = true
        break
      }

      // 每30秒打印一次提示
      if (i % 30 === 0 && i > 0) {
        console.log(`等待中... 已等待 ${i} 秒`)
        console.log(`当前 URL: ${url}`)
      }
    } catch (e) {
      // 忽略导航期间的错误
    }
  }

  if (!isLoggedIn) {
    console.log('\n等待超时，未能检测到登录状态')
    console.log('如果已经登录，脚本会尝试保存当前状态')
  } else {
    console.log('\n检测到登录成功！')
  }

  // 额外等待确保页面完全加载
  await page.waitForTimeout(2000)

  // 保存认证状态
  const fs = require('fs')
  const path = require('path')

  // 确保目录存在
  const authDir = path.join(process.cwd(), 'e2e/.auth')
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true })
  }

  await context.storageState({ path: 'e2e/.auth/user.json' })

  console.log('认证状态已保存到 e2e/.auth/user.json')
  console.log('\n现在可以运行页面探索测试了：')
  console.log('  npx playwright test explore-pages --project=chromium\n')

  // 关闭浏览器
  await browser.close()
}

saveAuthState().catch(console.error)
