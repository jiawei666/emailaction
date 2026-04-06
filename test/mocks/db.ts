/**
 * test/mocks/db.ts
 * Prisma Mock 工具
 */

import { mockDeep, MockProxy } from 'vitest-mock-extended'
import { PrismaClient } from '@prisma/client'
import {
  User,
  GmailAccount,
  TaskAccount,
  SyncItem,
  Notification,
  Platform,
  SyncStatus,
  NotificationType,
} from '@prisma/client'

/**
 * 创建完整的 Prisma Mock
 */
export function createMockPrisma() {
  return mockDeep<PrismaClient>()
}

/**
 * Mock 用户数据
 */
export function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    emailVerified: new Date(),
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

/**
 * Mock Gmail 账户数据
 */
export function createMockGmailAccount(overrides: Partial<GmailAccount> = {}): GmailAccount {
  return {
    id: 'test-gmail-id',
    userId: 'test-user-id',
    email: 'test@gmail.com',
    accessToken: 'test-access-token',
    refreshToken: 'test-refresh-token',
    tokenExpiry: null,
    historyId: null,
    syncStatus: 'PENDING',
    lastSyncAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

/**
 * Mock 任务账户数据
 */
export function createMockTaskAccount(overrides: Partial<TaskAccount> = {}): TaskAccount {
  return {
    id: 'test-task-id',
    userId: 'test-user-id',
    platform: Platform.TODOIST,
    accountId: 'todoist-account-id',
    email: null,
    accessToken: 'test-task-token',
    refreshToken: null,
    workspaceId: null,
    workspaceName: null,
    metadata: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

/**
 * Mock 同步项目数据
 */
export function createMockSyncItem(overrides: Partial<SyncItem> = {}): SyncItem {
  return {
    id: 'test-sync-id',
    userId: 'test-user-id',
    gmailAccountId: 'test-gmail-id',
    taskAccountId: 'test-task-id',
    gmailMessageId: 'test-message-id',
    title: 'Test Task',
    description: 'Test description',
    status: SyncStatus.PENDING,
    dueDate: null,
    priority: 2,
    taskId: null,
    syncedAt: null,
    error: null,
    retryCount: 0,
    labels: '[]',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

/**
 * Mock 通知数据
 */
export function createMockNotification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: 'test-notification-id',
    userId: 'test-user-id',
    type: NotificationType.SYSTEM,
    title: 'Test Notification',
    message: 'Test message',
    read: false,
    createdAt: new Date(),
    ...overrides,
  }
}

/**
 * Prisma Mock 构建器
 */
export class PrismaMockBuilder {
  private mockPrisma: MockProxy<PrismaClient>
  private users: User[] = []
  private gmailAccounts: GmailAccount[] = []
  private taskAccounts: TaskAccount[] = []
  private syncItems: SyncItem[] = []
  private notifications: Notification[] = []

  constructor() {
    this.mockPrisma = mockDeep<PrismaClient>()
    this.setupDefaultMocks()
  }

  private setupDefaultMocks() {
    // User mocks
    this.mockPrisma.user.findUnique.mockImplementation(async ({ where }) => {
      return this.users.find(u => u.id === (where as { id: string }).id) || null
    })

    this.mockPrisma.user.findFirst.mockImplementation(async ({ where }) => {
      return this.users.find(u => u.email === (where as { email: string }).email) || null
    })

    this.mockPrisma.user.findMany.mockResolvedValue(this.users)

    this.mockPrisma.user.create.mockImplementation(async ({ data }) => {
      const user = createMockUser(data as Partial<User>)
      this.users.push(user)
      return user
    })

    this.mockPrisma.user.update.mockImplementation(async ({ where, data }) => {
      const index = this.users.findIndex(u => u.id === (where as { id: string }).id)
      if (index === -1) throw new Error('User not found')
      this.users[index] = { ...this.users[index], ...(data as Partial<User>) }
      return this.users[index]
    })

    this.mockPrisma.user.deleteMany.mockImplementation(async () => {
      this.users = []
      return { count: this.users.length }
    })

    // GmailAccount mocks
    this.mockPrisma.gmailAccount.findUnique.mockImplementation(async ({ where }) => {
      return this.gmailAccounts.find(a => a.id === (where as { id: string }).id) || null
    })

    this.mockPrisma.gmailAccount.findMany.mockResolvedValue(this.gmailAccounts)

    this.mockPrisma.gmailAccount.create.mockImplementation(async ({ data }) => {
      const account = createMockGmailAccount(data as Partial<GmailAccount>)
      this.gmailAccounts.push(account)
      return account
    })

    this.mockPrisma.gmailAccount.update.mockImplementation(async ({ where, data }) => {
      const index = this.gmailAccounts.findIndex(a => a.id === (where as { id: string }).id)
      if (index === -1) throw new Error('GmailAccount not found')
      this.gmailAccounts[index] = { ...this.gmailAccounts[index], ...(data as Partial<GmailAccount>) }
      return this.gmailAccounts[index]
    })

    this.mockPrisma.gmailAccount.deleteMany.mockImplementation(async () => {
      this.gmailAccounts = []
      return { count: this.gmailAccounts.length }
    })

    // TaskAccount mocks
    this.mockPrisma.taskAccount.findUnique.mockImplementation(async ({ where }) => {
      return this.taskAccounts.find(a => a.id === (where as { id: string }).id) || null
    })

    this.mockPrisma.taskAccount.findMany.mockResolvedValue(this.taskAccounts)

    this.mockPrisma.taskAccount.create.mockImplementation(async ({ data }) => {
      const account = createMockTaskAccount(data as Partial<TaskAccount>)
      this.taskAccounts.push(account)
      return account
    })

    this.mockPrisma.taskAccount.update.mockImplementation(async ({ where, data }) => {
      const index = this.taskAccounts.findIndex(a => a.id === (where as { id: string }).id)
      if (index === -1) throw new Error('TaskAccount not found')
      this.taskAccounts[index] = { ...this.taskAccounts[index], ...(data as Partial<TaskAccount>) }
      return this.taskAccounts[index]
    })

    this.mockPrisma.taskAccount.deleteMany.mockImplementation(async () => {
      this.taskAccounts = []
      return { count: this.taskAccounts.length }
    })

    // SyncItem mocks
    this.mockPrisma.syncItem.findUnique.mockImplementation(async ({ where }) => {
      return this.syncItems.find(i => i.id === (where as { id: string }).id) || null
    })

    this.mockPrisma.syncItem.findMany.mockImplementation(async ({ where }) => {
      let items = this.syncItems
      if (where && 'userId' in where) {
        items = items.filter(i => i.userId === (where as { userId: string }).userId)
      }
      if (where && 'status' in where) {
        items = items.filter(i => i.status === (where as { status: SyncStatus }).status)
      }
      return items
    })

    this.mockPrisma.syncItem.create.mockImplementation(async ({ data }) => {
      const item = createMockSyncItem(data as Partial<SyncItem>)
      this.syncItems.push(item)
      return item
    })

    this.mockPrisma.syncItem.update.mockImplementation(async ({ where, data }) => {
      const index = this.syncItems.findIndex(i => i.id === (where as { id: string }).id)
      if (index === -1) throw new Error('SyncItem not found')
      this.syncItems[index] = { ...this.syncItems[index], ...(data as Partial<SyncItem>) }
      return this.syncItems[index]
    })

    this.mockPrisma.syncItem.deleteMany.mockImplementation(async () => {
      this.syncItems = []
      return { count: this.syncItems.length }
    })

    this.mockPrisma.syncItem.count.mockResolvedValue(this.syncItems.length)

    // Notification mocks
    this.mockPrisma.notification.findMany.mockResolvedValue(this.notifications)

    this.mockPrisma.notification.create.mockImplementation(async ({ data }) => {
      const notification = createMockNotification(data as Partial<Notification>)
      this.notifications.push(notification)
      return notification
    })

    this.mockPrisma.notification.deleteMany.mockImplementation(async () => {
      this.notifications = []
      return { count: this.notifications.length }
    })

    // Transaction mocks
    this.mockPrisma.$transaction.mockImplementation(async (callback) => {
      return callback(this.mockPrisma as unknown as PrismaClient)
    })

    // Disconnect mock
    this.mockPrisma.$disconnect.mockResolvedValue(undefined)
  }

  withUser(user: Partial<User> = {}): this {
    const mockUser = createMockUser(user)
    this.users.push(mockUser)
    return this
  }

  withGmailAccount(account: Partial<GmailAccount> = {}): this {
    const mockAccount = createMockGmailAccount(account)
    this.gmailAccounts.push(mockAccount)
    return this
  }

  withTaskAccount(account: Partial<TaskAccount> = {}): this {
    const mockAccount = createMockTaskAccount(account)
    this.taskAccounts.push(mockAccount)
    return this
  }

  withSyncItem(item: Partial<SyncItem> = {}): this {
    const mockItem = createMockSyncItem(item)
    this.syncItems.push(mockItem)
    return this
  }

  withNotification(notification: Partial<Notification> = {}): this {
    const mockNotification = createMockNotification(notification)
    this.notifications.push(mockNotification)
    return this
  }

  build(): MockProxy<PrismaClient> {
    return this.mockPrisma
  }

  static create() {
    return new PrismaMockBuilder()
  }
}

/**
 * 清理所有数据
 */
export function clearPrismaMockData(builder: PrismaMockBuilder) {
  // 返回新的 builder 实例
  return PrismaMockBuilder.create()
}
