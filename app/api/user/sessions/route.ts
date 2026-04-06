import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth.config'
import { prisma } from '@/lib/db'

// GET /api/user/sessions - 获取用户登录历史
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sessions = await prisma.session.findMany({
      where: { userId: session.user.id },
      orderBy: { expires: 'desc' },
      take: 10,
    })

    // 返回简化的会话信息
    const history = sessions.map((s) => ({
      id: s.id,
      expires: s.expires,
    }))

    return NextResponse.json(history)
  } catch (error) {
    console.error('Failed to fetch login history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch login history' },
      { status: 500 }
    )
  }
}
