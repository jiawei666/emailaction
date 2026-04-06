/**
 * Gmail OAuth 诊断脚本
 * 运行方式: npx ts-node scripts/diagnose-gmail-oauth.ts
 */

import { config } from 'dotenv'
config({ path: '.env.local' })

const requiredEnvVars = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'DATABASE_URL',
]

console.log('\n🔍 EmailAction Gmail OAuth 诊断\n')
console.log('=' .repeat(50))

// 检查环境变量
console.log('\n📋 环境变量检查:')
const missingVars: string[] = []
const placeholderValues: string[] = []

for (const varName of requiredEnvVars) {
  const value = process.env[varName]
  if (!value) {
    missingVars.push(varName)
    console.log(`  ❌ ${varName}: 未设置`)
  } else if (value.includes('your-') || value.includes('change-')) {
    placeholderValues.push(varName)
    console.log(`  ⚠️  ${varName}: 使用的是占位符值`)
  } else {
    console.log(`  ✅ ${varName}: 已设置 (${value.substring(0, 20)}...)`)
  }
}

if (missingVars.length > 0) {
  console.log('\n❌ 缺少必要的环境变量!')
  console.log('请在 .env.local 文件中配置以下变量:')
  missingVars.forEach(v => console.log(`  - ${v}`))
  process.exit(1)
}

if (placeholderValues.length > 0) {
  console.log('\n⚠️  检测到占位符值!')
  console.log('请将以下变量替换为真实值:')
  placeholderValues.forEach(v => console.log(`  - ${v}`))
}

// 检查 Google OAuth 配置
console.log('\n🔐 Google OAuth 配置检查:')
const googleClientId = process.env.GOOGLE_CLIENT_ID || ''
if (googleClientId.includes('googleusercontent.com')) {
  console.log('  ✅ GOOGLE_CLIENT_ID 格式正确')
} else {
  console.log('  ❌ GOOGLE_CLIENT_ID 格式不正确')
  console.log('     应该类似于: xxx.apps.googleusercontent.com')
}

// 检查数据库
console.log('\n💾 数据库检查:')
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function checkDatabase() {
  try {
    await prisma.$connect()
    console.log('  ✅ 数据库连接成功')

    const userCount = await prisma.user.count()
    console.log(`  📊 用户数量: ${userCount}`)

    const gmailAccountCount = await prisma.gmailAccount.count()
    console.log(`  📊 Gmail 账户数量: ${gmailAccountCount}`)

    if (gmailAccountCount > 0) {
      const accounts = await prisma.gmailAccount.findMany({
        select: { email: true, syncStatus: true }
      })
      console.log('  📧 已连接的 Gmail 账户:')
      accounts.forEach(a => {
        console.log(`     - ${a.email} (${a.syncStatus})`)
      })
    }
  } catch (error) {
    console.log('  ❌ 数据库连接失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase().then(() => {
  console.log('\n' + '='.repeat(50))
  console.log('✅ 诊断完成\n')
})
