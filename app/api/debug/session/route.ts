import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

export async function GET() {
  try {
    const session = await getSession()
    return NextResponse.json({
      authenticated: !!session?.user,
      userId: session?.user?.id || null,
      email: session?.user?.email || null,
      name: session?.user?.name || null,
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
