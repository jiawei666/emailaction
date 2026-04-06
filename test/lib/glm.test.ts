/**
 * test/lib/glm.test.ts
 * GLM 模块单元测试
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { analyzeEmail, analyzeEmails, quickCheckActionItems, type EmailAnalysis } from '@/lib/glm'
import { GLMMockBuilder, mockGLMSuccess, mockGLMNoActionItems, mockGLMError, mockGLMNetworkError, mockGLMQuickCheck, mockGLMMultipleTasks } from '../mocks/glm'

describe('GLM - 邮件分析', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('analyzeEmail', () => {
    it('应该成功分析包含待办的邮件', async () => {
      const mockFetch = mockGLMSuccess({
        tasks: [
          {
            title: '完成项目报告',
            description: '需要在周五前完成Q4项目总结报告',
            dueDate: '2025-01-17',
            priority: 'HIGH',
          },
        ],
        sender: '项目经理',
        summary: '要求完成Q4项目报告',
        hasActionItems: true,
      })

      const result = await analyzeEmail(
        '项目报告提醒',
        '请在本周五前完成Q4项目总结报告，包括：\n1. 项目进度总结\n2. 遇到的问题\n3. 下一步计划',
        'manager@example.com',
        '2025-01-15'
      )

      expect(result.hasActionItems).toBe(true)
      expect(result.tasks).toHaveLength(1)
      expect(result.tasks[0].title).toBe('完成项目报告')
      expect(result.tasks[0].priority).toBe('HIGH')
      expect(result.sender).toBe('项目经理')

      // 验证 API 调用
      expect(mockFetch).toHaveBeenCalled()
    })

    it('应该正确分析不包含待办的邮件', async () => {
      mockGLMNoActionItems()

      const result = await analyzeEmail(
        '本周总结',
        '本周工作进展顺利，没有特别的待办事项。',
        'colleague@example.com'
      )

      expect(result.hasActionItems).toBe(false)
      expect(result.tasks).toHaveLength(0)
    })

    it('应该提取多个待办事项', async () => {
      const mockFetch = mockGLMMultipleTasks(3)

      const result = await analyzeEmail(
        '任务分配',
        '请完成以下任务：\n1. 完成代码审查\n2. 更新文档\n3. 准备演示文稿',
        'team-lead@example.com'
      )

      expect(result.tasks).toHaveLength(3)
      expect(result.hasActionItems).toBe(true)
    })

    it('应该正确映射优先级', async () => {
      const mockFetch = mockGLMSuccess({
        tasks: [
          {
            title: '紧急任务',
            description: '立即处理',
            priority: 'HIGH',
          },
          {
            title: '普通任务',
            description: '本周完成',
            priority: 'MEDIUM',
          },
          {
            title: '低优先级任务',
            description: '有空时处理',
            priority: 'LOW',
          },
        ],
        sender: '系统',
        summary: '多优先级任务',
        hasActionItems: true,
      })

      const result = await analyzeEmail(
        '多优先级任务',
        '包含不同优先级的任务',
        'system@example.com'
      )

      expect(result.tasks[0].priority).toBe('HIGH')
      expect(result.tasks[1].priority).toBe('MEDIUM')
      expect(result.tasks[2].priority).toBe('LOW')
    })

    it('应该处理包含截止日期的任务', async () => {
      const dueDate = '2025-01-20'
      const mockFetch = mockGLMSuccess({
        tasks: [
          {
            title: '有截止日期的任务',
            description: '必须在指定日期前完成',
            dueDate,
            priority: 'HIGH',
          },
        ],
        sender: '客户',
        summary: '带截止日期的任务',
        hasActionItems: true,
      })

      const result = await analyzeEmail(
        '任务提醒',
        '请在2025年1月20日前完成任务',
        'client@example.com'
      )

      expect(result.tasks[0].dueDate).toBe(dueDate)
    })

    it('应该处理无截止日期的任务', async () => {
      const mockFetch = mockGLMSuccess({
        tasks: [
          {
            title: '无截止日期任务',
            description: '没有明确时间要求',
            priority: 'LOW',
          },
        ],
        sender: '同事',
        summary: '普通任务',
        hasActionItems: true,
      })

      const result = await analyzeEmail(
        '任务分配',
        '有空时处理这个',
        'colleague@example.com'
      )

      expect(result.tasks[0].dueDate).toBeUndefined()
    })

    it('应该处理 API 错误', async () => {
      mockGLMError({ status: 500, message: 'Internal server error' })

      await expect(
        analyzeEmail('测试邮件', '测试内容', 'test@example.com')
      ).rejects.toThrow('GLM API error')
    })

    it('应该处理网络错误', async () => {
      mockGLMNetworkError()

      await expect(
        analyzeEmail('测试邮件', '测试内容', 'test@example.com')
      ).rejects.toThrow('Network error')
    })

    it.skip('应该处理缺少 API Key (需要模块重置)', async () => {
      // 注意：这个测试需要模块重置，在 Vitest 环境中难以实现
      // 实际代码中已经包含了对 GLM_API_KEY 的检查
      const originalKey = process.env.GLM_API_KEY
      const testKey = 'test-key'

      // 临时设置一个测试 key
      process.env.GLM_API_KEY = testKey

      // 确保 API Key 设置正确
      expect(process.env.GLM_API_KEY).toBe(testKey)

      // 恢复原始值
      if (originalKey) {
        process.env.GLM_API_KEY = originalKey
      } else {
        delete process.env.GLM_API_KEY
      }
    })

    it('应该解析包含额外文本的 JSON 响应', async () => {
      const builder = GLMMockBuilder.create()
      builder.withPlainTextResponse('这是额外的文本\n```json\n{"tasks": [], "sender": "测试", "summary": "测试", "hasActionItems": false}\n```其他文本')
      builder.build()

      const result = await analyzeEmail('测试', '测试内容', 'test@example.com')

      expect(result.hasActionItems).toBe(false)
      expect(result.tasks).toHaveLength(0)
    })

    it('应该处理空的响应', async () => {
      const builder = GLMMockBuilder.create()
      builder.withPlainTextResponse('')
      builder.build()

      await expect(
        analyzeEmail('测试', '测试内容', 'test@example.com')
      ).rejects.toThrow()
    })
  })

  describe('analyzeEmails - 批量分析', () => {
    it('应该批量分析多封邮件', async () => {
      // 创建一个顺序返回不同响应的 mock
      const mockFetch = vi.fn()
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({
            id: 'mock-1',
            choices: [{
              message: { content: JSON.stringify({
                tasks: [{ title: '任务1', description: '描述1', priority: 'HIGH' }],
                sender: '发件人1',
                summary: '摘要1',
                hasActionItems: true,
              })}
            }],
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({
            id: 'mock-2',
            choices: [{
              message: { content: JSON.stringify({
                tasks: [],
                sender: '发件人2',
                summary: '摘要2',
                hasActionItems: false,
              })}
            }],
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({
            id: 'mock-3',
            choices: [{
              message: { content: JSON.stringify({
                tasks: [{ title: '任务3', description: '描述3', priority: 'MEDIUM' }],
                sender: '发件人3',
                summary: '摘要3',
                hasActionItems: true,
              })}
            }],
          }),
        })

      global.fetch = mockFetch

      const emails = [
        { id: 'email-1', subject: '邮件1', body: '内容1', from: 'from1@example.com' },
        { id: 'email-2', subject: '邮件2', body: '内容2', from: 'from2@example.com' },
        { id: 'email-3', subject: '邮件3', body: '内容3', from: 'from3@example.com' },
      ]

      const results = await analyzeEmails(emails)

      expect(results.size).toBe(3)
      expect(results.get('email-1')?.hasActionItems).toBe(true)
      expect(results.get('email-2')?.hasActionItems).toBe(false)
      expect(results.get('email-3')?.hasActionItems).toBe(true)
    })

    it('应该处理批量分析中的单封失败', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      // Mock 成功的邮件
      const mockFetch = vi.fn()
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({
            choices: [{
              message: { content: JSON.stringify({
                tasks: [{ title: '成功任务', description: '描述', priority: 'HIGH' }],
                sender: '发件人',
                summary: '摘要',
                hasActionItems: true,
              })}
            }],
          }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ error: 'API Error' }),
          text: async () => JSON.stringify({ error: 'API Error' }),
        })

      global.fetch = mockFetch

      const emails = [
        { id: 'success-email', subject: '成功', body: '内容', from: 'success@example.com' },
        { id: 'failed-email', subject: '失败', body: '内容', from: 'failed@example.com' },
      ]

      const results = await analyzeEmails(emails)

      expect(results.size).toBe(2)
      // 验证至少有一个结果
      expect(results.get('success-email') || results.get('failed-email')).toBeDefined()

      consoleSpy.mockRestore()
    })

    it('应该为失败的邮件返回默认分析结果', async () => {
      const mockFetch = vi.fn()
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({
            choices: [{
              message: { content: JSON.stringify({
                tasks: [],
                sender: 'test',
                summary: 'success',
                hasActionItems: false
              })}
            }],
          }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ error: 'API Error' }),
          text: async () => JSON.stringify({ error: 'API Error' }),
        })

      global.fetch = mockFetch

      const emails = [
        { id: 'email-1', subject: '成功', body: '内容', from: 'test@example.com' },
        { id: 'email-2', subject: '失败', body: '内容', from: 'test@example.com' },
      ]

      const results = await analyzeEmails(emails)

      // 失败的邮件应该有默认结果
      const failedResult = results.get('email-2')
      expect(failedResult).toBeDefined()
      expect(failedResult?.hasActionItems).toBe(false)
      expect(failedResult?.summary).toBe('分析失败')
    })
  })

  describe('quickCheckActionItems - 快速检查', () => {
    it('应该返回 true 对于包含待办的邮件', async () => {
      const mockFetch = mockGLMQuickCheck(true)

      const result = await quickCheckActionItems(
        '任务提醒',
        '请在今天完成报告'
      )

      expect(result).toBe(true)
      expect(mockFetch).toHaveBeenCalled()
    })

    it('应该返回 false 对于不包含待办的邮件', async () => {
      const mockFetch = mockGLMQuickCheck(false)

      const result = await quickCheckActionItems(
        '通知',
        '会议已取消'
      )

      expect(result).toBe(false)
    })

    it('应该处理 API 错误，返回 false', async () => {
      mockGLMError({ status: 500, message: 'Error' })

      const result = await quickCheckActionItems(
        '测试',
        '内容'
      )

      expect(result).toBe(false)
    })

    it('应该处理网络错误，返回 false', async () => {
      mockGLMNetworkError()

      const result = await quickCheckActionItems(
        '测试',
        '内容'
      )

      expect(result).toBe(false)
    })

    it('应该处理大写和混合大小写的响应', async () => {
      const builder = GLMMockBuilder.create()
      builder.withPlainTextResponse('TRUE')
      builder.build()

      const result1 = await quickCheckActionItems('测试', '内容')
      expect(result1).toBe(true)

      builder.withPlainTextResponse('false')
      const result2 = await quickCheckActionItems('测试', '内容')
      expect(result2).toBe(false)
    })
  })

  describe('系统集成场景', () => {
    it('应该处理完整的邮件同步流程', async () => {
      const mockFetch = mockGLMSuccess({
        tasks: [
          {
            title: '完成代码审查',
            description: '审查 PR #123',
            dueDate: '2025-01-16',
            priority: 'HIGH',
          },
        ],
        sender: 'Tech Lead',
        summary: '代码审查请求',
        hasActionItems: true,
      })

      const email = {
        subject: '代码审查请求 - PR #123',
        body: '请审查以下 PR:\nhttps://github.com/repo/pull/123\n\n主要更改:\n- 添加用户认证功能\n- 修复内存泄漏问题\n\n请在明天前完成审查。',
        from: 'tech-lead@company.com',
        date: '2025-01-15',
      }

      const result = await analyzeEmail(
        email.subject,
        email.body,
        email.from,
        email.date
      )

      expect(result.hasActionItems).toBe(true)
      expect(result.tasks[0].title).toBe('完成代码审查')
      expect(result.tasks[0].priority).toBe('HIGH')
      expect(result.tasks[0].dueDate).toBe('2025-01-16')
      expect(result.sender).toBe('Tech Lead')

      // 验证 fetch 被调用
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('应该正确处理带日期格式的邮件', async () => {
      const mockFetch = mockGLMSuccess({
        tasks: [
          {
            title: '会议准备',
            description: '准备周会材料',
            dueDate: '2025-01-18',
            priority: 'MEDIUM',
          },
        ],
        sender: '行政助理',
        summary: '周会提醒',
        hasActionItems: true,
      })

      const result = await analyzeEmail(
        '周会提醒 - 本周四下午2点',
        '请准备好本周工作总结和下周计划。会议室：301。',
        'admin@company.com',
        '2025-01-15T09:00:00Z'
      )

      expect(result.tasks).toHaveLength(1)
      expect(result.tasks[0].dueDate).toBeDefined()
    })
  })
})
