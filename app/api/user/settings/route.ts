import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/session'
import { prisma } from '@/lib/db'

// GET /api/user/settings - 获取用户设置
export async function GET() {
  try {
    const user = await requireAuth()

    let settings = await prisma.userSettings.findUnique({
      where: { userId: user.id },
    })

    // 如果用户没有设置，创建默认设置
    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          userId: user.id,
          emailNotifications: true,
          autoSync: false,
          syncFrequency: 'THIRTY_MINUTES',
        },
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Failed to fetch user settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

// PUT /api/user/settings - 更新用户设置
export async function PUT(req: NextRequest) {
  try {
    const user = await requireAuth()

    const body = await req.json()
    const { emailNotifications, autoSync, syncFrequency } = body

    // 验证 syncFrequency 的值
    const validFrequencies = ['FIFTEEN_MINUTES', 'THIRTY_MINUTES', 'HOURLY', 'MANUAL']
    if (syncFrequency && !validFrequencies.includes(syncFrequency)) {
      return NextResponse.json(
        { error: 'Invalid syncFrequency value' },
        { status: 400 }
      )
    }

    const settings = await prisma.userSettings.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        emailNotifications: emailNotifications ?? true,
        autoSync: autoSync ?? false,
        syncFrequency: syncFrequency ?? 'THIRTY_MINUTES',
      },
      update: {
        ...(emailNotifications !== undefined && { emailNotifications }),
        ...(autoSync !== undefined && { autoSync }),
        ...(syncFrequency && { syncFrequency }),
      },
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Failed to update user settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
