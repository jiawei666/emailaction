/**
 * test/setup.ts - 使用真实 Prisma 客户端
 */

import { PrismaClient } from '@prisma/client'
import { join } from 'path'
import { prisma } from '@/lib/db'
// 测试数据库 URL
const testDbUrl = `file:${join(process.cwd(), 'prisma', 'test.db')}`
let prismaInstance: PrismaClient | null = null
// 使用全局 Prisma 实例（与 vitest.setup.ts 共享）
function getPrisma(): PrismaClient {
  if (!prismaInstance) {
    prismaInstance = prisma
  }
  return prismaInstance
}
/**
 * 生成唯一的测试 ID
 */
export function generateTestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(7)}`
}
/**
 * 清理测试数据库
 */
export async function cleanupDatabase() {
  const prisma = getPrisma()
  // 按照外键依赖顺序删除
  try { await prisma.syncItem.deleteMany({}) } catch (e) {}
  try { await prisma.notification.deleteMany({}) } catch (e) {}
  try { await prisma.taskAccount.deleteMany({}) } catch (e) {}
  try { await prisma.gmailAccount.deleteMany({}) } catch (e) {}
  try { await prisma.session.deleteMany({}) } catch (e) {}
  try { await prisma.account.deleteMany({}) } catch (e) {}
  try { await prisma.user.deleteMany({}) } catch (e) {}
}
/**
 * 创建测试用户
 */
export async function createTestUser(overrides: Record<string, unknown> = {}) {
  const prisma = getPrisma()
  const id = (overrides.id as string) || generateTestId()
  const email = (overrides.email as string) || `${id}@example.com`
  return prisma.user.create({
    data: {
      id,
      email,
      name: 'Test User',
      emailVerified: new Date(),
      ...overrides,
    },
  })
}
/**
 * 创建测试 Gmail 账户
 */
export async function createTestGmailAccount(userId: string, overrides: Record<string, unknown> = {}) {
  const prisma = getPrisma()
  const id = (overrides.id as string) || generateTestId()
  const email = (overrides.email as string) || `${id}@example.com`
  return prisma.gmailAccount.create({
    data: {
      id,
      userId,
      email,
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
      syncStatus: 'PENDING',
      ...overrides,
    },
  })
}
/**
 * 创建测试任务账户
 */
export async function createTestTaskAccount(userId: string, overrides: Record<string, unknown> = {}) {
  const prisma = getPrisma()
  const id = (overrides.id as string) || generateTestId()
  const accountId = (overrides.accountId as string) || id
  return prisma.taskAccount.create({
    data: {
      id,
      userId,
      platform: 'TODOIST',
      accountId,
      accessToken: 'test-task-token',
      isActive: true,
      ...overrides,
    },
  })
}
/**
 * 创建测试同步项目
 */
export async function createTestSyncItem(userId: string, overrides: Record<string, unknown> = {}) {
  const prisma = getPrisma()
  const id = (overrides.id as string) || generateTestId()
  const gmailAccountId = (overrides.gmailAccountId as string) || `gmail-${id}`
  const taskAccountId = (overrides.taskAccountId as string) || `task-${id}`
  // 先确保 GmailAccount 和 TaskAccount 存在
  if (!overrides.gmailAccountId) {
    await createTestGmailAccount(userId, { id: gmailAccountId })
  }
  if (!overrides.taskAccountId) {
    await createTestTaskAccount(userId, { id: taskAccountId })
  }
  return prisma.syncItem.create({
    data: {
      id,
      userId,
      gmailAccountId,
      taskAccountId,
      gmailMessageId: id,
      title: 'Test Task',
      description: 'Test description',
      status: 'PENDING',
      labels: '[]',
      ...overrides,
    },
  })
}
// 导出 Prisma 客户端
export { getPrisma, getPrisma as testPrisma }
