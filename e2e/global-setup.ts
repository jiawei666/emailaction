/**
 * E2E 测试全局 Setup
 * 在所有测试运行前设置认证状态
 */

import { chromium, FullConfig } from '@playwright/test'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 测试用户信息
const TEST_USER = {
  id: 'test-user-e2e',
  email: 'e2e-test@example.com',
  name: 'E2E Test User',
}

async function globalSetup(config: FullConfig) {
  console.log('🔧 Running E2E global setup...')

  // 1. 确保测试用户存在于数据库
  try {
    await prisma.user.upsert({
      where: { id: TEST_USER.id },
      create: {
        id: TEST_USER.id,
        email: TEST_USER.email,
        name: TEST_USER.name,
        emailVerified: new Date(),
      },
      update: {
        name: TEST_USER.name,
      },
    })
    console.log('✅ Test user created/updated in database')
  } catch (error) {
    console.log('⚠️ Could not create test user:', error)
  }

  // 2. 创建浏览器上下文并设置认证状态
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  // 3. 设置测试模式 cookie
  await context.addCookies([
    {
      name: 'e2e-test-mode',
      value: 'true',
      domain: 'localhost',
      path: '/',
      sameSite: 'Lax',
    },
  ])

  // 4. 访问应用以初始化 session
  const baseURL = config.projects[0]?.use?.baseURL || 'http://localhost:3000'
  await page.goto(baseURL)

  // 5. 保存认证状态
  await page.context().storageState({ path: 'e2e/.auth/user.json' })
  console.log('✅ Auth state saved to e2e/.auth/user.json')

  await browser.close()
  console.log('🎉 E2E global setup complete')
}

export default globalSetup
