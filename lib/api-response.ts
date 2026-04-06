/**
 * 统一的 API 响应格式
 */

import { NextResponse } from 'next/server'
import { handleApiError } from './errors'

export interface ApiSuccessResponse<T = unknown> {
  success: true
  data: T
  message?: string
}

export interface ApiErrorResponse {
  success: false
  error: string
  code?: string
  details?: unknown
}

/**
 * 成功响应
 */
export function apiSuccess<T>(
  data: T,
  options?: {
    message?: string
    status?: number
  }
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(options?.message && { message: options.message }),
    },
    { status: options?.status || 200 }
  )
}

/**
 * 错误响应
 */
export function apiError(
  error: string,
  options?: {
    code?: string
    details?: unknown
    status?: number
  }
): NextResponse<ApiErrorResponse> {
  const response: ApiErrorResponse = {
    success: false,
    error,
  }

  if (options?.code) {
    response.code = options.code
  }
  if (options?.details) {
    response.details = options.details
  }

  return NextResponse.json(response, { status: options?.status || 400 })
}

/**
 * 分页响应
 */
export interface PaginatedData<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export function apiPaginated<T>(
  data: PaginatedData<T>,
  options?: {
    message?: string
  }
): NextResponse<ApiSuccessResponse<PaginatedData<T>>> {
  return apiSuccess(data, options)
}

/**
 * 创建的响应（201）
 */
export function apiCreated<T>(
  data: T,
  message?: string
): NextResponse<ApiSuccessResponse<T>> {
  return apiSuccess(data, { message, status: 201 })
}

/**
 * 无内容响应（204）
 */
export function apiNoContent(): NextResponse {
  return new NextResponse(null, { status: 204 })
}

/**
 * 异步 API 处理包装器
 * 自动捕获错误并返回统一格式的响应
 */
export function asyncHandler<T>(
  handler: () => Promise<NextResponse<ApiSuccessResponse<T>>>
): Promise<NextResponse<ApiSuccessResponse<T> | ApiErrorResponse>> {
  return handler().catch((error) => {
    // 如果已经是 NextResponse，直接返回
    if (error instanceof NextResponse) {
      return error
    }
    // 否则使用错误处理
    const errorResponse = handleApiError(error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: errorResponse.status }
    )
  })
}

/**
 * 验证请求体
 */
export async function validateBody<T>(
  request: Request,
  schema: {
    parse: (data: unknown) => T
  }
): Promise<T> {
  try {
    const body = await request.json()
    return schema.parse(body)
  } catch (error: unknown) {
    if (error instanceof Error && 'errors' in error) {
      throw apiError('Validation failed', {
        code: 'VALIDATION_ERROR',
        details: (error as { errors: unknown }).errors,
        status: 400,
      })
    }
    throw apiError('Invalid request body', { status: 400 })
  }
}

/**
 * 验证查询参数
 */
export function validateQuery<T>(
  searchParams: URLSearchParams,
  schema: {
    parse: (data: unknown) => T
  }
): T {
  try {
    const params = Object.fromEntries(searchParams)
    return schema.parse(params)
  } catch (error: unknown) {
    if (error instanceof Error && 'errors' in error) {
      throw apiError('Invalid query parameters', {
        code: 'VALIDATION_ERROR',
        details: (error as { errors: unknown }).errors,
        status: 400,
      })
    }
    throw apiError('Invalid query parameters', { status: 400 })
  }
}
