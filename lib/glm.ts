/**
 * 智谱 GLM-4 API 客户端
 * 用于分析邮件内容并提取待办事项
 */

export interface ExtractedTask {
  title: string
  description: string
  dueDate?: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
}

export interface EmailAnalysis {
  tasks: ExtractedTask[]
  sender: string
  summary: string
  hasActionItems: boolean
}

interface GLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface GLMResponse {
  id: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// CRS 代理使用 OpenAI 兼容格式，需要添加 /v1/chat/completions 路径
const GLM_BASE_URL = process.env.GLM_API_URL || 'https://open.bigmodel.cn/api/paas/v4'
const GLM_API_KEY = process.env.GLM_API_KEY

// 根据是否使用代理决定完整 URL
const getChatCompletionsUrl = () => {
  if (GLM_BASE_URL.includes('open.bigmodel.cn')) {
    // 智谱官方 API
    return `${GLM_BASE_URL}/chat/completions`
  }
  // OpenAI 兼容代理（/v2 或 /v1 已经在 base URL 中）
  return `${GLM_BASE_URL}/chat/completions`
}

const SYSTEM_PROMPT = `你是一个专业的邮件分析助手。你的任务是从邮件内容中提取待办事项和行动项。

请分析邮件内容，提取以下信息：
1. 待办事项（tasks）：识别邮件中所有需要采取行动的任务
2. 发件人意图（sender）：简短描述发件人的身份或角色
3. 邮件摘要（summary）：用1-2句话总结邮件的主要内容
4. 是否包含行动项（hasActionItems）：判断邮件是否包含需要处理的事项

对于每个待办事项，请提供：
- title: 任务标题（简洁明了）
- description: 任务详细描述
- dueDate: 截止日期（如果邮件中提到，格式为 YYYY-MM-DD）
- priority: 优先级（HIGH/MEDIUM/LOW）
  - HIGH: 紧急、今天需要完成、有明确截止日期在近期
  - MEDIUM: 重要但不紧急、本周内需要完成
  - LOW: 可以稍后处理、没有明确时间要求

请以 JSON 格式返回结果，格式如下：
{
  "tasks": [
    {
      "title": "任务标题",
      "description": "任务描述",
      "dueDate": "2024-01-15",
      "priority": "HIGH"
    }
  ],
  "sender": "发件人描述",
  "summary": "邮件摘要",
  "hasActionItems": true
}

如果没有识别到待办事项，tasks 数组为空，hasActionItems 为 false。
只返回 JSON，不要包含其他解释文字。`

/**
 * 调用 GLM-4 API
 */
async function callGLMAPI(messages: GLMMessage[]): Promise<string> {
  if (!GLM_API_KEY) {
    console.error('[GLM] GLM_API_KEY is not configured')
    throw new Error('GLM_API_KEY is not configured')
  }

  const apiUrl = getChatCompletionsUrl()
  // CRS 代理使用 glm-4 模型
  const model = GLM_BASE_URL.includes('aicoding-proxy') ? 'glm-4' : 'glm-4'

  console.log('[GLM] Calling API:', apiUrl, 'model:', model)

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GLM_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.3,
        max_tokens: 2000,
      }),
    })

    console.log('[GLM] Response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[GLM] API error:', response.status, errorText)
      throw new Error(`GLM API error: ${response.status} - ${errorText}`)
    }

    const data: GLMResponse = await response.json()
    console.log('[GLM] Response data:', JSON.stringify(data).substring(0, 200))

    if (!data.choices || data.choices.length === 0) {
      console.error('[GLM] No choices in response')
      throw new Error('No response from GLM API')
    }

    const content = data.choices[0].message.content
    console.log('[GLM] Content length:', content.length)
    return content
  } catch (error) {
    console.error('[GLM] API call failed:', error)
    throw error
  }
}

/**
 * 解析 GLM 返回的 JSON
 */
