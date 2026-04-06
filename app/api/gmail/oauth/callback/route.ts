import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * Gmail OAuth 回调处理
 */
export async function GET(req: NextRequest) {
  console.log('=== Gmail OAuth Callback Start ===')
  console.log('Full URL:', req.url)

  try {
    const code = req.nextUrl.searchParams.get('code')
    const stateParam = req.nextUrl.searchParams.get('state')
    const error = req.nextUrl.searchParams.get('error')

    console.log('Code:', code ? 'present' : 'missing')
    console.log('State:', stateParam ? 'present' : 'missing')
    console.log('Error:', error)

    if (error) {
      console.error('Gmail OAuth error:', error)
      return NextResponse.redirect(new URL('/dashboard/accounts?error=oauth_failed', req.url))
    }

    if (!code || !stateParam) {
      console.error('Missing code or state')
      return NextResponse.redirect(new URL('/dashboard/accounts?error=invalid_request', req.url))
    }

    // 解析 state
    let state
    try {
      state = JSON.parse(stateParam)
      console.log('Parsed state:', { userId: state.userId, callbackUrl: state.callbackUrl })
    } catch (e) {
      console.error('Failed to parse state:', stateParam)
      return NextResponse.redirect(new URL('/dashboard/accounts?error=invalid_state', req.url))
    }

    const { userId, callbackUrl } = state

    if (!userId) {
      console.error('No userId in state')
      return NextResponse.redirect(new URL('/auth/signin', req.url))
    }

    // 交换授权码获取 access token
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const redirectUri = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/gmail/oauth/callback`

    console.log('Exchanging code for token...')
    console.log('Redirect URI:', redirectUri)

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId!,
        client_secret: clientSecret!,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('Token exchange failed:', errorData)
      return NextResponse.redirect(new URL('/dashboard/accounts?error=token_exchange_failed', req.url))
    }

    const tokens = await tokenResponse.json()
    console.log('Token exchange successful, has refresh_token:', !!tokens.refresh_token)

    // 获取用户邮箱信息
    console.log('Fetching user info...')
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    })

    if (!userInfoResponse.ok) {
      const errorText = await userInfoResponse.text()
      console.error('Failed to fetch user info:', errorText)
      return NextResponse.redirect(new URL('/dashboard/accounts?error=user_info_failed', req.url))
    }

    const userInfo = await userInfoResponse.json()
    console.log('User info:', { email: userInfo.email, name: userInfo.name })

    // 保存或更新 Gmail 账户
    console.log('Saving Gmail account to database...')
    const savedAccount = await prisma.gmailAccount.upsert({
      where: {
        userId_email: {
          userId,
          email: userInfo.email,
        },
      },
      create: {
        userId,
        email: userInfo.email,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || '',
        tokenExpiry: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
        syncStatus: 'PENDING',
      },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || undefined,
        tokenExpiry: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
        syncStatus: 'PENDING',
      },
    })
    console.log('Gmail account saved:', savedAccount.id)

    // 重定向回账户页面
    return NextResponse.redirect(new URL(callbackUrl || '/dashboard/accounts?success=gmail_connected', req.url))
  } catch (error) {
    console.error('Gmail OAuth callback error:', error)
    return NextResponse.redirect(new URL('/dashboard/accounts?error=unknown', req.url))
  }
}
