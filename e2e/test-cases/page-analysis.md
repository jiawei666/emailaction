# E2E 页面分析报告

生成时间: 2026-04-04
服务器: http://localhost:3003

## 目录
- [登录页分析](#登录页分析)
- [首页分析](#首页分析)
- [历史页分析](#历史页分析)
- [账户页分析](#账户页分析)

---

## 登录页分析

**页面路径**: `/api/auth/signin` 或 `/auth/signin`

### 页面结构

```
页面标题: EmailAction - 邮件待办自动同步
```

### 交互元素

| 序号 | 元素类型 | 文本/标识 | 属性 | 操作 |
|------|----------|-----------|------|------|
| 1 | 按钮 | "使用 Google 继续" | Google OAuth 登录 | 点击后跳转 Google 授权 |
| 2 | 按钮 | "使用 GitHub 继续" | GitHub OAuth 登录 | 点击后跳转 GitHub 授权 |
| 3 | 链接 | "← 返回首页" | href="/" | 导航到首页 |

### 截图保存
- `e2e/screenshots/auth/signin-page.png` - 完整页面��图
- `e2e/screenshots/auth/signin-page.html` - 页面 HTML 源码

### 测试建议
1. 测试 Google OAuth 登录流程
2. 测试 GitHub OAuth 登录流程
3. 测试返回首页链接
4. 测试登录后的重定向行为

---

## 首页分析

**页面路径**: `/`

### 页面结构

```
页面标题: EmailAction - 邮件待办自动同步
导航元素: 存在
```

### 交互元素

| 序号 | 元素类型 | 文本 | href/操作 |
|------|----------|------|-----------|
| 1 | 链接 | "登录" | /api/auth/signin |
| 2 | 链接 | "免费开始" | /api/auth/signin |
| 3 | 链接 | "开始使用" | /api/auth/signin |
| 4 | 链接 | "了解工作原理" | #how-it-works (锚点) |
| 5 | 链接 | "立即开始" | /api/auth/signin |

### 截图保存
- `e2e/screenshots/home/home-page.png` - 完整页面截图
- `e2e/screenshots/home/home-page.html` - 页面 HTML 源码

### 测试建议
1. 测试所有 CTA 按钮跳转到登录页
2. 测试锚点导航平滑滚动
3. 测试响应式布局（移动端/桌面端）

---

## 历史页分析 (源代码分析)

**页面路径**: `/dashboard/history` (需要登录)

### 页面结构 (基于源码)

```tsx
// 主要状态
- items: SyncItem[]         // 同步记录列表
- filter: 筛选状态          // 'all' | 'SUCCESS' | 'FAILED' | 'CANCELLED'
- loading: 加载状态

// 筛选选项
const filterOptions = [
  { value: 'all', label: '全部' },
  { value: 'SUCCESS', label: '已同步' },
  { value: 'FAILED', label: '失败' },
  { value: 'CANCELLED', label: '已忽略' },
]

// 状态标签
const statusLabels = {
  SUCCESS: { label: '已同步', color: 'bg-[#4A7C59]/10 text-[#4A7C59]' },
  FAILED: { label: '失败', color: 'bg-[#B85450]/10 text-[#B85450]' },
  CANCELLED: { label: '已忽略', color: 'bg-[#B1ADA1]/10 text-[#9E9C98]' },
  PENDING: { label: '待确认', color: 'bg-[#D4A574]/10 text-[#D4A574]' },
  PROCESSING: { label: '处理中', color: 'bg-[#C15F3C]/10 text-[#C15F3C]' },
}

// 平台标签
const platformLabels = {
  FEISHU: { name: '飞书', color: 'bg-[#4A7C59]/10 text-[#4A7C59]' },
  NOTION: { name: 'Notion', color: 'bg-[#C15F3C]/10 text-[#C15F3C]' },
  TODOIST: { name: 'Todoist', color: 'bg-[#D4A574]/10 text-[#D4A574]' },
}
```

### 交互元素列表

#### 1. 筛选按钮组
| 元素 | 选择器 | 文本 | 状态变化 |
|------|--------|------|----------|
| 全部筛选 | `button:has-text("全部")` | "全部" | 筛选所有记录 |
| 已同步筛选 | `button:has-text("已同步")` | "已同步" | 只显示成功记录 |
| 失败筛选 | `button:has-text("失败")` | "失败" | 只显示失败记录 |
| 已忽略筛选 | `button:has-text("已忽略")` | "已忽略" | 只显示已忽略记录 |

**激活状态样式**: `bg-[#C15F3C] text-white`
**非激活状态样式**: `bg-[#F4F3EE] text-[#6B6966] hover:bg-[#E8E6E1]`

#### 2. 历史记录项
每个记录包含:
- 状态图标: `CheckCircle2` (成功) / `XCircle` (失败)
- 平台标签: 飞书/Notion/Todoist
- 状态标签: 已同步/失败/已忽略/待确认/处理中
- 标题: `item.title`
- 描述: `item.description` (可选)
- 来源邮箱: `item.gmailAccount.email`
- 时间戳: `item.syncedAt` 或相对时间
- 外部链接按钮: 当 `item.taskId` 存在时

#### 3. 空状态
```
组件: HistoryIcon
标题: "暂无历史记录"
描述: "开始同步任务后，记录将显示在这里"
```

### API 依赖
- `GET /api/tasks?limit=100` - 获取同步历史记录

### 测试用例

#### 基础功能测试
1. **页面加载测试**
   - 验证页面标题显示 "同步历史"
   - 验证副标题显示
   - 验证筛选栏可见
   - 验证记录计数正确

2. **筛选功能测试**
   - 点击"全部" - 应显示所有记录
   - 点击"已同步" - 只显示 SUCCESS 状态记录
   - 点击"失败" - 只显示 FAILED 状态记录
   - 点击"已忽略" - 只显示 CANCELLED 状态记录
   - 验证记录计数随筛选更新

3. **空状态测试**
   - 无数据时显示空状态组件
   - 空状态图标、标题、描述正确显示

4. **记录显示测试**
   - 验证日期分组（今天/昨天/更早）
   - 验证状态图标正确（成功/失败）
   - 验证平台标签颜色和文本
   - 验证状态标签颜色和文本
   - 验证标题、描述、邮箱、时间显示

5. **交互测试**
   - 记录项 hover 效果
   - 外部链接按钮点击（有 taskId 时）
   - 筛选按钮激活状态样式

#### 数据测试
1. **API 测试**
   - `/api/tasks` 返回正确格式
   - 错误处理（API 失败时）
   - 加载状态显示

2. **边界条件**
   - 大量数据时的性能
   - 特殊字符处理
   - 长文本截断

---

## 账户页分析 (源代码分析)

**页面路径**: `/dashboard/accounts` (需要登录)

### 页面结构 (基于源码)

```tsx
// 主要状态
- gmailAccounts: GmailAccount[]  // Gmail 账户列表
- taskAccounts: TaskAccount[]    // 任务平台账户列表
- loading: 加载状态

// 平台配置
const platformConfig = {
  FEISHU: { name: '飞书', color: 'bg-[#4A7C59]/10 text-[#4A7C59]', icon: '飞' },
  NOTION: { name: 'Notion', color: 'bg-[#C15F3C]/10 text-[#C15F3C]', icon: 'N' },
  TODOIST: { name: 'Todoist', color: 'bg-[#D4A574]/10 text-[#D4A574]', icon: 'T' },
}
```

### 交互元素列表

#### 1. Gmail 区域
| 元素 | 选择器 | 文本/标识 | 功能 |
|------|--------|-----------|------|
| 区域标题 | `h2:has-text("Gmail 账户")` | "Gmail 账户" | - |
| 区域描述 | `p:has-text("连接您的 Gmail")` | "连接您的 Gmail 以扫描待办邮件" | - |
| 添加按钮 | `button:has-text("添加账户")` | Mail 图标 + "添加账户" | 触发 Google OAuth |
| 账户项 | `.space-y-3 > div` | 邮箱地址 | 显示已连接账户 |
| 删除按钮 | `button:has(Trash2)` | Trash2 图标 | 删除账户（需确认） |

**空状态**:
```
图标: Mail (w-12 h-12, text-[#B1ADA1])
文本: "还没有连接 Gmail 账户"
```

#### 2. 任务平台区域
| 元素 | 选择器 | 平台 | 功能 |
|------|--------|------|------|
| 飞书卡片 | `button:has-text("飞书")` | 飞书 | 调用 `/api/feishu/oauth` |
| Notion 卡片 | `button:has-text("Notion")` | Notion | 显示 "开发中..." 提示 |
| Todoist 卡片 | `button:has-text("Todoist")` | Todoist | 显示 "开发中..." 提示 |

**平台卡片样式**:
- 默认: `border border-[#E8E6E1]`
- Hover: `hover:border-[#C15F3C]`
- 图标: 圆角方块 + 平台首字母
- 描述: "点击连接 {平台} 账户"

#### 3. 已连接任务账户
| 元素 | 样式 | 内容 |
|------|------|------|
| 账户卡片 | `bg-[#F4F3EE] rounded-lg` | 平台图标 + 名称 + 邮箱/工作区 |
| 状态标签 | `bg-[#4A7C59]/10` (活跃) | "活跃" / "未激活" |
| 删除按钮 | `text-[#B85450]` | Trash2 图标 |

### API 依赖
- `GET /api/gmail/accounts` - 获取 Gmail 账户列表
- `GET /api/task-accounts` - 获取任务平台账户列表
- `DELETE /api/gmail/accounts?id={id}` - 删除 Gmail 账户
- `DELETE /api/task-accounts?id={id}` - 删除任务账户
- `GET /api/feishu/oauth` - 获取飞书授权 URL

### 测试用例

#### 基础功能测试
1. **页面加载测试**
   - 验证页面标题 "账户管理"
   - 验证 Gmail 区域可见
   - 验证任务平台区域可见
   - 验证所有平台卡片显示

2. **Gmail 账户测试**
   - 空状态显示（无账户时）
   - 添加账户按钮可点击
   - 账户列表正确显示
   - 删除账户确认对话框
   - 删除后列表更新

3. **任务平台测试**
   - 飞书卡片可见且可点击
   - Notion 卡片可见（点击显示开发中）
   - Todoist 卡片可见（点击显示开发中）
   - Hover 效果正确

4. **已连接账户测试**
   - 账户信息正确显示
   - 活跃/未激活状态正确
   - 删除功能工作正常

#### 集成测试
1. **OAuth 流程测试**
   - 点击添加 Gmail 账户触发 Google OAuth
   - OAuth 回调后账户添加成功

2. **飞书集成测试**
   - 点击飞书卡片获取授权 URL
   - 正确重定向到飞书授权页

#### 错误处理测试
1. **API 失败测试**
   - Gmail API 失败时的处理
   - 任务账户 API 失败时的处理

2. **删除确认测试**
   - 取消删除不执行操作
   - 确认删除执行操作

---

## 测试发现的问题

### 1. 认证问题
- **问题**: Dashboard 页面需要登录，无法直接使用无头模式测试
- **解决方案**: 使用 Playwright 的 `storageState` 保存登录会话

### 2. 待完善功能
- Notion 和 Todoist 连接功能显示"开发中"
- 需要补充这两个平台的完整集成测试

### 3. 测试数据准备
- 需要准备测试账户数据
- 需要准备各种状态的同步记录

---

## 下一步计划

1. 完成手动登录并保存认证状态
2. 使用已保存的状态运行完整的页面探索
3. 生成详细的测试用例文档
4. 创建自动化测试脚本
