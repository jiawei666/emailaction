import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/session'
import { prisma } from '@/lib/db'

// GET /api/user/account - 获取用户账户信息
export async function GET() {
  try {
    const user = await requireAuth()

    const userAccount = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!userAccount) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(userAccount)
  } catch (error) {
    console.error('Failed to fetch user account:', error)
    return NextResponse.json(
      { error: 'Failed to fetch account' },
      { status: 500 }
    )
  }
}

// DELETE /api/user/account - 删除用户账户
export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth()

    // 由于我们在 schema 中设置了 onDelete: Cascade，
    // 删�� User 会自动删除所有关联数据
    await prisma.user.delete({
      where: { id: user.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete user account:', error)
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}
