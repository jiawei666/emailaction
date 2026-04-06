/**
 * test/api/gmail.test.ts - 修复版
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cleanupDatabase, createTestUser, createTestGmailAccount, createTestTaskAccount, getPrisma } from '../../test/setup'

const prisma = getPrisma()
import { DELETE } from '@/app/api/gmail/accounts/route'
import { POST } from '@/app/api/gmail/sync/route'
import { GET } from '@/app/api/gmail/emails/route'

// Mock NextAuth
vi.mock('@/lib/session', () => ({
  requireAuth: vi.fn(async () => ({ id: 'test-user-id' })),
}))

// Mock Gmail API
vi.mock('@/lib/gmail', () => ({
  getGmailClient: vi.fn(),
  searchEmails: vi.fn(() => Promise.resolve({
    emails: [
      {
        id: 'msg-1',
        threadId: 'thread-1',
        subject: '待办：完成报告',
        from: 'boss@example.com',
        to: 'me@example.com',
        date: new Date(),
        body: '请在周五前完成报告',
        snippet: '请在周五前完成报告',
      },
    ],
  })),
}))

describe('/api/gmail/accounts', () => {
  beforeEach(async () => {
    await cleanupDatabase()
    await createTestUser({ id: 'test-user-id' })
  })

  afterEach(async () => {
    await cleanupDatabase()
  })

  describe('GET /api/gmail/accounts', () => {
    it('应该返回用户的 Gmail 账户列表', async () => {
      await createTestGmailAccount('test-user-id', { email: 'test1@gmail.com' })
      await createTestGmailAccount('test-user-id', { email: 'test2@gmail.com' })

      const { GET } = await import('@/app/api/gmail/accounts/route')
      const request = new Request('http://localhost:3000/api/gmail/accounts')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveLength(2)
    })
  })

  describe('DELETE /api/gmail/accounts', () => {
    it('应该删除 Gmail 账户', async () => {
      const account = await createTestGmailAccount('test-user-id')

      const { DELETE } = await import('@/app/api/gmail/accounts/route')
      const request = new Request(`http://localhost:3000/api/gmail/accounts?id=${account.id}`, {
        method: 'DELETE',
      })

      const response = await DELETE(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })
})

describe('/api/gmail/sync', () => {
  beforeEach(async () => {
    await cleanupDatabase()
    await createTestUser({ id: 'test-user-id' })
  })

  afterEach(async () => {
    await cleanupDatabase()
  })

  describe('POST /api/gmail/sync', () => {
    it('应该触发同步', async () => {
      const gmailAccount = await createTestGmailAccount('test-user-id')
      const taskAccount = await createTestTaskAccount('test-user-id')

      const body = {
        accountId: gmailAccount.id,
        taskAccountId: taskAccount.id,
        query: 'is:unread',
        days: 7,
      }

      const { POST } = await import('@/app/api/gmail/sync/route')
      const request = new Request('http://localhost:3000/api/gmail/sync', {
        method: 'POST',
        body: JSON.stringify(body),
      })

      const response = await POST(request)
      const data = await response.json()
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })
})
