/**
 * 直接测试同步 API
 */

import 'dotenv/config'

const API_BASE = 'http://localhost:3000'

async function testSyncAPI() {
  console.log('=== 测试同步 API ===\n')

  // 首先获取现有的同步项
  console.log('1. 检查现有同步项...')
  const syncItemsRes = await fetch(`${API_BASE}/api/gmail/sync?accountId=cmnlelijc00019ft4prdjhu47`, {
    headers: {
      'Cookie': 'e2e-test-mode=true',
    },
  })

  console.log('状态:', syncItemsRes.status)
  const syncData = await syncItemsRes.json()
  console.log('现有同步项数量:', syncData.data?.syncItems?.length || 0)

  // 触发同步
  console.log('\n2. 触发同步...')
  const syncRes = await fetch(`${API_BASE}/api/gmail/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': 'e2e-test-mode=true',
    },
    body: JSON.stringify({
      accountId: 'cmnlelijc00019ft4prdjhu47',
      taskAccountId: 'cmnlft3wc00019fhltdjtn4ll',
      query: 'is:unread',
      days: 7,
    }),
  })

  console.log('状态:', syncRes.status)
  const result = await syncRes.json()
  console.log('结果:', JSON.stringify(result, null, 2))

  if (result.success) {
    console.log('\n✅ 同步成功!')
    console.log('同步数量:', result.data?.synced)
  } else {
    console.log('\n❌ 同步失败')
    console.log('错误:', result.error)
  }
}

testSyncAPI().catch(console.error)
