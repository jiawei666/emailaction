import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth.config'
import { prisma } from '@/lib/db'
import { logger, UnauthorizedError, ValidationError } from '@/lib/errors'
import { apiSuccess, apiError } from '@/lib/api-response'

/**
 * 飞书 OAuth 回调处理
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      throw new UnauthorizedError()
    }

    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // 处理用户拒绝授权
    if (error) {
      logger.warn('Feishu OAuth denied by user', { error })
      return NextResponse.redirect(new URL('/dashboard/accounts?error=access_denied', req.url))
    }

    if (!code) {
      throw new ValidationError('Authorization code is required')
    }

    // 验证 state 参数（防 CSRF），并提取 callbackUrl
    let stateData: { userId: string; timestamp: number; callbackUrl?: string }
    try {
      stateData = JSON.parse(Buffer.from(state || '', 'base64').toString())
      if (stateData.userId !== session.user.id) {
        throw new ValidationError('Invalid state parameter')
      }
      // 检查 state 是否过期（5分钟）
      if (Date.now() - stateData.timestamp > 5 * 60 * 1000) {
        throw new ValidationError('State parameter expired')
      }
    } catch {
      throw new ValidationError('Invalid state parameter')
    }

    const callbackUrl = stateData.callbackUrl || '/dashboard/accounts'

    // 使用授权码获取用户访问令牌
    const appId = process.env.FEISHU_APP_ID
    const appSecret = process.env.FEISHU_APP_SECRET
    const redirectUri = process.env.FEISHU_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/feishu/callback`

    if (!appId || !appSecret) {
      return apiError('Feishu app not configured', { code: 'FEISHU_NOT_CONFIGURED' })
    }

    // 获取 tenant_access_token
    const tokenResponse = await fetch('https://open.feishu.cn/open-apis/authen/v3/tenant_access_token/internal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_id: appId,
        app_secret: appSecret,
      }),
    })

    const tokenData = (await tokenResponse.json()) as {
      code: number
      tenant_access_token: string
    }

    if (tokenData.code !== 0) {
      throw new Error('Failed to get tenant access token')
    }

    const tenantAccessToken = tokenData.tenant_access_token

    // 使用授权码获取用户信息
    const userResponse = await fetch('https://open.feishu.cn/open-apis/authen/v1/user_info', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tenantAccessToken}`,
        'Content-Type': 'application/json',
      },
    })

    const userData = (await userResponse.json()) as {
      code: number
      data?: {
        user_id: string
        name: string
        en_name: string
        avatar_url: string
        email: string
      }
    }

    if (userData.code !== 0 || !userData.data) {
      throw new Error('Failed to get user info')
    }

    const userInfo = userData.data

    // 保存或更新飞书账户信息
    const account = await prisma.taskAccount.upsert({
      where: {
        userId_platform_accountId: {
          userId: session.user.id,
          platform: 'FEISHU',
          accountId: userInfo.user_id,
        },
      },
      create: {
        userId: session.user.id,
        platform: 'FEISHU',
        accountId: userInfo.user_id,
        email: userInfo.email,
        accessToken: tenantAccessToken, // 实际应该存储用户级别的 token
        workspaceName: userInfo.name,
        isActive: true,
      },
      update: {
        accessToken: tenantAccessToken,
        email: userInfo.email,
        workspaceName: userInfo.name,
        isActive: true,
      },
    })

    logger.info('Feishu account connected', { userId: session.user.id, accountId: account.id })

    // 创建通知
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'ACCOUNT_CONNECTED',
        title: '飞书账户已连接',
        message: `飞书账户 ${userInfo.name} (${userInfo.email}) 已成功连接`,
      },
    })

    // 重定向回 callbackUrl 或默认账户管理页面
    return NextResponse.redirect(new URL(callbackUrl + '?success=feishu_connected', req.url))
  } catch (error) {
    logger.error('Feishu OAuth callback failed', error as Error)
    return NextResponse.redirect(new URL('/dashboard/accounts?error=oauth_failed', req.url))
  }
}
