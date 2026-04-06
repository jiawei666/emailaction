import { afterEach, vi, beforeAll, afterAll } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import { existsSync, unlinkSync } from 'fs'
import { join } from 'path'

 console.log('Starting test setup...')
const testDbUrl = process.env.TEST_DATABASE_URL
const testDbPath = join(process.cwd(), 'prisma', 'test.db')
if (testDbUrl) {
  console.log(`Test database URL: ${testDbUrl}`)
} else {
  console.log('TEST_DATABASE_URL is not set, database setup will be skipped')
}
 // Mock NextAuth
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(() => ({ data: { user: { id: 'test-user-id' } }, status: 'authenticated' })),
  signIn: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(),
  getServerSession: vi.fn(),
})
)
 // Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  })),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
})
)
// 设置测试环境变量
if (testDbUrl) {
  process.env.DATABASE_URL = testDbUrl
}
process.env.NEXTAUTH_SECRET = 'test-secret-key'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.GITHUB_CLIENT_ID = 'test-github-id'
process.env.GITHUB_CLIENT_SECRET = 'test-github-secret'
process.env.GOOGLE_CLIENT_ID = 'test-google-id'
process.env.GOOGLE_CLIENT_SECRET = 'test-google-secret'
process.env.ANTHROPIC_API_KEY = 'test-anthropic-key'
// 创建全局 Prisma 实例
const globalPrisma = testDbUrl
  ? new PrismaClient({
      datasources: {
        db: { url: testDbUrl },
      },
    })
  : null
// 导出给测试使用
;(globalThis as any).__TEST_PRISMA__ = globalPrisma
 // 数据库初始化标志（使用全局变量）
declare global {
  var __dbInitialized__: boolean | undefined
}
 // 在所有测试前创建测试数据库
beforeAll(async () => {
  if (!testDbUrl) {
    return
  }

  // 防止并行测试时重复初始化
  if ((globalThis as any).__dbInitialized__) {
    console.log('Test database already initialized, skipping...')
    return
  }
  try {
    if (testDbUrl.startsWith('file:') && existsSync(testDbPath)) {
      console.log('Deleting old test database...')
      unlinkSync(testDbPath)
    }
    // 使用 prisma db push 来同步 schema
    console.log('Pushing database schema...')
    execSync(`npx prisma db push --skip-generate --accept-data-loss`, {
      env: { ...process.env, DATABASE_URL: testDbUrl },
      stdio: 'pipe',
      cwd: process.cwd(),
    })
    ;(globalThis as any).__dbInitialized__ = true
    console.log('Test database initialized successfully')
  } catch (error) {
    console.error('Failed to initialize test database:', error)
    throw error
  }
})
 // 在所有测试后断开连接
afterAll(async () => {
  if (globalPrisma) {
    await globalPrisma.$disconnect()
  }
})
 // 每个测试后清理全局状态
afterEach(() => {
  vi.clearAllMocks()
})
