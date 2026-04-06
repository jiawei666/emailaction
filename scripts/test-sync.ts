/**
 * 测试同步 API
 */

import { PrismaClient } from '@prisma/client'
import { searchEmails } from '../lib/gmail'
import { analyzeEmail } from '../lib/glm'

const prisma = new PrismaClient()

async function testSync() {
  const userId = 'cmnkggz3q00029fs0jbyyno0v'
  const gmailAccountId = 'cmnlelijc00019ft4prdjhu47'
  const taskAccountId = 'cmnlft3wc00019fhltdjtn4ll'

  console.log('=== ��试同步 API ===')
  console.log('User ID:', userId)
  console.log('Gmail Account ID:', gmailAccountId)
  console.log('Task Account ID:', taskAccountId)

  // 1. 检查 Gmail 账户
  const account = await prisma.gmailAccount.findUnique({
    where: { id: gmailAccountId },
  })

  if (!account) {
    console.log('❌ Gmail 账户不存在')
    return
  }

  console.log('✅ Gmail 账户找到:', account.email)

  // 2. 检查任务账户
  const taskAccount = await prisma.taskAccount.findUnique({
    where: { id: taskAccountId },
  })

  if (!taskAccount) {
    console.log('❌ 任务账户不存在')
    return
  }

  console.log('✅ 任务账户找到:', taskAccount.platform)

  // 3. 搜索邮件 - 使用更广泛的查询
  console.log('\n3. 搜索邮件...')
  const searchQuery = 'after:' + Math.floor(Date.now() / 1000 - 7 * 86400)
  console.log('搜索条件:', searchQuery)

  const { emails } = await searchEmails(userId, gmailAccountId, searchQuery, { maxResults: 20 })
  console.log('✅ 找到邮件:', emails.length)

  if (emails.length === 0) {
    console.log('没有邮件，测试结束')
    return
  }

  // 4. 分析所有邮件并找到有待办事项的
  console.log('\n4. 分析邮件...')
  let syncCount = 0

  for (let i = 0; i < Math.min(emails.length, 10); i++) {
    const email = emails[i]
    console.log(`\n--- 邮件 ${i + 1}/${Math.min(emails.length, 10)} ---`)
    console.log('主题:', email.subject)
    console.log('发件人:', email.from)

    try {
      const analysis = await analyzeEmail(
        email.subject,
        email.body || email.snippet || '',
        email.from
      )

      console.log('有行动项:', analysis.hasActionItems)
      console.log('任务数量:', analysis.tasks.length)
      console.log('摘要:', analysis.summary?.substring(0, 100) + '...')

      if (analysis.hasActionItems && analysis.tasks.length > 0) {
        console.log('\n✅ 找到待办事项!')
        for (const task of analysis.tasks) {
          console.log(`  - [${task.priority}] ${task.title}`)
        }

        // 检查是否已经同步过
        const existing = await prisma.syncItem.findFirst({
          where: { gmailMessageId: email.id, userId }
        })

        if (existing) {
          console.log('  ⚠️ 该邮件已经同步过，跳过创建')
          continue
        }

        const priorityMap: Record<string, number> = {
          'HIGH': 4,
          'MEDIUM': 3,
          'LOW': 2,
        }

        for (const task of analysis.tasks) {
          const syncItem = await prisma.syncItem.create({
            data: {
              userId,
              gmailAccountId,
              taskAccountId,
              gmailMessageId: email.id,
              title: task.title,
              description: task.description,
              dueDate: task.dueDate ? new Date(task.dueDate) : null,
              priority: priorityMap[task.priority] || 3,
              labels: JSON.stringify([]),
              status: 'PENDING',
            },
          })
          console.log('  ✅ 创建同步项:', syncItem.id)
          syncCount++
        }
      }
    } catch (error) {
      console.error('  ❌ 分析邮件失败:', error)
    }

    // 短暂延迟以避免 API 限流
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  console.log('\n=== 同步测试完成 ===')
  console.log('总共创建同步项:', syncCount)
}

testSync()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
