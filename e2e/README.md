# E2E 测试设计方案

> EmailAction 端到端测试架构

## 一、技术选型

### 框架：Playwright

**选择理由：**
- 原生支持多浏览器（Chromium、Firefox、WebKit）
- 自动等待机制，减少 flaky 测试
- 强大的选择器引擎
- 内置截图和录像功能
- 优秀的调试体验（Trace Viewer）
- 与 TypeScript 完美集成

### 目录结构

```
apps/emailaction/e2e/
├── fixtures/              # 测试固件
│   ├── auth.ts           # 认证固件
│   ├── db.ts             # 数据库固件
│   └── mocks.ts          # API Mock 固件
├── pages/                 # Page Object Model
│   ├── login.page.ts
│   ├── dashboard.page.ts
│   ├── pending.page.ts
│   └── history.page.ts
├── tests/                 # 测试用例
│   ├── auth.spec.ts      # 认证流程测试
│   ├── dashboard.spec.ts # Dashboard 功能测试
│   ├── sync.spec.ts      # 同步流程测试
│   └── settings.spec.ts  # 设置页面测试
├── utils/                 # 工具函数
│   ├── helpers.ts
│   └── assertions.ts
├── playwright.config.ts   # Playwright 配置
└── README.md
```

## 二、测试场景

### 2.1 认证流程

| 场景 | 描述 | 预期结果 |
|------|------|----------|
| GitHub 登录 | 用户使用 GitHub OAuth 登录 | 跳转到 Dashboard |
| 登录状态保持 | 刷新页面后保持登录 | 仍然显示登录状态 |
| 登出 | 用户点击登出 | 跳转到首页 |

### 2.2 Dashboard 功能

| 场景 | 描述 | 预期结果 |
|------|------|----------|
| 查看统计 | 显示待处理、今日同步、累计任务 | 正确显示统计数据 |
| 最近同步列表 | 显示最近同步的邮件 | 列表正确渲染 |
| 快捷操作 | 点击"处理待办邮件" | 跳转到 Pending 页面 |

### 2.3 同步流程

| 场景 | 描述 | 预期结果 |
|------|------|----------|
| 查看待处理邮件 | 访问 Pending 页面 | 显示 AI 识别的待办 |
| 确认同步 | 选择任务并确认同步 | 任务同步成功 |
| 批量操作 | 批量选择并同步 | 全部同步成功 |
| 查看历史 | 访问 History 页面 | 显示同步历史记录 |

### 2.4 账号管理

| 场景 | 描述 | 预期结果 |
|------|------|----------|
| 连接 Gmail | OAuth 授权 Gmail | 账号连接成功 |
| 连接任务平台 | 连接 Todoist/Notion/飞书 | 平台连接成功 |
| 断开账号 | 断开已连接的账号 | 账号移除 |

## 三、Mock 策略

### 3.1 外部服务 Mock

```typescript
// fixtures/mocks.ts
import { test as base } from '@playwright/test'

// Mock GLM API
export const mockGLMApi = async (page) => {
  await page.route('**/open.bigmodel.cn/**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        choices: [{
          message: {
            content: JSON.stringify({
              tasks: [{ title: '测试任务', priority: 'HIGH' }],
              hasActionItems: true,
              summary: '测试摘要'
            })
          }
        }]
      })
    })
  })
}

// Mock Gmail API
export const mockGmailApi = async (page) => {
  await page.route('**/gmail/v1/**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        messages: [
          { id: 'msg1', threadId: 'thread1' }
        ]
      })
    })
  })
}

// Mock Todoist API
export const mockTodoistApi = async (page) => {
  await page.route('**/todoist.com/**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ id: 'task-123' })
    })
  })
}
```

### 3.2 认证 Mock

```typescript
// fixtures/auth.ts
import { test as base, Page } from '@playwright/test'

// 模拟已登录状态
export const loginAs = async (page: Page, userId = 'test-user') => {
  // 方案1: 通过 API 设置 cookie
  await page.context().addCookies([{
    name: 'next-auth.session-token',
    value: 'test-session-token',
    domain: 'localhost',
    path: '/'
  }])

  // 方案2: 通过 storage state 恢复
  // 需要 playwright 配置 storageState
}
```

## 四、Page Object Model

```typescript
// pages/dashboard.page.ts
import { Page, Locator } from '@playwright/test'

export class DashboardPage {
  readonly page: Page
  readonly pendingCount: Locator
  readonly todaySynced: Locator
  readonly totalTasks: Locator
  readonly recentSyncs: Locator
  readonly processPendingBtn: Locator

  constructor(page: Page) {
    this.page = page
    this.pendingCount = page.locator('[data-testid="pending-count"]')
    this.todaySynced = page.locator('[data-testid="today-synced"]')
    this.totalTasks = page.locator('[data-testid="total-tasks"]')
    this.recentSyncs = page.locator('[data-testid="recent-syncs"]')
    this.processPendingBtn = page.locator('text=处理待办邮件')
  }

  async goto() {
    await this.page.goto('/dashboard')
  }

  async getPendingCount() {
    return parseInt(await this.pendingCount.textContent() || '0')
  }

  async clickProcessPending() {
    await this.processPendingBtn.click()
  }
}
```

## 五、配置文件

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

## 六、运行命令

```json
// package.json scripts
{
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "test:e2e:debug": "playwright test --debug",
  "test:e2e:report": "playwright show-report"
}
```

## 七、CI 集成

```yaml
# .github/workflows/e2e.yml
name: E2E Tests
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

## 八、最佳实践

1. **数据隔离**：每个测试使用独立的测试数据库
2. **确定性**：避免依赖外部服务，全部 Mock
3. **可读性**：使用 Page Object Model 和语义化断言
4. **稳定性**：使用 data-testid 选择器，避免依赖文本
5. **调试友好**：失败时自动截图和录像

---

*文档更新日期：2026-04-04*
