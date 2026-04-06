# EmailAction 测试文档

## 测试策略概述

EmailAction 采用分层测试策略，覆盖从单元测试到集成测试的完整测试金字塔。

### 测试金字塔

```
        E2E (未来扩展)
       /            \
      /              \
     /    集成测试     \   ← API 路由、数据库集成
    /                  \
   /                    \
  /      单元测试         \   ← 工具函数、服务层
 /________________________\
```

## 测试框架

- **Vitest** - 测试运行器
- **Testing Library** - 组件测试（未来扩展）
- **MSW** - API mock（未来扩展 E2E）
- **Happy DOM** - JSDOM 轻量级替代

## 测试覆盖范围

### 1. 单元测试 (`test/lib/`)

#### 工具函数测试 (`test/lib/utils.test.ts`)
- ✅ `cn()` - 类名合并
- ✅ `formatDate()` - 日期格式化
- ✅ `getRelativeTime()` - 相对时间计算
- ✅ `truncate()` - 文本截断
- ✅ `safeJsonParse()` - JSON 解析
- ✅ `delay()` - 延迟执行
- ✅ `retry()` - 重试逻辑
- ✅ `extractTaskFromEmail()` - 任务提取
- ✅ `isValidEmail()` - 邮箱验证
- ✅ `generateRandomString()` - 随机字符串生成

#### 任务平台服务测试

**Todoist** (`test/lib/task-platforms/todoist.test.ts`)
- ✅ 创建任务（基本/描述/日期/优先级/项目）
- ✅ 更新任务
- ✅ 删除任务
- ✅ 获取任务列表
- ✅ 关闭/重新打开任务
- ✅ 错误处理

**Notion** (`test/lib/task-platforms/notion.test.ts`)
- ✅ 创建任务
- ✅ 更新任务
- ✅ 搜索数据库
- ✅ 优先级映射
- ✅ 错误处理

**飞书** (`test/lib/task-platforms/feishu.test.ts`)
- ✅ 访问令牌获取和缓存
- ✅ 创建任务
- ✅ 更新任务
- ✅ 删除任务
- ✅ 获取任务列表
- ✅ 令牌过期处理
- ✅ 错误处理

### 2. 集成测试 (`test/api/`)

#### 任务 API 测试 (`test/api/tasks.test.ts`)
- ✅ `GET /api/tasks` - 获取任务列表、状态过滤、限制数量、统计
- ✅ `POST /api/tasks` - 创建同步项目、参数验证
- ✅ `GET /api/tasks/:id` - 获取任务详情
- ✅ `PATCH /api/tasks/:id` - 更新任务
- ✅ `DELETE /api/tasks/:id` - 删除任务
- ✅ `POST /api/tasks/:id/sync` - 执行同步
- ✅ `POST /api/tasks/:id/retry` - 重试失败任务
- ✅ 权限验证

#### Gmail API 测试 (`test/api/gmail.test.ts`)
- ✅ `GET /api/gmail/accounts` - 获取账户列表
- ✅ `DELETE /api/gmail/accounts` - 删除账户
- ✅ `POST /api/gmail/sync` - 触发同步
- ✅ `GET /api/gmail/sync` - 获取同步状态
- ✅ 跨用户隔离验证
- ✅ 参数验证

### 3. 数据库测试 (`test/lib/db.test.ts`)

#### 模型测试
- ✅ User 模型 - CRUD、唯一约束、关联
- ✅ GmailAccount 模型 - CRUD、级联删除、唯一约束
- ✅ TaskAccount 模型 - 平台类型、元数据存储
- ✅ SyncItem 模型 - 所有状态、关联、日期处理
- ✅ Notification 模型 - 类型支持、已读状态

#### 复杂查询测试
- ✅ 按状态过滤
- ✅ 统计聚合
- ✅ 多层关联查询

## 运行测试

```bash
# 安装依赖
npm install

# 运行所有测试
npm test

# 运行一次（不监听）
npm run test:run

# 生成覆盖率报告
npm run test:coverage

# 启动 UI 浏览器
npm run test:ui

# 运行特定测试文件
npx vitest test/lib/utils.test.ts

# 运行匹配模式的测试
npx vitest test/api/
```

## 测试配置

### `vitest.config.ts`
- 使用 Happy DOM 作为测试环境
- 覆盖率目标：80%
- 路径别名配置：`@` → 项目根目录

### `vitest.setup.ts`
- 扩展 expect 断言
- Mock NextAuth
- Mock Next.js navigation
- 设置测试环境变量

## 测试工具

### `test/setup.ts`
测试数据库工具函数：
- `cleanupDatabase()` - 清理测试数据库
- `createTestUser()` - 创建测试用户
- `createTestGmailAccount()` - 创建测试 Gmail 账户
- `createTestTaskAccount()` - 创建测试任务账户
- `createTestSyncItem()` - 创建测试同步项目

## 覆盖率目标

| 类型 | 目标 | 当前 |
|------|------|------|
| 语句覆盖 | 80% | - |
| 分支覆盖 | 80% | - |
| 函数覆盖 | 80% | - |
| 行覆盖 | 80% | - |

## 测试最佳实践

### 1. 测试命名
```typescript
describe('功能模块', () => {
  describe('具体函数/方法', () => {
    it('应该做什么事情', () => {})
    it('应该处理边界情况', () => {})
  })
})
```

### 2. AAA 模式
```typescript
it('应该计算相对时间', () => {
  // Arrange - 准备
  const date = new Date('2025-01-15T10:00:00Z')
  vi.setSystemTime(new Date('2025-01-15T11:00:00Z'))

  // Act - 执行
  const result = getRelativeTime(date)

  // Assert - 断言
  expect(result).toBe('1小时前')
})
```

### 3. Mock 外部依赖
```typescript
// Mock API 调用
global.fetch = vi.fn()
mockFetch.mockResolvedValue({ ok: true, json: async () => ({ data }) })

// Mock 模块
vi.mock('@/lib/session', () => ({
  requireAuth: vi.fn(async () => ({ id: 'test-user-id' })),
}))
```

### 4. 清理副作用
```typescript
beforeEach(async () => {
  await cleanupDatabase()
})

afterEach(async () => {
  await cleanupDatabase()
  vi.restoreAllMocks()
})
```

## CI/CD 集合

```yaml
# .github/workflows/test.yml 示例
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
```

## 未来扩展

### 组件测试
- React Testing Library
- 用户交互测试
- 表单验证测试

### E2E 测试
- Playwright
- 完整用户流程测试
- 跨浏览器测试

### 性能测试
- API 响应时间
- 数据库查询优化
