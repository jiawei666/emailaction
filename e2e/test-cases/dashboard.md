# Dashboard 概览页 E2E 测试用例

> 生成时间: 2026-04-04
> 页面URL: http://localhost:3003/dashboard
> 组件: app/dashboard/page.tsx + components/dashboard-stats.tsx + components/recent-tasks.tsx

## 测试前准备

1. 确保开发服务器运行: `npm run dev`
2. 确保已登录（需要有有效的 session）
3. 准备测试数据: 统计数据、最近同步记录
4. 打开 Chrome DevTools MCP 连接

---

## 测试用例

### TC-001: 页面加载测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard"
take_snapshot
list_console_messages types=["error"]
```

**预期结果:**
- 页面正常加载
- 控制台无 error 级别日志
- 页面标题显示 "概览"
- 用户问候语显示 "早上好，{用户名}"

---

### TC-002: 统计卡片显示测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard"
take_snapshot
```

**预期结果:**
显示 3 个统计卡片:

**待处理邮件卡片:**
- 链接到 /dashboard/pending
- Clock 图标 (橙色 bg-[#C15F3C]/10)
- 显示待处理数量
- 文字 "待处理邮件"
- 右上角 ArrowRight 图标
- 悬停时边框变为 hover:border-[#B1ADA1]

**已同步卡片:**
- CheckCircle2 图标 (绿色 bg-[#4A7C59]/10)
- 显示今日同步数量
- 文字 "已同步"

**累计任务卡片:**
- ListTodo 图标 (棕色 bg-[#D4A574]/10)
- 显示总任务数
- 文字 "累计任务"

---

### TC-003: 统计卡片点击测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard"
take_snapshot → 获取待处理卡片 uid
click uid="<待处理卡片uid>"
wait_for text=["待确认"]
```

**预期结果:**
- 点击 "待处理邮件" 卡片
- 导航到 /dashboard/pending
- URL 变为 http://localhost:3003/dashboard/pending

---

### TC-004: 统计卡片悬停效果测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard"
take_snapshot
hover uid="<待处理卡片uid>"
take_screenshot filePath="e2e/screenshots/dashboard/card_hover.png"
```

**预期结果:**
- 卡片边框颜色变为 border-[#B1ADA1]
- ArrowRight 图标变为橙色 text-[#C15F3C]
- 过渡效果平滑 (transition-all duration-200)

---

### TC-005: 快捷操作按钮显示测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard"
take_snapshot
```

**预期结果:**
显示 2 个快捷操作按钮:

**处理待办邮件按钮:**
- Clock 图标
- 文字 "处理待办邮件"
- 样式: bg-[#C15F3C] hover:bg-[#A64D2E] text-white
- 链接到 /dashboard/pending

**同步新邮件按钮:**
- Mail 图标 (或 RefreshCw 同步时)
- 文字 "同步新邮件" (同步中显示 "同步中...")
- 样式: bg-white border border-[#E8E6E1] hover:border-[#B1ADA1]
- 同步中图标旋转 animate-spin

---

### TC-006: 处理待办邮件按钮测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard"
take_snapshot → 获取按钮 uid
click uid="<处理待办邮件按钮uid>"
wait_for text=["待确认"]
```

**预期结果:**
- 导航到 /dashboard/pending
- URL 变为 http://localhost:3003/dashboard/pending

---

### TC-007: 同步新邮件按钮测试（无账户）

**前置条件:** 没有连接 Gmail 账户

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard"
take_snapshot
click uid="<同步新邮件按钮uid>"
wait_for text=["请先连接 Gmail 账户"]
```

**预期结果:**
- 显示 alert "请先连接 Gmail 账户"
- 不触发同步操作

---

### TC-008: 同步新邮件按钮测试（有账户）

**前置条件:** 已连接 Gmail 账户

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard"
take_snapshot
click uid="<同步新邮件按钮uid>"
wait_for text=["同步中..."]
take_snapshot
```

**预期结果:**
- 按钮状态变为 disabled
- 图标变为 RefreshCw 并旋转
- 文字变为 "同步中..."
- 发送 POST 请求到 /api/gmail/sync
- 成功后页面刷新

---

### TC-009: 同步失败测试

**步骤:**
```
// 模拟 API 失败
navigate_page type="url" url="http://localhost:3003/dashboard"
take_snapshot
click uid="<同步新邮件按钮uid>"
wait_for text=["同步失败"]
list_console_messages types=["error"]
```

**预期结果:**
- 显示 alert "同步失败: {错误信息}"
- 按钮恢复正常状态
- 控制台记录错误 "Sync error:"

---

### TC-010: 最近同步区域显示测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard"
take_snapshot
```

**预期结果:**
- 显示 "最近同步" 区域
- 显示待确认任务列表 (来自 RecentTasks 组件)
- 每个任务显示:
  - "待确认" 标签
  - 平台标签 (如果有)
  - 任务标题
  - 任务描述 (截断)
  - 来源邮箱和相对时间
  - 同步和删除按钮

---

### TC-011: 最近同步空状态测试

**前置条件:** 没有待确认任务

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard"
take_snapshot
```

**预期结果:**
- 显示空状态组件
- CheckCircle 图标 (绿色 w-16 h-16)
- 标题 "太棒了！"
- 提示 "当前没有待处理的任务"

---

### TC-012: 最近同步操作测试

**前置条件:** 有待确认任务

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard"
take_snapshot → 获取同步按钮 uid
click uid="<同步按钮uid>"
wait_for text=["太棒了"]
```

**预期结果:**
- 点击同步按钮
- 任务从列表中移除
- 发送 POST 请求到 /api/tasks/{id}/sync
- 如果是最后一个任务，显示空状态

---

### TC-013: 最近同步删除测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard"
take_snapshot → 获取删除按钮 uid
click uid="<删除按钮uid>"
wait_for text=["确定要删除"]
send_keys key="Enter"
```

**预期结果:**
- 显示确认对话框
- 确认后任务从列表中移除
- 发送 DELETE 请求到 /api/tasks/{id}

---

### TC-014: 统计数据加载状态测试

**步骤:**
```
// 使用网络节流模拟慢速加载
navigate_page type="url" url="http://localhost:3003/dashboard"
take_screenshot filePath="e2e/screenshots/dashboard/stats_loading.png"
```

**预期结果:**
- 显示 3 个骨架屏卡片
- 样式: bg-white border border-[#E8E6E1] rounded-xl p-6 animate-pulse
- 网格布局 grid grid-cols-1 md:grid-cols-3

---

### TC-015: 无 Gmail 账户提示测试

**前置条件:** 没有连接 Gmail 账户

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard"
take_snapshot
```

**预期结果:**
- 问候语显示 "早上好，{用户名}。 请先连接您的 Gmail 账户。"
- 同步按钮可能被禁用

---

### TC-016: 用户名显示测试

**前置条件:** 已登录用户

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard"
take_snapshot
```

**预期结果:**
- 问候语显示 session.user.name
- 如果没有 name，显示 "用户"

---

## 响应式测试

### TC-020: 移动端布局测试 (375x667)

**步骤:**
```
emulate viewport="375x667"
navigate_page type="url" url="http://localhost:3003/dashboard"
take_screenshot filePath="e2e/screenshots/dashboard/mobile_layout.png"
take_snapshot
```

**预期结果:**
- 统计卡片单列显示 (grid-cols-1)
- 快捷操作按钮可能换行
- 最近同步列表正常显示
- 所有功能可用

---

### TC-021: 平板布局测试 (768x1024)

**步骤:**
```
emulate viewport="768x1024"
navigate_page type="url" url="http://localhost:3003/dashboard"
take_screenshot filePath="e2e/screenshots/dashboard/tablet_layout.png"
take_snapshot
```

**预期结果:**
- 统计卡片显示为 3 列 (md:grid-cols-3)
- 布局适应屏幕

---

### TC-022: 桌面布局测试 (1920x1080)

**步骤:**
```
emulate viewport="1920x1080"
navigate_page type="url" url="http://localhost:3003/dashboard"
take_screenshot filePath="e2e/screenshots/dashboard/desktop_layout.png"
take_snapshot
```

**预期结果:**
- 内容居中 (max-w-5xl mx-auto)
- 统计卡片 3 列布局
- 布局美观

---

## 性能测试

### TC-030: 页面加载性能

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard"
lighthouse_audit mode="navigation"
```

**预期结果:**
- FCP < 1.8s
- LCP < 2.5s
- TTI < 3.8s

---

### TC-031: 统计 API 性能

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard"
list_network_requests
```

**预期结果:**
- GET /api/tasks?limit=1 请求快速响应
- GET /api/gmail/accounts 请求快速响应
- 总 API 响应时间 < 500ms

---

## 错误处理测试

### TC-040: 统计 API 失败测试

**步骤:**
```
// 模拟 API 失败
navigate_page type="url" url="http://localhost:3003/dashboard"
list_console_messages types=["error"]
```

**预期结果:**
- 如果 /api/tasks 失败:
  - 控制台记录错误 "Failed to fetch stats:"
  - 统计显示为 0 或保持上一次状态

---

### TC-041: 账户 API 失败测试

**步骤:**
```
// 模拟 API 失败
navigate_page type="url" url="http://localhost:3003/dashboard"
list_console_messages types=["error"]
```

**预期结果:**
- 如果 /api/gmail/accounts 失败:
  - 控制台记录错误 "Failed to fetch accounts:"
  - 同步按钮可能被禁用

---

## 可访问性测试

### TC-050: 键盘导航测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard"
send_keys key="Tab"  // 聚焦到待处理卡片
send_keys key="Enter"  // 激活链接
send_keys key="Tab"  // 聚焦到同步按钮
send_keys key="Enter"  // 激活
```

**预期结果:**
- 所有交互元素可通过 Tab 键访问
- 焦点指示器清晰可见
- Enter 键可激活按钮和链接

---

### TC-051: 屏幕阅读器测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard"
take_snapshot
```

**预期结果:**
- 统计数字有明确标签
- 按钮有明确的 aria-label 或文本内容
- 链接目的明确

---

## 集成测试

### TC-060: 从登录后导航

**前置条件:** 完成登录

**步骤:**
```
// 模拟登录后重定向
navigate_page type="url" url="http://localhost:3003/dashboard"
wait_for text=["概览"]
take_snapshot
```

**预期结果:**
- 页面正常加载
- 显示用户名

---

### TC-061: 未登录访问测试

**前置条件:** 清除所有 session

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard"
take_snapshot
```

**预期结果:**
- 重定向到登录页或首页
- 显示登录提示

---

### TC-062: 侧边栏导航测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard"
take_snapshot → 获取侧边栏导航 uid
click uid="<概览链接uid>"
wait_for text=["概览"]
```

**预期结果:**
- 点击侧边栏 "概览" 链接
- 当前在 Dashboard 页面
- 可能高亮当前页链接

---

## 边界条件测试

### TC-070: 零统计测试

**前置条件:** 没有任何任务数据

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard"
take_snapshot
```

**预期结果:**
- 统计卡片显示 0
- 页面正常显示
- 无崩溃或错误

---

### TC-071: 大数值统计测试

**前置条件:** 统计数字很大 (如 999+)

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard"
take_snapshot
```

**预期结果:**
- 大数字正常显示
- 布局不破坏
- 可能需要换行或截断

---

### TC-072: 快速连续点击同步测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard"
take_snapshot
click uid="<同步按钮uid>"
// 立即再次点击
click uid="<同步按钮uid>"
```

**预期结果:**
- 第二次点击被忽略
- 按钮在同步中保持 disabled 状态
- 没有重复请求

---

## 测试用例汇总

| ID | 用例名称 | 优先级 | 类型 |
|----|---------|--------|------|
| TC-001 | 页面加载 | P0 | 基础 |
| TC-002 | 统计卡片显示 | P1 | UI |
| TC-003 | 统计卡片点击 | P1 | 交互 |
| TC-004 | 卡片悬停效果 | P2 | UI |
| TC-005 | 快捷操作显示 | P1 | UI |
| TC-006 | 处理待办邮件 | P1 | 功能 |
| TC-007 | 同步(无账户) | P1 | 功能 |
| TC-008 | 同步(有账户) | P1 | 功能 |
| TC-009 | 同步失败 | P1 | 错误处理 |
| TC-010 | 最近同步显示 | P1 | UI |
| TC-011 | 最近同步空状态 | P1 | UI |
| TC-012 | 最近同步操作 | P1 | 功能 |
| TC-013 | 最近同步删除 | P1 | 功能 |
| TC-014 | 统计加载状态 | P1 | UI |
| TC-015 | 无账户提示 | P2 | UI |
| TC-016 | 用户名显示 | P2 | UI |
| TC-020 | 移动端布局 | P2 | 响应式 |
| TC-021 | 平板布局 | P2 | 响应式 |
| TC-022 | 桌面布局 | P2 | 响应式 |
| TC-030 | 加载性能 | P2 | 性能 |
| TC-031 | API 性能 | P2 | 性能 |
| TC-040 | 统计 API 失败 | P1 | 错误处理 |
| TC-041 | 账户 API 失败 | P1 | 错误处理 |
| TC-050 | 键盘导航 | P1 | 可访问性 |
| TC-051 | 屏幕阅读器 | P2 | 可访问性 |
| TC-060 | 登录后导航 | P1 | 集成 |
| TC-061 | 未登录访问 | P0 | 认证 |
| TC-062 | 侧边栏导航 | P1 | 集成 |
| TC-070 | 零统计 | P2 | 边界 |
| TC-071 | 大数值统计 | P2 | 边界 |
| TC-072 | 快速连续同步 | P2 | 边界 |

**总计: 33 个测试用例**

---

## 附加说明

### API 端点依赖

- `GET /api/tasks?limit=1` - 获取统计数据
- `GET /api/gmail/accounts` - 获取 Gmail 账户列表
- `POST /api/gmail/sync` - 触发邮件同步
- `GET /api/tasks?status=PENDING&limit=50` - 获取待确认任务
- `POST /api/tasks/{id}/sync` - 同步单个任务
- `DELETE /api/tasks/{id}` - 删除任务

### 相关文件

- 页面组件: `app/dashboard/page.tsx`
- 统计组件: `components/dashboard-stats.tsx`
- 最近任务组件: `components/recent-tasks.tsx`
- Page Object: `e2e/pages/dashboard.page.ts`
- 测试文件: `e2e/tests/dashboard.spec.ts`

### 测试数据准备建议

1. **统计数据测试:**
   - 准备不同数量的 PENDING、SUCCESS 任务
   - 测试零值和非零值

2. **最近同步测试:**
   - 准备待确认任务
   - 准备不同平台的任务

3. **同步测试:**
   - 准备有效的 Gmail 账户
   - Mock /api/gmail/sync 响应
