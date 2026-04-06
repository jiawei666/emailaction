/**
 * Notion 任务平台集成
 */

export class NotionClient {
  private accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  /**
   * 获取数据库结构
   */
  async getDatabaseSchema(databaseId: string): Promise<{ properties: Record<string, any> }> {
    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
        'Notion-Version': '2022-06-28',
      },
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(`Failed to get database: ${JSON.stringify(data)}`)
    }

    return response.json()
  }

  /**
   * 确保数据库有所需的属性
   */
  async ensureDatabaseProperties(databaseId: string): Promise<void> {
    const db = await this.getDatabaseSchema(databaseId)
    const existingProps = Object.keys(db.properties || {})

    const requiredProps: Record<string, any> = {}

    // 检查 Name 属性（标题类型）
    if (!existingProps.includes('Name') && !existingProps.some(p => p.toLowerCase() === 'name')) {
      requiredProps['Name'] = { title: {} }
    }

    // 检查 Priority 属性（选择类型）
    if (!existingProps.includes('Priority') && !existingProps.some(p => p.toLowerCase() === 'priority')) {
      requiredProps['Priority'] = {
        select: {
          options: [
            { name: 'High', color: 'red' },
            { name: 'Medium', color: 'yellow' },
            { name: 'Low', color: 'gray' },
          ],
        },
      }
    }

    // 检查 Description 属性
    if (!existingProps.includes('Description') && !existingProps.some(p => p.toLowerCase() === 'description')) {
      requiredProps['Description'] = { rich_text: {} }
    }

    // 检查 Due Date 属性
    if (!existingProps.includes('Due Date') && !existingProps.some(p => p.toLowerCase().includes('due') || p.toLowerCase().includes('date'))) {
      requiredProps['Due Date'] = { date: {} }
    }

    // 如果有缺失的属性，更新数据库
    if (Object.keys(requiredProps).length > 0) {
      console.log('[Notion] Adding missing properties:', Object.keys(requiredProps))

      const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.accessToken}`,
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({
          properties: requiredProps,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        console.error('[Notion] Failed to add properties:', data)
        throw new Error(`Failed to add database properties: ${JSON.stringify(data)}`)
      }

      console.log('[Notion] Successfully added missing properties')
    }
  }

  /**
   * 创建任务（数据库条目）
   */
  async createTask(params: {
    databaseId: string
    title: string
    description?: string
    dueDate?: Date
    priority?: number
  }): Promise<{ taskId: string }> {
    const properties: Record<string, unknown> = {
      Name: {
        title: [
          {
            text: {
              content: params.title,
            },
          },
        ],
      },
    }

    if (params.description) {
      properties.Description = {
        rich_text: [
          {
            text: {
              content: params.description,
            },
          },
        ],
      }
    }

    if (params.dueDate) {
      properties['Due Date'] = {
        date: {
          start: params.dueDate.toISOString(),
        },
      }
    }

    if (params.priority) {
      properties.Priority = {
        select: {
          name: this.mapPriority(params.priority),
        },
      }
    }

    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        parent: {
          database_id: params.databaseId,
        },
        properties,
      }),
    })

    const data = (await response.json()) as { id: string }

    if (!response.ok) {
      throw new Error(`Failed to create Notion task: ${JSON.stringify(data)}`)
    }

    return { taskId: data.id }
  }

  /**
   * 更新任务
   */
  async updateTask(pageId: string, params: {
    title?: string
    description?: string
    dueDate?: Date
    completed?: boolean
  }): Promise<void> {
    const properties: Record<string, unknown> = {}

    if (params.title) {
      properties.Name = {
        title: [
          {
            text: {
              content: params.title,
            },
          },
        ],
      }
    }

    if (params.dueDate) {
      properties['Due Date'] = {
        date: {
          start: params.dueDate.toISOString(),
        },
      }
    }

    if (params.completed !== undefined) {
      properties.Status = {
        status: {
          name: params.completed ? 'Done' : 'Not Started',
        },
      }
    }

    const response = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({ properties }),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(`Failed to update Notion task: ${JSON.stringify(data)}`)
    }
  }

  /**
   * 搜索数据库
   */
  async searchDatabase(query: string): Promise<any[]> {
    const response = await fetch('https://api.notion.com/v1/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        query,
        filter: {
          value: 'database',
          property: 'object',
        },
      }),
    })

    const data = (await response.json()) as { results: any[] }

    if (!response.ok) {
      throw new Error(`Failed to search Notion: ${JSON.stringify(data)}`)
    }

    return data.results
  }

  /**
   * 映射优先级
   */
  private mapPriority(priority: number): string {
    if (priority >= 4) return 'High'
    if (priority >= 3) return 'Medium'
    return 'Low'
  }
}
