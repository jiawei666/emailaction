/**
 * 测试工厂 - 创建测试数据的统一接口
 */

import { PrismaClient } from '@prisma/client'
import { SyncStatus, Platform, NotificationType } from '@prisma/client'
import { vi } from 'vitest'

let prisma: PrismaClient

/**
 * 获取 Prisma 客户端（单例）
 */
export function getPrisma(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      datasources: {
        db: { url: process.env.DATABASE_URL || 'file:./test.db' },
      },
    })
  }
  return prisma
}

/**
 * 清理所有测试数据
 */
export async function cleanupDatabase() {
  const db = getPrisma()
  await db.syncItem.deleteMany({})
  await db.notification.deleteMany({})
  await db.taskAccount.deleteMany({})
  await db.gmailAccount.deleteMany({})
  await db.session.deleteMany({})
  await db.account.deleteMany({})
  await db.user.deleteMany({})
}

/**
 * 用户工厂
 */
export class UserFactory {
  static async create(overrides: Record<string, unknown> = {}) {
    const db = getPrisma()
    return db.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        name: 'Test User',
        emailVerified: new Date(),
        ...overrides,
      },
    })
  }

  static async createMany(count: number) {
    return Promise.all(
      Array.from({ length: count }, () => this.create())
    )
  }
}

/**
 * Gmail 账户工厂
 */
export class GmailAccountFactory {
  static async create(userId: string, overrides: Record<string, unknown> = {}) {
    const db = getPrisma()
    return db.gmailAccount.create({
      data: {
        userId,
        email: `gmail-${Date.now()}@example.com`,
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        syncStatus: 'PENDING',
        ...overrides,
      },
    })
  }
}

/**
 * 任务账户工厂
 */
export class TaskAccountFactory {
  static async create(userId: string, overrides: Record<string, unknown> = {}) {
    const db = getPrisma()
    return db.taskAccount.create({
      data: {
        userId,
        platform: 'TODOIST' as Platform,
        accountId: `task-${Date.now()}`,
        accessToken: 'test-task-token',
        isActive: true,
        ...overrides,
      },
    })
  }

  static async createForPlatform(
    userId: string,
    platform: Platform,
    overrides: Record<string, unknown> = {}
  ) {
    return this.create(userId, { platform, ...overrides })
  }
}

/**
 * 同步项目工厂
 */
export class SyncItemFactory {
  static async create(userId: string, overrides: Record<string, unknown> = {}) {
    const db = getPrisma()
    return db.syncItem.create({
      data: {
        userId,
        gmailAccountId: `gmail-${Date.now()}`,
        taskAccountId: `task-${Date.now()}`,
        gmailMessageId: `msg-${Date.now()}`,
        title: 'Test Task',
        description: 'Test description',
        status: 'PENDING' as SyncStatus,
        labels: '[]',
        ...overrides,
      },
    })
  }

  static async createWithAccounts(
    userId: string,
    overrides: Record<string, unknown> = {}
  ) {
    const gmailAccount = await GmailAccountFactory.create(userId)
    const taskAccount = await TaskAccountFactory.create(userId)

    return getPrisma().syncItem.create({
      data: {
        userId,
        gmailAccountId: gmailAccount.id,
        taskAccountId: taskAccount.id,
        gmailMessageId: `msg-${Date.now()}`,
        title: 'Test Task',
        description: 'Test description',
        status: 'PENDING' as SyncStatus,
        labels: '[]',
        ...overrides,
      },
    })
  }

  static async createWithStatus(
    userId: string,
    status: SyncStatus,
    overrides: Record<string, unknown> = {}
  ) {
    return this.create(userId, { status, ...overrides })
  }
}

/**
 * 通知工厂
 */
export class NotificationFactory {
  static async create(userId: string, overrides: Record<string, unknown> = {}) {
    const db = getPrisma()
    return db.notification.create({
      data: {
        userId,
        type: 'SYSTEM' as NotificationType,
        title: 'Test Notification',
        message: 'Test message',
        ...overrides,
      },
    })
  }
}

/**
 * 场景构建器 - 创建完整的测试场景
 */
export class ScenarioBuilder {
  private userId: string | null = null
  private gmailCount = 0
  private taskAccountCount = 0
  private syncItemCount = 0
  private syncItemStatus: SyncStatus = 'PENDING'

  constructor(userId?: string) {
    this.userId = userId || null
  }

  static async create() {
    const user = await UserFactory.create()
    return new ScenarioBuilder(user.id)
  }

  withGmailAccounts(count: number) {
    this.gmailCount = count
    return this
  }

  withTaskAccounts(count: number) {
    this.taskAccountCount = count
    return this
  }

  withSyncItems(count: number, status?: SyncStatus) {
    this.syncItemCount = count
    if (status) this.syncItemStatus = status
    return this
  }

  async build() {
    if (!this.userId) {
      throw new Error('User not initialized')
    }

    const gmailAccounts = await Promise.all(
      Array.from({ length: this.gmailCount }, () =>
        GmailAccountFactory.create(this.userId!)
      )
    )

    const taskAccounts = await Promise.all(
      Array.from({ length: this.taskAccountCount }, () =>
        TaskAccountFactory.create(this.userId!)
      )
    )

    const syncItems = await Promise.all(
      Array.from({ length: this.syncItemCount }, () =>
        SyncItemFactory.create(this.userId!, { status: this.syncItemStatus })
      )
    )

    return {
      userId: this.userId,
      gmailAccounts,
      taskAccounts,
      syncItems,
    }
  }
}

/**
 * Mock Fetch 工厂
 */
export class MockFetchBuilder {
  private mock: ReturnType<typeof vi.fn>

  constructor() {
    this.mock = vi.fn()
    global.fetch = this.mock
  }

  success(data: unknown, status = 200) {
    this.mock.mockResolvedValueOnce({
      ok: status >= 200 && status < 300,
      status,
      json: async () => data,
      text: async () => JSON.stringify(data),
    })
    return this
  }

  error(message: string, status = 500) {
    this.mock.mockResolvedValueOnce({
      ok: false,
      status,
      json: async () => ({ error: message }),
      text: async () => JSON.stringify({ error: message }),
    })
    return this
  }

  networkError() {
    this.mock.mockRejectedValueOnce(new Error('Network error'))
    return this
  }

  getMock() {
    return this.mock
  }

  static create() {
    return new MockFetchBuilder()
  }
}

/**
 * 时间旅行工具
 */
export class TimeTravel {
  private originalDate: typeof Date

  constructor() {
    this.originalDate = Date
  }

  freeze(date: Date | string) {
    const frozenDate = typeof date === 'string' ? new Date(date) : date
    global.Date = class extends this.originalDate {
      constructor() {
        super()
        return frozenDate as any
      }
      static now() {
        return frozenDate.getTime()
      }
    } as any
  }

  reset() {
    global.Date = this.originalDate
  }
}
