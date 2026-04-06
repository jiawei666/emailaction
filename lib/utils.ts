import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 格式化日期
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * 计算相对时间
 */
export function getRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - d.getTime()

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 7) {
    return formatDate(date)
  } else if (days > 0) {
    return `${days}天前`
  } else if (hours > 0) {
    return `${hours}小时前`
  } else if (minutes > 0) {
    return `${minutes}分钟前`
  } else {
    return '刚刚'
  }
}

/**
 * 截断文本
 */
export function truncate(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * 安全地解析 JSON
 */
export function safeJsonParse<T = unknown>(text: string | null | undefined, fallback: T): T {
  if (!text) return fallback
  try {
    return JSON.parse(text) as T
  } catch {
    return fallback
  }
}

/**
 * 延迟执行
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 重试函数
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: { maxRetries?: number; delay?: number; backoff?: number } = {}
): Promise<T> {
  const { maxRetries = 3, delay: initialDelay = 1000, backoff = 2 } = options

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await delay(initialDelay * Math.pow(backoff, i))
    }
  }

  throw new Error('Max retries reached')
}

/**
 * 提取邮件中的任务信息
 */
export interface ExtractedTask {
  title: string
  description?: string
  dueDate?: Date
  priority?: number
  labels?: string[]
}

export function extractTaskFromEmail(
  subject: string,
  body: string,
  from: string
): ExtractedTask | null {
  // 简单的关键词匹配，实际应该使用 AI
  const taskKeywords = ['待办', 'todo', '任务', '请完成', '请处理', 'deadline', '截止']
  const urgencyKeywords = ['紧急', 'urgent', 'asap', '尽快', '今天']

  const hasTaskKeyword = taskKeywords.some(keyword =>
    subject.toLowerCase().includes(keyword) || body.toLowerCase().includes(keyword)
  )

  if (!hasTaskKeyword) return null

  const priority = urgencyKeywords.some(keyword =>
    subject.toLowerCase().includes(keyword) || body.toLowerCase().includes(keyword)
  )
    ? 4 // 高优先级
    : undefined

  return {
    title: subject,
    description: `${from}\n\n${body}`,
    priority,
  }
}

/**
 * 验证邮箱格式
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 生成随机字符串
 */
export function generateRandomString(length: number = 16): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
