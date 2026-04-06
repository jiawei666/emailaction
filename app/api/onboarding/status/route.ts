import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/session'
import { prisma } from '@/lib/db'

/**
 * 获取用户 onboarding 状态
 */
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()

    // 检查 Gmail 账户
    const gmailAccounts = await prisma.gmailAccount.findMany({
      where: { userId: user.id },
    })

    // 检查任务平台账户
    const taskAccounts = await prisma.taskAccount.findMany({
      where: { userId: user.id },
    })

    // 检查是否已同步过邮件
    const syncItems = await prisma.syncItem.findMany({
      where: { userId: user.id },
      take: 1,
    })

    const hasGmail = gmailAccounts.length > 0
    const hasTaskPlatform = taskAccounts.length > 0
    const hasSynced = syncItems.length > 0

    // 计算当前步骤
    let currentStep = 1
    if (hasGmail) currentStep = 2
    if (hasTaskPlatform) currentStep = 3
    if (hasSynced) currentStep = 4 // 完成

    const isCompleted = hasGmail && hasTaskPlatform && hasSynced

    return NextResponse.json({
      isCompleted,
      currentStep,
      steps: {
        gmail: { completed: hasGmail, count: gmailAccounts.length },
        taskPlatform: { completed: hasTaskPlatform, count: taskAccounts.length },
        firstScan: { completed: hasSynced, count: syncItems.length },
      },
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: error.message || 'Failed to fetch onboarding status' }, { status: 500 })
  }
}
