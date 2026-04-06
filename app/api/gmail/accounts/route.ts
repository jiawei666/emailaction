import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/session'
import { prisma } from '@/lib/db'

/**
 * 获取用户的所有 Gmail 账户
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()

    const accounts = await prisma.gmailAccount.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(accounts)
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: error.message || 'Failed to fetch accounts' }, { status: 500 })
  }
}

/**
 * 删除 Gmail 账户
 */
export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(req.url)
    const accountId = searchParams.get('id')

    if (!accountId) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 })
    }

    // 验证账户属于当前用户
    const account = await prisma.gmailAccount.findUnique({
      where: { id: accountId },
    })

    if (!account || account.userId !== user.id) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    await prisma.gmailAccount.delete({
      where: { id: accountId },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: error.message || 'Failed to delete account' }, { status: 500 })
  }
}
