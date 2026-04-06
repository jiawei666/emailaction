/**
 * Todoist 任务平台集成
 */

interface TodoistTask {
  id: string
  content: string
  description: string
  due: { date: string } | null
  priority: number
  completed: boolean
}

export class TodoistClient {
  private accessToken: string
  private baseUrl = 'https://api.todoist.com/rest/v2'

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  /**
   * 创建任务
   */
  async createTask(params: {
    title: string
    description?: string
    dueDate?: Date
    priority?: number
    projectId?: string
  }): Promise<{ taskId: string }> {
    const body: Record<string, unknown> = {
      content: params.title,
      description: params.description || '',
      priority: params.priority || 1,
    }

    if (params.dueDate) {
      body.due_date = params.dueDate.toISOString().split('T')[0]
    }

    if (params.projectId) {
      body.project_id = params.projectId
    }

    const response = await fetch(`${this.baseUrl}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify(body),
    })

    const data = (await response.json()) as { id: string }

    if (!response.ok) {
      throw new Error(`Failed to create Todoist task: ${JSON.stringify(data)}`)
    }

    return { taskId: data.id }
  }

  /**
   * 更新任务
   */
  async updateTask(taskId: string, params: {
    title?: string
    description?: string
    dueDate?: Date
    completed?: boolean
    priority?: number
  }): Promise<void> {
    const body: Record<string, unknown> = {}

    if (params.title) body.content = params.title
    if (params.description !== undefined) body.description = params.description
    if (params.dueDate) body.due_date = params.dueDate.toISOString().split('T')[0]
    if (params.completed !== undefined) body.is_completed = params.completed
    if (params.priority) body.priority = params.priority

    const response = await fetch(`${this.baseUrl}/tasks/${taskId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(`Failed to update Todoist task: ${JSON.stringify(data)}`)
    }
  }

  /**
   * 删除任务
   */
  async deleteTask(taskId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to delete Todoist task`)
    }
  }

  /**
   * 获取任务列表
   */
  async getTasks(): Promise<TodoistTask[]> {
    const response = await fetch(`${this.baseUrl}/tasks`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    })

    const data = (await response.json()) as TodoistTask[]

    if (!response.ok) {
      throw new Error(`Failed to get Todoist tasks`)
    }

    return data
  }

  /**
   * 关闭任务（标记为完成）
   */
  async closeTask(taskId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/tasks/${taskId}/close`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to close Todoist task`)
    }
  }

  /**
   * 重新打开任务
   */
  async reopenTask(taskId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/tasks/${taskId}/reopen`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to reopen Todoist task`)
    }
  }
}
