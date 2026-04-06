/**
 * test/lib/utils.test.ts - 修复版
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  cn,
  formatDate,
  getRelativeTime,
  truncate,
  safeJsonParse,
  delay,
  retry,
  extractTaskFromEmail,
  isValidEmail,
  generateRandomString,
} from '@/lib/utils'

describe('cn', () => {
  it('应该合并类名', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('应该处理条件类名', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
  })

  it('应该处理 Tailwind 冲突', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })
})

describe('formatDate', () => {
  it('应该格式化日期对象', () => {
    const date = new Date('2025-01-15T10:30:00Z')
    const result = formatDate(date)
    expect(result).toContain('2025')
  })

  it('应该格式化日期字符串', () => {
    const result = formatDate('2025-01-15T10:30:00Z')
    expect(result).toContain('2025')
  })

  it('应该处理 null/undefined', () => {
    expect(formatDate(null)).toBe('')
    expect(formatDate(undefined)).toBe('')
  })
})

describe('getRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-15T10:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('应该返回"刚刚"表示不到1分钟', () => {
    const date = new Date('2025-01-15T09:59:30Z')
    expect(getRelativeTime(date)).toBe('刚刚')
  })

  it('应该返回分钟数', () => {
    const date = new Date('2025-01-15T09:55:00Z')
    expect(getRelativeTime(date)).toBe('5分钟前')
  })

  it('应该返回小时数', () => {
    const date = new Date('2025-01-15T07:00:00Z')
    expect(getRelativeTime(date)).toBe('3小时前')
  })

  it('应该返回天数', () => {
    const date = new Date('2025-01-13T10:00:00Z')
    expect(getRelativeTime(date)).toBe('2天前')
  })

  it('超过7天应该返回格式化日期', () => {
    const date = new Date('2025-01-01T10:00:00Z')
    const result = getRelativeTime(date)
    expect(result).toContain('2025')
  })

  it('应该处理 null/undefined', () => {
    expect(getRelativeTime(null)).toBe('')
    expect(getRelativeTime(undefined)).toBe('')
  })
})

describe('truncate', () => {
  it('短文本不应该被截断', () => {
    expect(truncate('hello', 10)).toBe('hello')
  })

  it('长文本应该被截断', () => {
    expect(truncate('hello world', 5)).toBe('hello...')
  })

  it('应该使用默认长度', () => {
    const longText = 'a'.repeat(101)
    const result = truncate(longText)
    expect(result.length).toBe(103)
  })
})

describe('safeJsonParse', () => {
  it('应该解析有效的 JSON', () => {
    expect(safeJsonParse('{"foo": "bar"}', null)).toEqual({ foo: 'bar' })
  })

  it('应该处理无效 JSON', () => {
    expect(safeJsonParse('not json', { default: true })).toEqual({ default: true })
  })

  it('应该处理 null/undefined 输入', () => {
    expect(safeJsonParse(null, 'fallback')).toBe('fallback')
    expect(safeJsonParse(undefined, 'fallback')).toBe('fallback')
  })
})

describe('delay', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('应该延迟指定时间', async () => {
    vi.useRealTimers() // 使用真实定时器测试
    const start = Date.now()
    await delay(50)
    expect(Date.now() - start).toBeGreaterThanOrEqual(50)
  })
})

describe('retry', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('第一次成功就应该返回', async () => {
    vi.useRealTimers()
    const fn = vi.fn().mockResolvedValue('success')
    const result = await retry(fn, { maxRetries: 3, delay: 10 })
    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('应该重试失败的函数', async () => {
    vi.useRealTimers()
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('success')

    const result = await retry(fn, { maxRetries: 3, delay: 10 })
    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('达到最大重试次数应该抛出错误', async () => {
    vi.useRealTimers()
    const fn = vi.fn().mockRejectedValue(new Error('fail'))

    await expect(retry(fn, { maxRetries: 2, delay: 10 })).rejects.toThrow('fail')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('应该使用指数退避', async () => {
    vi.useRealTimers()
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('success')

    const startTime = Date.now()
    await retry(fn, { maxRetries: 3, delay: 50, backoff: 2 })
    const elapsed = Date.now() - startTime

    // 50ms + 100ms = 150ms (允许一些误差)
    expect(elapsed).toBeGreaterThanOrEqual(140)
  })
})

describe('extractTaskFromEmail', () => {
  it('应该识别包含待办关键词的邮件', () => {
    const result = extractTaskFromEmail(
      '请完成报告',
      '请在周五前完成',
      'boss@example.com'
    )

    expect(result).not.toBeNull()
    expect(result?.title).toBe('请完成报告')
  })

  it('应该识别英文 todo 关键词', () => {
    const result = extractTaskFromEmail(
      'TODO: Review code',
      'Please review the PR',
      'dev@example.com'
    )

    expect(result).not.toBeNull()
    expect(result?.title).toBe('TODO: Review code')
  })

  it('应该识别紧急关键词并设置高优先级', () => {
    const result = extractTaskFromEmail(
      '紧急：请立即处理',
      '这是紧急任务',
      'boss@example.com'
    )

    expect(result?.priority).toBe(4)
  })

  it('应该识别 urgent 关键词', () => {
    const result = extractTaskFromEmail(
      'Urgent: Server is down - todo',
      'Please fix ASAP',
      'ops@example.com'
    )

    expect(result).not.toBeNull()
    expect(result?.priority).toBe(4)
  })

  it('没有关键词应该返回 null', () => {
    const result = extractTaskFromEmail(
      '普通邮件',
      '只是问候一下',
      'friend@example.com'
    )

    expect(result).toBeNull()
  })
})

describe('isValidEmail', () => {
  it('应该验证有效邮箱', () => {
    expect(isValidEmail('test@example.com')).toBe(true)
    expect(isValidEmail('user.name@example.com')).toBe(true)
    expect(isValidEmail('user+tag@example.co.uk')).toBe(true)
  })

  it('应该拒绝无效邮箱', () => {
    expect(isValidEmail('invalid')).toBe(false)
    expect(isValidEmail('invalid@')).toBe(false)
    expect(isValidEmail('@example.com')).toBe(false)
    expect(isValidEmail('')).toBe(false)
  })
})

describe('generateRandomString', () => {
  it('应该生成指定长度的字符串', () => {
    const result = generateRandomString(10)
    expect(result).toHaveLength(10)
  })

  it('应该使用默认长度 16', () => {
    const result = generateRandomString()
    expect(result).toHaveLength(16)
  })

  it('应该只包含小写字母和数字', () => {
    const result = generateRandomString(100)
    expect(result).toMatch(/^[a-z0-9]+$/)
  })

  it('每次调用应该生成不同结果', () => {
    const result1 = generateRandomString(16)
    const result2 = generateRandomString(16)
    expect(result1).not.toBe(result2)
  })
})