function parseAnalysisResult(content: string): EmailAnalysis {
  let parsed: any

  // 清理内容 - 移除 markdown 代码块标记
  let cleanContent = content.trim()
  if (cleanContent.startsWith('```json')) {
    cleanContent = cleanContent.slice(7)
  } else if (cleanContent.startsWith('```')) {
    cleanContent = cleanContent.slice(3)
  }
  if (cleanContent.endsWith('```')) {
    cleanContent = cleanContent.slice(0, -3)
  }
  cleanContent = cleanContent.trim()

  // 调试日志
  console.log('[GLM] Parsing content:', cleanContent.substring(0, 200))

  try {
    // 尝试直接解析
    parsed = JSON.parse(cleanContent)
    console.log('[GLM] Parsed successfully, keys:', Object.keys(parsed))
  } catch (e) {
    // 尝试提取 JSON 块
    const jsonMatch = cleanContent.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        // 尝试修复常见的 JSON 错误
        let jsonStr = jsonMatch[0]
        // 移除尾部逗号
        jsonStr = jsonStr.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']')
        parsed = JSON.parse(jsonStr)
        console.log('[GLM] Parsed from JSON match, keys:', Object.keys(parsed))
      } catch (e2) {
        console.error('[GLM] Failed to parse JSON even after cleanup:', e2)
        // 返回默认的空结果
        return {
          tasks: [],
          sender: '',
          summary: '无法解析邮件内容',
          hasActionItems: false,
        }
      }
    } else {
      // 没有 JSON 块，返回默认结果
      console.error('[GLM] No JSON block found in content')
      return {
        tasks: [],
        sender: '',
        summary: content.substring(0, 200),
        hasActionItems: false,
      }
    }
  }

  // 处理不同的返回格式
  const result: EmailAnalysis = {
    tasks: [],
    sender: parsed.sender || '',
    summary: typeof parsed.summary === 'string' ? parsed.summary : (parsed.note || ''),
    hasActionItems: false,
  }

  // 检查是否有待办事项 - 多种格式检测
  console.log('[GLM] Checking for tasks, parsed.tasks:', parsed.tasks, 'isArray:', Array.isArray(parsed.tasks), 'length:', parsed.tasks?.length)
  console.log('[GLM] parsed.todo_items:', parsed.todo_items)

  // 格式1: 检查 tasks 数组（最常见格式）
  if (parsed.tasks && Array.isArray(parsed.tasks) && parsed.tasks.length > 0) {
    console.log('[GLM] Format 1: tasks array found with', parsed.tasks.length, 'items')
    result.hasActionItems = true
    result.tasks = parsed.tasks.map((task: any) => {
      // 处理不同的优先级格式
      let priority: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM'
      if (task.priority) {
        const p = String(task.priority).toLowerCase()
        if (p.includes('high') || p.includes('紧急') || p.includes('urgent')) {
          priority = 'HIGH'
        } else if (p.includes('low') || p.includes('待跟进') || p.includes('later')) {
          priority = 'LOW'
        } else {
          priority = 'MEDIUM'
        }
      }

      return {
        title: task.title || task.name || 'Untitled Task',
        description: task.description || task.details || '',
        dueDate: task.dueDate || task.deadline,
        priority,
      }
    })
  }
  // 格式2: todo_items 数组（GLM 常见返回格式）
  else if (parsed.todo_items && Array.isArray(parsed.todo_items) && parsed.todo_items.length > 0) {
    console.log('[GLM] Format 2: todo_items array found with', parsed.todo_items.length, 'items')
    result.hasActionItems = true
    result.sender = parsed.sender || ''
    result.tasks = parsed.todo_items.map((item: any) => ({
      title: item.task || item.description || item.title || 'Untitled Task',
      description: item.details || item.description || '',
      dueDate: item.deadline || item.dueDate,
      priority: normalizePriority(item.priority),
    }))
    if (parsed.total_tasks) {
      result.summary = `共 ${parsed.total_tasks} 个待办事项`
    }
  }
  // 格式3: hasActionItems 为 true 或 false
  else if (parsed.hasActionItems !== undefined) {
    result.hasActionItems = parsed.hasActionItems
    if (parsed.tasks && Array.isArray(parsed.tasks)) {
      result.tasks = parsed.tasks.map((task: any) => ({
        title: task.title || 'Untitled',
        description: task.description || '',
        dueDate: task.dueDate,
        priority: normalizePriority(task.priority),
      }))
    }
  }
  // 格式3: requires_action
  else if (parsed.requires_action !== undefined) {
    result.hasActionItems = parsed.requires_action
  }
  // 格式4: 检查嵌套的 email_analysis 格式（GLM 常见返回格式）
  else if (parsed.email_analysis?.tasks) {
    const tasksObj = parsed.email_analysis.tasks
    const allTasks: any[] = []

    // 合并 urgent_tasks 和 important_tasks
    if (Array.isArray(tasksObj.urgent_tasks)) {
      allTasks.push(...tasksObj.urgent_tasks.map((t: any) => ({ ...t, priority: 'HIGH' })))
    }
    if (Array.isArray(tasksObj.important_tasks)) {
      allTasks.push(...tasksObj.important_tasks.map((t: any) => ({ ...t, priority: 'MEDIUM' })))
    }
    if (Array.isArray(tasksObj.normal_tasks)) {
      allTasks.push(...tasksObj.normal_tasks.map((t: any) => ({ ...t, priority: 'LOW' })))
    }

    if (allTasks.length > 0) {
      result.hasActionItems = true
      result.tasks = allTasks.map((task: any) => ({
        title: task.title || task.description || 'Untitled Task',
        description: task.description || task.details || '',
        dueDate: task.deadline || task.dueDate,
        priority: normalizePriority(task.priority),
      }))
      result.sender = parsed.email_analysis.sender || ''
      if (parsed.email_analysis.summary?.total_tasks) {
        result.summary = `共 ${parsed.email_analysis.summary.total_tasks} 个任务`
      }
    }
  }
  // 格式5: 检查 summary 对象中的任务信息
  else if (typeof parsed.summary === 'object' && parsed.summary !== null) {
    const summaryObj = parsed.summary
    if (summaryObj.total_tasks > 0 || (summaryObj.immediate_action_required && summaryObj.immediate_action_required.length > 0)) {
      result.hasActionItems = true
      if (summaryObj.immediate_action_required && Array.isArray(summaryObj.immediate_action_required)) {
        result.tasks = summaryObj.immediate_action_required.map((task: string) => ({
          title: typeof task === 'string' ? task : 'Task',
          description: '',
          priority: 'HIGH' as const,
        }))
      }
      result.summary = `共 ${summaryObj.total_tasks} 个任务`
    }
  }

  // 如果提取到任务但没有摘要，生成一个
  if (result.tasks.length > 0 && !result.summary) {
    result.summary = `发现 ${result.tasks.length} 个待办事项`
  }

  return result
}

