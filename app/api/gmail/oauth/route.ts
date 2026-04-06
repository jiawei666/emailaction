import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth.config'

/**
 * Gmail OAuth 授权端点
 */
export async function GET(req: NextRequest) {
  console.log('=== Gmail OAuth API called ===')
  
  try {
    const session = await auth()
    console.log('Session:', JSON.stringify({
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      email: session?.user?.email
    }))
    
    if (!session?.user?.id) {
      console.error('Unauthorized: No session or user.id')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    console.log('Env check:', {
      hasClientId: !!clientId,
      clientIdLength: clientId?.length,
      hasClientSecret: !!clientSecret,
      clientSecretLength: clientSecret?.length,
      allEnvKeys: Object.keys(process.env).filter(k => k.includes('GOOGLE') || k.includes('AUTH'))
    })

    if (!clientId) {
      console.error('Google OAuth not configured - GOOGLE_CLIENT_ID is missing')
      return NextResponse.json({ error: 'Google OAuth not configured' }, { status: 500 })
    }

    const redirectUri = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/gmail/oauth/callback`

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('access_type', 'offline')
    authUrl.searchParams.set('prompt', 'consent')
    authUrl.searchParams.set('state', JSON.stringify({
      userId: session.user.id,
      callbackUrl: '/dashboard/accounts',
      random: crypto.randomUUID()
    }))

    // Gmail API scopes
    authUrl.searchParams.set('scope', [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ].join(' '))

    console.log('Generated auth URL, redirect_uri:', redirectUri)
    
    return NextResponse.json({
      authUrl: authUrl.toString(),
    })
  } catch (error: any) {
    console.error('Gmail OAuth error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
