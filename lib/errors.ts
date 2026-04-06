/**
 * 统一的错误处理和日志记录工具
 */

/**
 * API 错误类
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * 验证错误
 */
export class ValidationError extends ApiError {
  constructor(message: string, public details?: unknown) {
    super(400, message, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

/**
 * 未授权错误
 */
export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(401, message, 'UNAUTHORIZED')
    this.name = 'UnauthorizedError'
  }
}

/**
 * 未找到错误
 */
export class NotFoundError extends ApiError {
  constructor(resource: string) {
    super(404, `${resource} not found`, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

/**
 * 禁止访问错误
 */
export class ForbiddenError extends ApiError {
  constructor(message: string = 'Access forbidden') {
    super(403, message, 'FORBIDDEN')
    this.name = 'ForbiddenError'
  }
}

/**
 * 日志级别
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

/**
 * 日志条目
 */
interface LogEntry {
  level: LogLevel
  message: string
  timestamp: Date
  context?: Record<string, unknown>
  error?: Error
  userId?: string
}

/**
 * 简单的内存日志记录器（生产环境应使用专业日志服务）
 */
class Logger {
  private logs: LogEntry[] = []
  private maxLogs = 1000

  private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      error,
    }

    this.logs.push(entry)

    // 限制日志数量
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    // 在开发环境打印到控制台
    if (process.env.NODE_ENV === 'development') {
      const logFn = level === LogLevel.ERROR ? console.error : console.log
      logFn(`[${level}]`, message, context || '', error || '')
    }
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.DEBUG, message, context)
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.INFO, message, context)
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log(LogLevel.WARN, message, context)
  }

  error(message: string, error?: Error, context?: Record<string, unknown>) {
    this.log(LogLevel.ERROR, message, context, error)
  }

  /**
   * 获取所有日志
   */
  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level)
    }
    return [...this.logs]
  }

  /**
   * 清空日志
   */
  clearLogs() {
    this.logs = []
  }
}

export const logger = new Logger()

/**
 * 处理 API 错误并返回 NextResponse
 */
export function handleApiError(error: unknown): Response {
  if (error instanceof ApiError) {
    return Response.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    )
  }

  if (error instanceof Error) {
    logger.error('API Error', error)

    return Response.json(
      {
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    )
  }

  logger.error('Unknown error', new Error(String(error)))

  return Response.json(
    { error: 'An unknown error occurred', code: 'UNKNOWN_ERROR' },
    { status: 500 }
  )
}

/**
 * 异步函数包装器，自动处理错误
 */
export function withErrorHandling<T>(
  fn: () => Promise<T>,
  errorMessage: string = 'Operation failed'
): Promise<T> {
  return fn().catch((error) => {
    logger.error(errorMessage, error)
    throw new ApiError(500, errorMessage, 'OPERATION_FAILED')
  })
}

/**
 * 带用户上下文的日志记录
 */
export function logWithContext(userId: string) {
  return {
    info: (message: string, context?: Record<string, unknown>) => {
      logger.info(message, { ...context, userId })
    },
    warn: (message: string, context?: Record<string, unknown>) => {
      logger.warn(message, { ...context, userId })
    },
    error: (message: string, error?: Error, context?: Record<string, unknown>) => {
      logger.error(message, error, { ...context, userId })
    },
    debug: (message: string, context?: Record<string, unknown>) => {
      logger.debug(message, { ...context, userId })
    },
  }
}

/**
 * 性能监控装饰器
 */
export function measurePerformance<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  name: string
): T {
  return (async (...args: unknown[]) => {
    const start = Date.now()
    try {
      const result = await fn(...args)
      const duration = Date.now() - start
      logger.debug(`${name} completed`, { duration: `${duration}ms` })
      return result
    } catch (error) {
      const duration = Date.now() - start
      logger.error(`${name} failed`, error as Error, { duration: `${duration}ms` })
      throw error
    }
  }) as T
}