/**
 * 标准化优先级
 */
function normalizePriority(priority: any): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (typeof priority === 'string') {
    const upper = priority.toUpperCase()
    if (['HIGH', 'MEDIUM', 'LOW'].includes(upper)) {
      return upper as 'HIGH' | 'MEDIUM' | 'LOW'
    }
    // 处理中文优先级
    if (upper.includes('HIGH') || upper.includes('紧急') || upper.includes('URGENT')) {
      return 'HIGH'
    }
    if (upper.includes('LOW') || upper.includes('待跟进')) {
      return 'LOW'
    }
  }
  return 'MEDIUM'
}

/**
 * 分析邮件内容
 * @param subject 邮件主题
 * @param body 邮件正文
 * @param from 发件人
 * @param date 邮件日期
 */
export async function analyzeEmail(
  subject: string,
  body: string,
  from: string,
  date?: string
): Promise<EmailAnalysis> {
  const userMessage = `请分析以下邮件：

主题: ${subject}
发件人: ${from}
${date ? `日期: ${date}` : ''}

邮件内容:
${body}

请提取其中的待办事项并返回 JSON 格式的分析结果。`

  const messages: GLMMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userMessage },
  ]

  const response = await callGLMAPI(messages)
  return parseAnalysisResult(response)
}

/**
 * 批量分析邮件
 */
export async function analyzeEmails(
  emails: Array<{
    id: string
    subject: string
    body: string
    from: string
    date?: string
  }>
): Promise<Map<string, EmailAnalysis>> {
  const results = new Map<string, EmailAnalysis>()

  // 串行处理以避免 API 限流
  for (const email of emails) {
    try {
      const analysis = await analyzeEmail(email.subject, email.body, email.from, email.date)
      results.set(email.id, analysis)
    } catch (error) {
      console.error(`Failed to analyze email ${email.id}:`, error)
      // 返回空分析结果而不是跳过
      results.set(email.id, {
        tasks: [],
        sender: email.from,
        summary: '分析失败',
        hasActionItems: false,
      })
    }
  }

  return results
}

/**
 * 快速判断邮件是否包含待办事项（轻量级调用）
 */
export async function quickCheckActionItems(
  subject: string,
  snippet: string
): Promise<boolean> {
  const quickPrompt = `判断以下邮件摘要是否包含需要采取行动的待办事项。

主题: ${subject}
摘要: ${snippet}

只回答 true 或 false。`

  const messages: GLMMessage[] = [
    {
      role: 'system',
      content: '你是一个邮件分类助手。判断邮件是否包含需要行动的待办事项。只回答 true 或 false。',
    },
    { role: 'user', content: quickPrompt },
  ]

  try {
    const response = await callGLMAPI(messages)
    return response.toLowerCase().trim() === 'true'
  } catch {
    return false
  }
}
