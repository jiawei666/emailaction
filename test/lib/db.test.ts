/**
 * test/lib/db.test.ts - 修复版
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { cleanupDatabase, createTestUser, createTestGmailAccount, createTestTaskAccount, getPrisma } from '../../test/setup'

const prisma = getPrisma()

describe('数据库层测试', () => {
  beforeEach(async () => {
    await cleanupDatabase()
  })

  afterEach(async () => {
    await cleanupDatabase()
  })

  describe('User 模型', () => {
    it('应该创建用户', async () => {
      const user = await prisma.user.create({
        data: {
          id: 'user-1',
          email: 'test@example.com',
          name: 'Test User',
        },
      })

      expect(user.email).toBe('test@example.com')
    })

    it('应该查询用户', async () => {
      const user = await createTestUser({ email: 'find@example.com' })

      const found = await prisma.user.findUnique({
        where: { email: 'find@example.com' },
      })

      expect(found).not.toBeNull()
    })

    it('应该删除用户', async () => {
      const user = await createTestUser()

      await prisma.user.delete({ where: { id: user.id } })

      const deleted = await prisma.user.findUnique({ where: { id: user.id } })
      expect(deleted).toBeNull()
    })
  })

  describe('GmailAccount 模型', () => {
    it('应该创建 Gmail 账户', async () => {
      const user = await createTestUser()
      const account = await createTestGmailAccount(user.id)

      expect(account.userId).toBe(user.id)
      expect(account.email).toContain('@example.com')
    })

    it('应该删除用户时级联删除 Gmail 账户', async () => {
      const user = await createTestUser()
      const account = await createTestGmailAccount(user.id)

      await prisma.user.delete({ where: { id: user.id } })

      const deleted = await prisma.gmailAccount.findUnique({ where: { id: account.id } })
      expect(deleted).toBeNull()
    })
  })

  describe('TaskAccount 模型', () => {
    it('应该创建任务账户', async () => {
      const user = await createTestUser()
      const account = await createTestTaskAccount(user.id, { platform: 'NOTION' })

      expect(account.platform).toBe('NOTION')
    })

    it('支持所有平台类型', async () => {
      const user = await createTestUser()

      const feishu = await prisma.taskAccount.create({
        data: {
          id: 'feishu-1',
          userId: user.id,
          platform: 'FEISHU',
          accountId: 'feishu-123',
        },
      })

      const notion = await prisma.taskAccount.create({
        data: {
          id: 'notion-1',
          userId: user.id,
          platform: 'NOTION',
          accountId: 'notion-123',
        },
      })

      const todoist = await prisma.taskAccount.create({
        data: {
          id: 'todoist-1',
          userId: user.id,
          platform: 'TODOIST',
          accountId: 'todoist-123',
        },
      })

      expect(feishu.platform).toBe('FEISHU')
      expect(notion.platform).toBe('NOTION')
      expect(todoist.platform).toBe('TODOIST')
    })
  })

  describe('SyncItem 模型', () => {
    it('应该创建同步项目', async () => {
      const user = await createTestUser()
      const gmail = await createTestGmailAccount(user.id)
      const task = await createTestTaskAccount(user.id)

      const syncItem = await prisma.syncItem.create({
        data: {
          id: 'sync-1',
          userId: user.id,
          gmailAccountId: gmail.id,
          taskAccountId: task.id,
          gmailMessageId: 'msg-1',
          title: 'Test Task',
          status: 'PENDING',
          labels: '[]',
        },
      })

      expect(syncItem.title).toBe('Test Task')
      expect(syncItem.status).toBe('PENDING')
    })

    it('应该支持所有状态', async () => {
      const user = await createTestUser()
      const gmail = await createTestGmailAccount(user.id)
      const task = await createTestTaskAccount(user.id)

      const statuses: Array<'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'CANCELLED'> =
        ['PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'CANCELLED']

      for (const status of statuses) {
        await prisma.syncItem.create({
          data: {
            id: `sync-${status}`,
            userId: user.id,
            gmailAccountId: gmail.id,
            taskAccountId: task.id,
            gmailMessageId: `msg-${status}`,
            title: `Task ${status}`,
            status,
            labels: '[]',
          },
        })
      }

      const items = await prisma.syncItem.findMany()
      expect(items).toHaveLength(5)
    })
  })

  describe('Notification 模型', () => {
    it('应该创建通知', async () => {
      const user = await createTestUser()

      const notification = await prisma.notification.create({
        data: {
          id: 'notif-1',
          userId: user.id,
          type: 'SYSTEM',
          title: 'Test Notification',
          message: 'Test message',
        },
      })

      expect(notification.type).toBe('SYSTEM')
      expect(notification.read).toBe(false)
    })

    it('应该标记为已读', async () => {
      const user = await createTestUser()

      const notification = await prisma.notification.create({
        data: {
          id: 'notif-1',
          userId: user.id,
          type: 'SYSTEM',
          title: 'Test',
          message: 'Test',
        },
      })

      const updated = await prisma.notification.update({
        where: { id: notification.id },
        data: { read: true },
      })

      expect(updated.read).toBe(true)
    })
  })

  describe('复杂查询', () => {
    it('应该按状态过滤同步项目', async () => {
      const user = await createTestUser()
      const gmail = await createTestGmailAccount(user.id)
      const task = await createTestTaskAccount(user.id)

      await prisma.syncItem.createMany({
        data: [
          {
            id: 'sync-1',
            userId: user.id,
            gmailAccountId: gmail.id,
            taskAccountId: task.id,
            gmailMessageId: 'msg-1',
            title: 'Pending 1',
            status: 'PENDING',
            labels: '[]',
          },
          {
            id: 'sync-2',
            userId: user.id,
            gmailAccountId: gmail.id,
            taskAccountId: task.id,
            gmailMessageId: 'msg-2',
            title: 'Pending 2',
            status: 'PENDING',
            labels: '[]',
          },
          {
            id: 'sync-3',
            userId: user.id,
            gmailAccountId: gmail.id,
            taskAccountId: task.id,
            gmailMessageId: 'msg-3',
            title: 'Success',
            status: 'SUCCESS',
            labels: '[]',
          },
        ],
      })

      const pending = await prisma.syncItem.findMany({
        where: { status: 'PENDING' },
      })

      expect(pending).toHaveLength(2)
    })

    it('应该统计各状态数量', async () => {
      const user = await createTestUser()
      const gmail = await createTestGmailAccount(user.id)
      const task = await createTestTaskAccount(user.id)

      await prisma.syncItem.createMany({
        data: [
          {
            id: 'sync-1',
            userId: user.id,
            gmailAccountId: gmail.id,
            taskAccountId: task.id,
            gmailMessageId: 'msg-1',
            title: 'Task 1',
            status: 'PENDING',
            labels: '[]',
          },
          {
            id: 'sync-2',
            userId: user.id,
            gmailAccountId: gmail.id,
            taskAccountId: task.id,
            gmailMessageId: 'msg-2',
            title: 'Task 2',
            status: 'SUCCESS',
            labels: '[]',
          },
          {
            id: 'sync-3',
            userId: user.id,
            gmailAccountId: gmail.id,
            taskAccountId: task.id,
            gmailMessageId: 'msg-3',
            title: 'Task 3',
            status: 'FAILED',
            labels: '[]',
          },
        ],
      })

      const stats = await prisma.syncItem.groupBy({
        by: ['status'],
        _count: true,
      })

      const statMap = stats.reduce((acc, item) => {
        acc[item.status] = item._count
        return acc
      }, {} as Record<string, number>)

      expect(statMap.PENDING).toBe(1)
      expect(statMap.SUCCESS).toBe(1)
      expect(statMap.FAILED).toBe(1)
    })
  })
})
