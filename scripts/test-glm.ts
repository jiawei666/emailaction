/**
 * 测试 GLM API
 */

import 'dotenv/config'

const GLM_BASE_URL = process.env.GLM_API_URL || 'https://open.bigmodel.cn/api/paas/v4'
const GLM_API_KEY = process.env.GLM_API_KEY

console.log('GLM Base URL:', GLM_BASE_URL)
console.log('GLM API Key exists:', !!GLM_API_KEY)
console.log('GLM API Key (first 20 chars):', GLM_API_KEY?.substring(0, 20))

const getChatCompletionsUrl = () => {
  if (GLM_BASE_URL.includes('aicoding-proxy')) {
    return `${GLM_BASE_URL}/v1/chat/completions`
  }
  return `${GLM_BASE_URL}/chat/completions`
}

const model = GLM_BASE_URL.includes('aicoding-proxy') ? 'glm-4' : 'glm-4'

console.log('API URL:', getChatCompletionsUrl())
console.log('Model:', model)

async function testGLM() {
  const apiUrl = getChatCompletionsUrl()

  console.log('\nSending request...')

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GLM_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: '你是一个测试助手' },
        { role: 'user', content: '说"你好"' },
      ],
      temperature: 0.3,
      max_tokens: 100,
    }),
  })

  console.log('Response status:', response.status)

  const data = await response.json()
  console.log('Response:', JSON.stringify(data, null, 2))
}

testGLM().catch(console.error)
