/**
 * 飞书任务平台集成
 */

interface FeishuTask {
  task_id: string
  title: string
  description: string
  due_date: number
  completed: boolean
  priority: string
}

interface FeishuAccessToken {
  access_token: string
  expire: number
}

export class FeishuClient {
  private appId: string
  private appSecret: string
  private accessToken: string | null = null
  private tokenExpiry: number = 0

  constructor() {
    this.appId = process.env.FEISHU_APP_ID || ''
    this.appSecret = process.env.FEISHU_APP_SECRET || ''
  }

  /**
   * 获取访问令牌
   */
  async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    const response = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_id: this.appId,
        app_secret: this.appSecret,
      }),
    })

    const data = (await response.json()) as { code: number; tenant_access_token: string; expire: number }

    if (data.code !== 0) {
      throw new Error('Failed to get Feishu access token')
    }

    this.accessToken = data.tenant_access_token
    this.tokenExpiry = Date.now() + data.expire * 1000

    return this.accessToken
  }

  /**
   * 创建任务
   */
  async createTask(params: {
    userId: string
    title: string
    description?: string
    dueDate?: Date
    priority?: number
  }): Promise<{ taskId: string }> {
    const token = await this.getAccessToken()

    // 飞书 API 创建任务
    const response = await fetch('https://open.feishu.cn/open-apis/task/v1/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        user_id: params.userId,
        title: params.title,
        description: params.description || '',
        due_date: params.dueDate ? Math.floor(params.dueDate.getTime() / 1000) : undefined,
        priority: this.mapPriority(params.priority),
      }),
    })

    const data = (await response.json()) as { code: number; data: { task: { task_id: string } } }

    if (data.code !== 0) {
      throw new Error(`Failed to create Feishu task: ${data.code}`)
    }

    return { taskId: data.data.task.task_id }
  }

  /**
   * 更新任务
   */
  async updateTask(taskId: string, params: {
    title?: string
    description?: string
    dueDate?: Date
    completed?: boolean
  }): Promise<void> {
    const token = await this.getAccessToken()

    const response = await fetch(`https://open.feishu.cn/open-apis/task/v1/tasks/${taskId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: params.title,
        summary: params.description,
        due_date: params.dueDate ? Math.floor(params.dueDate.getTime() / 1000) : undefined,
        completed: params.completed,
      }),
    })

    const data = (await response.json()) as { code: number }

    if (data.code !== 0) {
      throw new Error(`Failed to update Feishu task: ${data.code}`)
    }
  }

  /**
   * 删除任务
   */
  async deleteTask(taskId: string): Promise<void> {
    const token = await this.getAccessToken()

    const response = await fetch(`https://open.feishu.cn/open-apis/task/v1/tasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = (await response.json()) as { code: number }

    if (data.code !== 0) {
      throw new Error(`Failed to delete Feishu task: ${data.code}`)
    }
  }

  /**
   * 获取任务列表
   */
  async getTasks(userId: string): Promise<FeishuTask[]> {
    const token = await this.getAccessToken()

    const response = await fetch(`https://open.feishu.cn/open-apis/task/v1/tasks?user_id=${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = (await response.json()) as { code: number; data: { items: FeishuTask[] } }

    if (data.code !== 0) {
      throw new Error(`Failed to get Feishu tasks: ${data.code}`)
    }

    return data.data.items || []
  }

  /**
   * 映射优先级
   */
  private mapPriority(priority?: number): string {
    if (!priority) return 'normal'
    if (priority >= 4) return 'high'
    if (priority >= 3) return 'medium'
    return 'low'
  }
}
