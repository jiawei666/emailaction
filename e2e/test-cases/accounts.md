# 账户页 E2E 测试用例

> 生成时间: 2026-04-04
> 页面URL: http://localhost:3003/dashboard/accounts
> 组件: app/dashboard/accounts/page.tsx + components/account-management.tsx

## 测试前准备

1. 确保开发服���器运行: `npm run dev`
2. 确保已登录（需要有有效的 session）
3. 准备测试: 需要测试添加和删除账户的功能
4. 打开 Chrome DevTools MCP 连接

---

## 测试用例

### TC-001: 页面加载测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_snapshot
list_console_messages types=["error"]
```

**预期结果:**
- 页面正常加载
- 控制台无 error 级别日志
- 页面标题显示 "账户管理"
- 副标题显示 "管理您的 Gmail 和任务平台账户"

---

### TC-002: Gmail 账户区域显示测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_snapshot
```

**预期结果:**
- 显示 "Gmail 账户" 区域标题
- 显示说明文字 "连接您的 Gmail 以扫描待办邮件"
- 显示 "添加账户" 按钮 (Mail 图标 + "添加账户" 文字)
- 按钮样式: bg-white border border-[#E8E6E1] hover:border-[#C15F3C]

---

### TC-003: Gmail 空状态测试

**前置条件:** 没有连接 Gmail 账户

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_snapshot
```

**预期结果:**
- Gmail 区域显示空状态
- 显示 Mail 图标 (w-12 h-12 text-[#B1ADA1])
- 显示文字 "还没有连接 Gmail 账户"
- 文字居中显示 (text-center)

---

### TC-004: 添加 Gmail 账户测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_snapshot → 获取添加账户按钮 uid
click uid="<添加账户按钮uid>"
wait_for text=["Google"] 或 [url 变化]
take_snapshot
```

**预期结果:**
- 触发 Google OAuth 流程
- 跳转到 Google 授权页面 或
- 打开授权弹窗
- callbackUrl 设置为 /dashboard/accounts

---

### TC-005: Gmail 账户列表显示测试

**前置条件:** 已连接至少一个 Gmail 账户

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_snapshot
```

**预期结果:**
每个已连接账户显示:
- 圆形头像容器 (w-10 h-10 bg-white rounded-full)
- Mail 图标 (w-5 h-5 text-[#C15F3C])
- 邮箱地址 (font-medium text-[#1A1918])
- 同步状态:
  - "已同步" - 当 syncStatus=SUCCESS
  - "待同步" - 其他状态
- 最后同步时间 (如果有 lastSyncAt)
- 删除按钮 (Trash2 图标, text-[#B85450])

---

### TC-006: 删除 Gmail 账户测试

**前置条件:** 已连接 Gmail 账户

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_snapshot → 获取删除按钮 uid
click uid="<删除按钮uid>"
wait_for text=["确定要删除"]
take_snapshot
// 取消删除
click uid="<取消按钮uid>" 或 send_keys key="Escape"

// 再次点击删除并确认
click uid="<删除按钮uid>"
wait_for text=["确定要删除"]
send_keys key="Enter"
wait_for text=["还没有连接"] 或 [账户消失]
take_snapshot
```

**预期结果:**
- 点击删除按钮后显示确认对话框
- 对话框文字: "确定要删除这个 Gmail 账户吗？"
- 点击取消后账户仍存在
- 点击确认后:
  - 发送 DELETE 请求到 `/api/gmail/accounts?id={accountId}`
  - 账户从列表中移除
  - 如删除最后一个账户，显示空状态

---

### TC-007: 任务平台区域显示测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_snapshot
```

**预期结果:**
- 显示 "任务平台" 区域标题
- 显示说明文字 "连接您使用的任务管理平台"
- 显示三个平台连接卡片 (grid md:grid-cols-3)

---

### TC-008: 飞书连接按钮���试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_snapshot → 获取飞书卡片 uid
click uid="<飞书卡片uid>"
take_snapshot
```

**预期结果:**
- 触发飞书 OAuth 流程
- 发送请求到 `/api/feishu/oauth`
- 获取 authUrl 后重定向到飞书授权页面
- 授权完成后返回 /dashboard/accounts

---

### TC-009: Notion 连接按钮测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_snapshot → 获取 Notion 卡片 uid
click uid="<Notion卡片uid>"
wait_for text=["Notion 连接功能开发中"]
take_snapshot
```

**预期结果:**
- 显示 alert 提示 "Notion 连接功能开发中..."
- 不触发实际连接流程

---

### TC-010: Todoist 连接按钮测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_snapshot → 获取 Todoist 卡片 uid
click uid="<Todoist卡片uid>"
wait_for text=["Todoist 连接功能开发中"]
take_snapshot
```

**预期结果:**
- 显示 alert 提示 "Todoist 连接功能开发中..."
- 不触发实际连接流程

---

### TC-011: 平台卡片样式测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_snapshot
```

**预期结果:**

**飞书卡片:**
- 图标: "飞" 字，bg-[#4A7C59]/10 text-[#4A7C59]
- 名称: "飞书"
- 提示: "点击连接 飞书 账户"

**Notion 卡片:**
- 图标: "N" 字，bg-[#C15F3C]/10 text-[#C15F3C]
- 名称: "Notion"
- 提示: "点击连接 Notion 账户"

**Todoist 卡片:**
- 图标: "T" 字，bg-[#D4A574]/10 text-[#D4A574]
- 名称: "Todoist"
- 提示: "点击连接 Todoist 账户"

**通用样式:**
- p-4 border border-[#E8E6E1] rounded-xl
- hover:border-[#C15F3C] transition-colors
- text-left

---

### TC-012: 已连接任务账户显示测试

**前置条件:** 已连接至少一个任务平台账户

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_snapshot
```

**预期结果:**
- 在 "任务平台" 区域下方显示分隔线
- 显示 "已连接的账户" 标题
- 每个已连接账户显示:
  - 平台图标和颜色
  - 平台名称
  - 邮箱或工作区名称
  - 状态标签: "活跃" (bg-[#4A7C59]/10) 或 "未激活" (bg-[#B1ADA1]/10)
  - 删除按钮

---

### TC-013: 删除任务账户测试

**前置条件:** 已连接任务账户

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_snapshot → 获取任务账户删除按钮 uid
click uid="<删除按钮uid>"
wait_for text=["确定要删除这个任务账户吗？"]
take_snapshot
// 确认删除
send_keys key="Enter"
wait_for text=["活跃"] 或 [账户减少]
take_snapshot
```

**预期结果:**
- 显示确认对话框 "确定要删除这个任务账户吗？"
- 确认后发送 DELETE 请求到 `/api/task-accounts?id={accountId}`
- 账户从列表中移除
- 如删除最后一个账户，"已连接的账户" 区域消失

---

### TC-014: 添加账户按钮悬停效果测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_snapshot
hover uid="<添加账户按钮uid>"
take_screenshot filePath="e2e/screenshots/accounts/add_button_hover.png"
take_snapshot
```

**预期结果:**
- 悬停时边框颜色变为 border-[#C15F3C]
- 过渡效果平滑 (transition-colors)

---

### TC-015: 平台卡片悬停效果测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_snapshot
hover uid="<飞书卡片uid>"
take_screenshot filePath="e2e/screenshots/accounts/platform_card_hover.png"
take_snapshot
```

**预期结果:**
- 悬停时边框颜色变为 border-[#C15F3C]
- 过渡效果平滑 (transition-colors)
- 鼠标变为 pointer

---

### TC-016: 删除按钮悬停效果测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_snapshot
hover uid="<Gmail删除按钮uid>"
take_screenshot filePath="e2e/screenshots/accounts/delete_button_hover.png"
```

**预期结果:**
- 悬停时背景变为 hover:bg-[#B85450]/10
- 图标保持红色 text-[#B85450]

---

### TC-017: 加载状态测试

**步骤:**
```
// 使用网络节流模拟慢速加载
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_screenshot filePath="e2e/screenshots/accounts/loading.png"
```

**预期结果:**
- 显示两个骨架屏 (space-y-6)
- 每个骨架屏: bg-white border border-[#E8E6E1] rounded-xl p-6 animate-pulse h-48

---

### TC-018: API 请求失败测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
list_network_requests
list_console_messages types=["error"]
```

**预期结果:**
- 如果 API 请求失败:
  - Gmail 账户显示为空或保持上一次状态
  - 任务账户显示为空或保持上一次状态
  - 控制台记录错误 "Failed to fetch accounts:"

---

### TC-019: 多 Gmail 账户测试

**前置条件:** 已连接多个 Gmail 账户

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_snapshot
```

**预期结果:**
- 所有账户按顺序垂直排列 (space-y-3)
- 每个账户独立显示
- 每个账户有独立的删除按钮
- 删除一个不影响其他

---

### TC-020: Gmail 同步状态显示测试

**前置条件:** 有不同同步状态的账户

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_snapshot
```

**预期结果:**
- syncStatus=SUCCESS: 显示 "已同步"
- 其他状态: 显示 "待同步"
- 有 lastSyncAt: 显示 " · YYYY/MM/DD" 格式

---

### TC-021: 活跃任务账户显示测试

**前置条件:** 有 isActive=true 的任务账户

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_snapshot
```

**预期结果:**
- 状态标签显示 "活跃"
- 颜色: bg-[#4A7C59]/10 text-[#4A7C59]

---

### TC-022: 未激活任务账户显示测试

**前置条件:** 有 isActive=false 的任务账户

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_snapshot
```

**预期结果:**
- 状态标签显示 "未激活"
- 颜色: bg-[#B1ADA1]/10 text-[#9E9C98]

---

### TC-023: 任务账户邮箱显示测试

**前置条件:** 任务账户有 email 字段

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_snapshot
```

**预期结果:**
- 优先显示 email
- email 不为空时显示在平台名称下方

---

### TC-024: 任务账户工作区名称显示测试

**前置条件:** 任务账户无 email 但有 workspaceName

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_snapshot
```

**预期结果:**
- 显示 workspaceName
- 显示为 "已连接" 或工作区名称

---

### TC-025: 取消删除 Gmail 账户测试

**前置条件:** 已连接 Gmail 账户

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_snapshot
click uid="<删除按钮uid>"
wait_for text=["确定要删除"]
send_keys key="Escape"  // 或点击取消按钮
take_snapshot
```

**预期结果:**
- 对话框关闭
- 账户仍存在于列表中
- 无删除请求发送

---

### TC-026: 取消删除任务账户测试

**前置条件:** 已连接任务账户

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_snapshot
click uid="<任务账户删除按钮uid>"
wait_for text=["确定要删除"]
send_keys key="Escape"
take_snapshot
```

**预期结果:**
- 对话框关闭
- 账户仍存在于列表中

---

### TC-027: 飞书连接失败测试

**步骤:**
```
// 模拟 API 失败
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
click uid="<飞书卡片uid>"
wait_for text=["连接飞书失败"]
```

**预期结果:**
- 如果 `/api/feishu/oauth` 请求失败:
  - 显示 alert "连接飞书失败，请重试"
  - 用户留在当前页面

---

### TC-028: 最后一个Gmail账户删除测试

**前置条件:** 只有一个 Gmail 账户

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_snapshot
click uid="<删除按钮uid>"
send_keys key="Enter"
wait_for text=["还没有连接"]
take_snapshot
```

**预期结果:**
- 账户被删除
- 显示空状态组件
- "添加账户" 按钮仍可用

---

### TC-029: 最后一个任务账户删除测试

**前置条件:** 只有一个任务账户

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_snapshot
click uid="<任务账户删除按钮uid>"
send_keys key="Enter"
wait_for absence="已连接的账户"
take_snapshot
```

**预期结果:**
- 账户被删除
- "已连接的账户" 区域消失
- 平台连接卡片仍显示

---

### TC-030: 多平台账户混合显示测试

**前置条件:** 已连接多个不同平台的任务账户

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_snapshot
```

**预期结果:**
- 所有已连接账户都显示在 "已连接的账户" 区域
- 每个账户显示正确的平台图标和颜色
- 飞书: bg-[#4A7C59]/10 text-[#4A7C59] 图标 "飞"
- Notion: bg-[#C15F3C]/10 text-[#C15F3C] 图标 "N"
- Todoist: bg-[#D4A574]/10 text-[#D4A574] 图标 "T"

---

### TC-031: 无任务账户时隐藏区域测试

**前置条件:** 没有连接任何任务账户

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_snapshot
```

**预期结果:**
- 不显示 "已连接的账户" 区域
- 只显示平台连接卡片

---

### TC-032: Gmail 账户最后同步时间格式测试

**前置条件:** 有 lastSyncAt 的 Gmail 账户

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_snapshot
```

**预期结果:**
- 显示格式: "已同步 · YYYY/MM/DD"
- 使用 toLocaleDateString() 格式化

---

### TC-033: 无最后同步时间显示测试

**前置条件:** Gmail 账户没有 lastSyncAt

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_snapshot
```

**预期结果:**
- 只显示同步状态
- 不显示日期部分

---

### TC-034: 快速连续添加账户测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_snapshot
click uid="<添加账户按钮uid>"
// 立即再次点击（在 OAuth 流程中）
click uid="<添加账户按钮uid>"
```

**预期结果:**
- 第二次点击可能被忽略或触发新流程
- 没有错误状态

---

### TC-035: 删除账户后立即重新添加测试

**前置条件:** 有 Gmail 账户

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_snapshot
click uid="<删除按钮uid>"
send_keys key="Enter"
wait_for absence="<被删除账户邮箱>"
click uid="<添加账户按钮uid>"
```

**预期结果:**
- 账户被删除
- "添加账户" 按钮可用
- 触发 OAuth 流程

---

### TC-036: 账户信息截断测试

**前置条件:** 有超长邮箱地址的账户

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_snapshot
```

**预期结果:**
- 邮箱地址可能被截断
- 布局不破坏
- 悬停可能显示完整地址

---

### TC-037: OAuth 回跳后账户显示测试

**前置条件:** 完成 OAuth 授权

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_snapshot
```

**预期结果:**
- 新添加的账户立即显示在列表中
- 账户信息完整
- 同步状态可能为 "待同步"

---

### TC-038: 悬停账户项测试

**前置条件:** 有 Gmail 账户

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_snapshot
hover uid="<Gmail账户项uid>"
take_screenshot filePath="e2e/screenshots/accounts/account_item_hover.png"
```

**预期结果:**
- 账户项背景可能有变化
- 删除按钮保持可点击

---

---

## 响应式测试

### TC-040: 移动端布局测试 (375x667)

**步骤:**
```
emulate viewport="375x667"
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_screenshot filePath="e2e/screenshots/accounts/mobile_layout.png"
take_snapshot
```

**预期结果:**
- 平台卡片单列显示 (grid-cols-1)
- 添加账户按钮文字可能省略或换行
- 所有功能可用

---

### TC-041: 平板布局测试 (768x1024)

**步骤:**
```
emulate viewport="768x1024"
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_screenshot filePath="e2e/screenshots/accounts/tablet_layout.png"
take_snapshot
```

**预期结果:**
- 平台卡片可能显示为 2 列
- 布局适应屏幕

---

### TC-042: 桌面布局测试 (1920x1080)

**步骤:**
```
emulate viewport="1920x1080"
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_screenshot filePath="e2e/screenshots/accounts/desktop_layout.png"
take_snapshot
```

**预期结果:**
- 内容居中 (max-w-5xl mx-auto)
- 平台卡片显示为 3 列 (md:grid-cols-3)
- 布局美观

---

## 性能测试

### TC-050: 页面加载性能

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
lighthouse_audit mode="navigation"
```

**预期结果:**
- FCP < 1.8s
- LCP < 2.5s
- TTI < 3.8s

---

### TC-051: 多账户渲染性能测试

**前置条件:** 有多个 Gmail 和任务账户

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
measure_render_time
```

**预期结果:**
- 页面渲染流畅
- 删除操作响应迅速

---

## 错误处理测试

### TC-060: 删除 Gmail 失败测试

**步骤:**
```
// 模拟网络错误
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
click uid="<删除按钮uid>"
send_keys key="Enter"
list_console_messages types=["error"]
```

**预期结果:**
- 如果删除请求失败:
  - 控制台记录错误 "Failed to delete account:"
  - 账户仍显示在列表中
  - 用户可重试

---

### TC-061: 删除任务账户失败测试

**步骤:**
```
// 模拟网络错误
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
click uid="<任务账户删除按钮uid>"
send_keys key="Enter"
list_console_messages types=["error"]
```

**预期结果:**
- 如果删除请求失败:
  - 控制台记录错误 "Failed to delete account:"
  - 账户仍显示在列表中

---

### TC-062: 飞书连接失败测试

**步骤:**
```
// 模拟 API 失败
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
click uid="<飞书卡片uid>"
wait_for text=["连接飞书失败"]
```

**预期结果:**
- 如果 `/api/feishu/oauth` 请求失败:
  - 显示 alert "连接飞书失败，请重试"
  - 用户留在当前页面

---

### TC-063: 并发删除测试

**前置条件:** 有多个账户

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_snapshot
click uid="<删除按钮uid1>"
// 不等待确认，立即点击另一个
click uid="<删除按钮uid2>"
```

**预期结果:**
- 两个确认对话框可能依次显示
- 或第一个对话框获得焦点

---

### TC-064: 网络离线测试

**步骤:**
```
emulate network="offline"
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_snapshot
click uid="<添加账户按钮uid>"
```

**预期结果:**
- OAuth 可能失败
- 显示错误提示
- 页面不崩溃

---

## 可访问性测试

### TC-070: 键盘导航测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
send_keys key="Tab"  // 聚焦到添加账户按钮
send_keys key="Enter"  // 激活
send_keys key="Tab"  // 聚焦到飞书卡片
send_keys key="Enter"  // 激活
```

**预期结果:**
- 所有交互元素可通过 Tab 键访问
- 焦点指示器清晰可见
- Enter/Space 键可激活按钮和卡片

---

### TC-071: 屏幕阅读器测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_snapshot
```

**预期结果:**
- 按钮有明确的标签
- 删除按钮有明确的 aria-label 或上下文
- 平台卡片名称清晰
- 状态标签可被正确识别

---

### TC-072: 焦点顺序测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
send_keys key="Tab"
send_keys key="Tab"
send_keys key="Tab"
send_keys key="Tab"
```

**预期结果:**
- 焦点顺序符合逻辑
- 添加账户按钮 → Gmail 账户项 → 平台卡片 → 任务账户项

---

## 集成测试

### TC-080: 从其他页面导航

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
click uid="<账户管理链接uid>"
wait_for text=["账户管理"]
take_snapshot
```

**预期结果:**
- 成功导航到账户页
- URL 变为 /dashboard/accounts

---

### TC-081: 未登录访问测试

**前置条件:** 清除所有 session

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_snapshot
```

**预期结果:**
- 重定向到登录页或首页
- 显示登录提示

---

### TC-082: OAuth 回跳测试

**前置条件:** 完成 Google OAuth 授权

**步骤:**
```
// 模拟 OAuth 回跳
navigate_page type="url" url="http://localhost:3003/dashboard/accounts?code=xxx&state=xxx"
take_snapshot
```

**预期结果:**
- 新添加的 Gmail 账户显示在列表中
- 页面正常加载

---

### TC-083: 删除账户后从设置页返回测试

**前置条件:** 有 Gmail 账户

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_snapshot
click uid="<删除按钮uid>"
send_keys key="Enter"
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
```

**预期结果:**
- 设置页可能显示更新的账户状态
- 账户数量变化

---

### TC-084: 添加账户后从历史页返回测试

**前置条件:** 无 Gmail 账户

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
click uid="<添加账户按钮uid>"
// 完成 OAuth...
navigate_page type="url" url="http://localhost:3003/dashboard/history"
take_snapshot
```

**预期结果:**
- 历史页可以正常加载
- 可以进行同步操作

---

## 边界条件测试

### TC-090: 超长邮箱地址测试

**前置条件:** 有超长邮箱地址的账户

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_snapshot
```

**预期结果:**
- 邮箱地址可能被截断或换行
- 布局不破坏

---

### TC-091: 特殊字符邮箱测试

**前置条件:** 有特殊字符的邮箱

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_snapshot
```

**预期结果:**
- 特殊字符正确显示
- XSS 防护有效

---

### TC-092: 快速连续删除测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_snapshot
click uid="<删除按钮uid1>"
send_keys key="Enter"
// 立即尝试删除另一个
click uid="<删除按钮uid2>"
wait_for text=["确定要删除"]
```

**预期结果:**
- 第二个删除操作正常进行
- 没有竞态条件问题

---

### TC-093: 零账户状态测试

**前置条件:** 没有任何连接的账户

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_snapshot
```

**预期结果:**
- Gmail 区域显示空状态
- 任务平台区域只显示连接卡片
- 页面正常显示

---

### TC-094: 刷新页面状态保持测试

**前置条件:** 有已连接账户

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_snapshot
navigate_page type="reload"
take_snapshot
```

**预期结果:**
- 刷新后账户列表正确显示
- 数据从服务器重新获取

---

### TC-095: 跨标签页同步测试

**前置条件:** 在一个标签页添加账户

**步骤:**
```
// 标签页1 添加账户
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
click uid="<添加账户按钮uid>"
// 完成 OAuth...

// 标签页2 检查
open_tab id="tab2"
navigate_page type="url" url="http://localhost:3003/dashboard/accounts" tab="tab2"
take_snapshot tab="tab2"
```

**预期结果:**
- 标签页2 刷新后显示新账户
- 或需要手动刷新

---

## 全链路测试

### TC-100: 登录后访问账户页

**步骤:**
```
# 1. 登录
navigate_page type="url" url="http://localhost:3003"
click uid="<登录按钮>"
# 完成 OAuth 授权...
wait_for url="/dashboard"

# 2. 导航到账户页
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_snapshot
```

**预期结果:**
- 登录成功后重定向到 Dashboard
- 导航到账户页成功
- 页面正确显示

---

### TC-101: 完整添加 Gmail 账户流程

**步骤:**
```
# 1. 确保已登录
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"

# 2. 点击添加账户
take_snapshot step="1-添加前"
click uid="<添加账户按钮uid>"

# 3. 完成 Google OAuth
# (手动操作或模拟)
wait_for url="/dashboard/accounts"

# 4. 验证账户已添加
take_snapshot step="2-添加后"
```

**预期结果:**
- 触发 Google OAuth
- 授权成功后返回账户页
- 新账户显示在列表中
- 账户信息正确

---

### TC-102: 完整删除 Gmail 账户流程

**步骤:**
```
# 1. 访问账户页
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_snapshot step="1-删除前"

# 2. 删除账户
click uid="<删除按钮uid>"
wait_for text=["确定要删除"]
take_snapshot step="2-确认对话框"
send_keys key="Enter"

# 3. 验证已删除
wait_for absence="<被删除账户>"
take_snapshot step="3-删除后"
```

**预期结果:**
- 删除前账户存在
- 显示确认对话框
- 确认后账户消失
- 可能显示空状态

---

### TC-103: 完整连接飞书流程

**步骤:**
```
# 1. 访问账户页
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_snapshot step="1-连接前"

# 2. 点击飞书连接
click uid="<飞书卡片uid>"

# 3. 完成 OAuth (手动或模拟)
wait_for url="/dashboard/accounts"

# 4. 验证已连接
take_snapshot step="2-连接后"
```

**预期结果:**
- 触发飞书 OAuth
- 授权成功后返回账户页
- 新连接的账户显示在 "已连接的账户" 区域
- 状态为 "活跃"

---

### TC-104: 账户页与其他页面联动测试

**步骤:**
```
# 1. 添加账户
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
# (模拟添加 Gmail 账户)

# 2. 去设置页验证
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot step="设置页状态"

# 3. 去历史页验证
navigate_page type="url" url="http://localhost:3003/dashboard/history"
take_snapshot step="历史页状态"

# 4. 返回账户页
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_snapshot step="账户页状态"
```

**预期结果:**
- 设置页显示账户已连接
- 历史页可以正常访问
- 账户页账户状态一致

---

## 测试用例汇总

| ID | 用例名称 | 优先级 | 类型 |
|----|---------|--------|------|
| TC-001 | 页面加载 | P0 | 基础 |
| TC-002 | Gmail 区域显示 | P1 | UI |
| TC-003 | Gmail 空状态 | P1 | UI |
| TC-004 | 添加 Gmail | P1 | 功能 |
| TC-005 | Gmail 账户列表 | P1 | UI |
| TC-006 | 删除 Gmail | P1 | 功能 |
| TC-007 | 任务平台区域 | P1 | UI |
| TC-008 | 飞书连接 | P1 | 功能 |
| TC-009 | Notion 连接 | P2 | 功能 |
| TC-010 | Todoist 连接 | P2 | 功能 |
| TC-011 | 平台卡片样式 | P2 | UI |
| TC-012 | 已连接任务账户 | P1 | UI |
| TC-013 | 删除任务账户 | P1 | 功能 |
| TC-014 | 添加按钮悬停 | P2 | UI |
| TC-015 | 平台卡片悬停 | P2 | UI |
| TC-016 | 删除按钮悬停 | P2 | UI |
| TC-017 | 加载状态 | P1 | UI |
| TC-018 | API 失败 | P1 | 错误处理 |
| TC-019 | 多 Gmail 账户 | P2 | 功能 |
| TC-020 | 同步状态显示 | P2 | UI |
| TC-021 | 活跃任务账户 | P2 | UI |
| TC-022 | 未激活任务账户 | P2 | UI |
| TC-023 | 任务账户邮箱显示 | P2 | UI |
| TC-024 | 任务账户工作区显示 | P2 | UI |
| TC-025 | 取消删除 Gmail | P2 | 功能 |
| TC-026 | 取消删除任务 | P2 | 功能 |
| TC-027 | 飞书连接失败 | P1 | 错误处理 |
| TC-028 | 删除最后 Gmail | P2 | 功能 |
| TC-029 | 删除最后任务账户 | P2 | 功能 |
| TC-030 | 多平台账户混合 | P2 | UI |
| TC-031 | 无任务账户隐藏 | P2 | UI |
| TC-032 | 同步时间格式 | P2 | UI |
| TC-033 | 无同步时间显示 | P2 | UI |
| TC-034 | 快速连续添加 | P2 | 边界 |
| TC-035 | 删除后重新添加 | P2 | 功能 |
| TC-036 | 账户信息截断 | P2 | 边界 |
| TC-037 | OAuth 回跳显示 | P1 | 集成 |
| TC-038 | 悬停账户项 | P2 | UI |
| TC-040 | 移动端布局 | P2 | 响应式 |
| TC-041 | 平板布局 | P2 | 响应式 |
| TC-042 | 桌面布局 | P2 | 响应式 |
| TC-050 | 加载性能 | P2 | 性能 |
| TC-051 | 多账户渲染性能 | P2 | 性能 |
| TC-060 | 删除 Gmail 失败 | P1 | 错误处理 |
| TC-061 | 删除任务账户失败 | P1 | 错误处理 |
| TC-062 | 飞书连接失败 | P1 | 错误处理 |
| TC-063 | 并发删除 | P2 | 边界 |
| TC-064 | 网络离线 | P1 | 错误处理 |
| TC-070 | 键盘导航 | P1 | 可访问性 |
| TC-071 | 屏幕阅读器 | P2 | 可访问性 |
| TC-072 | 焦点顺序 | P2 | 可访问性 |
| TC-080 | 页面导航 | P1 | 集成 |
| TC-081 | 未登录访问 | P0 | 认证 |
| TC-082 | OAuth 回跳 | P1 | 集成 |
| TC-083 | 删除后设置页返回 | P2 | 集成 |
| TC-084 | 添加后历史页返回 | P2 | 集成 |
| TC-090 | 超长邮箱 | P2 | 边界 |
| TC-091 | 特殊字符 | P2 | 边界 |
| TC-092 | 快速删除 | P2 | 边界 |
| TC-093 | 零账户状态 | P2 | 边界 |
| TC-094 | 刷新状态保持 | P2 | 集成 |
| TC-095 | 跨标签页同步 | P2 | 集成 |
| TC-100 | 登录后访问 | P0 | 全链路 |
| TC-101 | 完整添加 Gmail | P0 | 全链路 |
| TC-102 | 完整删除 Gmail | P0 | 全链路 |
| TC-103 | 完整连接飞书 | P0 | 全链路 |
| TC-104 | 页面联动测试 | P1 | 全链路 |

**总计: 70 个测试用例**

---

## 附加说明

### API 端点依赖

- `GET /api/gmail/accounts` - 获取 Gmail 账户列表
- `DELETE /api/gmail/accounts?id={accountId}` - 删除 Gmail 账户
- `GET /api/task-accounts` - 获取任务账户列表
- `DELETE /api/task-accounts?id={accountId}` - 删除任务账户
- `GET /api/feishu/oauth` - 获取飞书授权 URL

### 相关文件

- 页面组件: `app/dashboard/accounts/page.tsx`
- 账户管理组件: `components/account-management.tsx`
- Page Object: `e2e/pages/accounts.page.ts`
- 测试文件: `e2e/tests/accounts.spec.ts`

### 测试数据准备建议

1. **Gmail 账户测试:**
   - 准备测试用 Google 账户
   - 或 Mock OAuth 流程

2. **任务账户测试:**
   - 准备飞书测试应用
   - Mock Notion/Todoist 连接

3. **多账户测试:**
   - 准备 2-3 个测试账户
   - 测试账户切换和删除

### 全链路测试说明

全链路测试需要：
1. 先完成登录（Google 或 GitHub OAuth）
2. 然后进行账户管理操作
3. 验证跨页面的状态同步
