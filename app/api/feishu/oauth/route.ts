import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth.config'
import { prisma } from '@/lib/db'
import { logger, UnauthorizedError } from '@/lib/errors'
import { apiSuccess, apiError } from '@/lib/api-response'

/**
 * 生成飞书 OAuth 授权 URL 并直接重定向
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      // 未登录则重定向到登录页
      const loginUrl = new URL('/auth/signin', req.url)
      loginUrl.searchParams.set('callbackUrl', '/onboarding')
      return NextResponse.redirect(loginUrl)
    }

    const { searchParams } = new URL(req.url)
    const redirectUri = searchParams.get('redirect_uri') || process.env.FEISHU_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/feishu/callback`
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard/accounts'

    // 飞书 OAuth 授权端点
    const appId = process.env.FEISHU_APP_ID
    if (!appId) {
      return apiError('Feishu app not configured', { code: 'FEISHU_NOT_CONFIGURED' })
    }

    // 生成 state 参数用于防 CSRF，同时包含 callbackUrl
    const state = Buffer.from(JSON.stringify({
      userId: session.user.id,
      timestamp: Date.now(),
      callbackUrl,
    })).toString('base64')

    // 构建授权 URL
    const authUrl = new URL('https://open.feishu.cn/open-apis/authen/v1/authorize')
    authUrl.searchParams.set('app_id', appId)
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('scope', 'email:readonly contact:readonly')
    authUrl.searchParams.set('state', state)

    logger.info('Feishu OAuth redirect', { userId: session.user.id })

    // 直接重定向到飞书授权页面
    return NextResponse.redirect(authUrl.toString())
  } catch (error) {
    logger.error('Failed to generate Feishu OAuth URL', error as Error)
    return apiError('Failed to generate OAuth URL', { status: 500 })
  }
}
