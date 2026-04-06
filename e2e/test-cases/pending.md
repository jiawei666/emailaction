# 待确认页 E2E 测试用例

> 生成时间: 2026-04-04
> 页面URL: http://localhost:3003/dashboard/pending
> 组件: app/dashboard/pending/page.tsx

## 测试前准���

1. 确保开发服务器运行: `npm run dev`
2. 确保已登录（需要有有效的 session）
3. 准备测试数据: 至少 3 条待确认任务（不同优先级）
4. 准备任务平台账户（用于测试批量同步）
5. 打开 Chrome DevTools MCP 连接

---

## 测试用例

### TC-001: 页面加载测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/pending"
take_snapshot
list_console_messages types=["error"]
```

**预期结果:**
- 页面正常加载
- 控制台无 error 级别日志
- 页面标题显示 "待确认"
- 副标题显示 "AI 识别的待办事项，确认后同步到任务平台"

---

### TC-002: 操作栏显示测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/pending"
take_snapshot
```

**预期结果:**
显示操作栏包含:
- 全选复选框和 "全选" 文字
- 筛选区域（筛选: + 4 个筛选按钮）
- 记录计数（如果已选择项）

**筛选按钮:**
- 全部（默认选中）
- 高
- 中
- 低

---

### TC-003: 全选功能测试

**前置条件:** 有多条待确认任务

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/pending"
take_snapshot → 获取全选复选框 uid
click uid="<全选复选框uid>"
take_snapshot
```

**预期结果:**
- 所有任务的复选框被选中
- 批量操作按钮出现
- "批量确认 (N)" 显示正确的选中数量

---

### TC-004: 取消全选测试

**前置条件:** 已选中所有任务

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/pending"
take_snapshot
click uid="<全选复选框uid>"  // 再次点击
take_snapshot
```

**预期结果:**
- 所有任务的复选框取消选中
- 批量操作按钮消失

---

### TC-005: 单个任务选择测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/pending"
take_snapshot → 获取第一个任务复选框 uid
click uid="<任务复选框uid>"
take_snapshot
```

**预期结果:**
- 该任务复选框被选中
- 全选复选框变为未选中状态（因为不是全部选中）
- 批量操作按钮出现

---

### TC-006: 全部筛选测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/pending"
take_snapshot → 获取"全部"按钮 uid
click uid="<全部按钮uid>"
wait_for text=["全部"]
take_snapshot
```

**预期结果:**
- "全部" 按钮处于选中状态 (bg-[#C15F3C] text-white)
- 显示所有优先级的任务
- 未选中按钮样式: bg-[#F4F3EE] text-[#6B6966] hover:bg-[#E8E6E1]

---

### TC-007: 高优先级筛选测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/pending"
take_snapshot
click uid="<高按钮uid>"
wait_for text=["高"]
take_snapshot
```

**预期结果:**
- "高" 按钮处于选中状态
- 只显示 priority >= 4 的任务
- 每条任务显示红色 "高优先级" 标签 (text-[#B85450] bg-[#B85450]/10)

---

### TC-008: 中优先级筛选测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/pending"
take_snapshot
click uid="<中按钮uid>"
wait_for text=["中"]
take_snapshot
```

**预期结果:**
- "中" 按钮处于选中状态
- 只显示 priority === 3 或 priority === 2 的任务
- 每条任务显示棕色 "中优先级" 标签 (text-[#D4A574] bg-[#D4A574]/10)

---

### TC-009: 低优先级筛选测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/pending"
take_snapshot
click uid="<低按钮uid>"
wait_for text=["低"]
take_snapshot
```

**预期结果:**
- "低" 按钮处于选中状态
- 只显示 priority === 1 的任务
- 每条任务显示灰色 "低优先级" 标签 (text-[#6B6966] bg-[#6B6966]/10)

---

### TC-010: 任务项显示测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/pending"
take_snapshot
```

**预期结果:**
每个任务项显示:
- 复选框（w-4 h-4，橙色 focus）
- 优先级标签（高/中/低优先级）
- 截止日期（如果有，Clock 图标 + 日期）
- 相对时间
- 任务标题
- 任务描述（line-clamp-2）
- 来源邮箱
- 操作按钮（同步、忽略）

---

### TC-011: 截止日期显示测试

**前置条件:** 有带截止日期的任务

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/pending"
take_snapshot
```

**预期结果:**
- 显示 Clock 图标 (w-3 h-3)
- 显示 "截止: {日期}" 格式（中文格式）
- 文字颜色 text-[#6B6966]

---

### TC-012: 单个任务确认测试

**前置条件:** 有待确认任务和任务账户

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/pending"
take_snapshot → 获取确认按钮 uid
click uid="<确认按钮uid>"
wait_for text=["太棒了"] 或 [任务减少]
take_snapshot
```

**预期结果:**
- 任务从列表中移除
- 发送 POST 请求到 `/api/tasks/{id}/sync`
- 按钮在处理时显示 Loader2 图标旋转
- 如果是最后一个任务，显示空状态

---

### TC-013: 单个任务忽略测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/pending"
take_snapshot → 获取忽略按钮 uid
click uid="<忽略按钮uid>"
wait_for text=["确定要忽略"]
send_keys key="Enter"
take_snapshot
```

**预期结果:**
- 显示确认对话框 "确定要忽略这个任务吗？"
- 确认后任务从列表中移除
- 发送 DELETE 请求到 `/api/tasks/{id}`

---

### TC-014: 取消忽略测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/pending"
take_snapshot
click uid="<忽略按钮uid>"
wait_for text=["确定要忽略"]
send_keys key="Escape"  // 或点击取消
take_snapshot
```

**预期结果:**
- 对话框关闭
- 任务仍保留在列表中

---

### TC-015: 批量确认测试

**前置条件:** 已选中多个任务且有任务账户

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/pending"
take_snapshot
// 选择多个任务
click uid="<任务1复选框uid>"
click uid="<任务2复选框uid>"
click uid="<批量确认按钮uid>"
wait_for text=["处理中"] 或 [任务减少]
take_snapshot
```

**预期结果:**
- 显示 "批量确认 (N)" 按钮且 N 正确
- 点击后按钮显示 Loader2 图标旋转
- 发送 PATCH 请求设置 taskAccountId
- 发送 POST 请求到 `/api/tasks/{id}/sync`
- 所有选中的任务从列表移除
- 选中状态被清空

---

### TC-016: 批量确认无账户测试

**前置条件:** 已选中任务但没有任务账户

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/pending"
take_snapshot
// 选择任务
click uid="<任务复选框uid>"
click uid="<批量确认按钮uid>"
wait_for text=["请先添加任务平台账户"]
```

**预期结果:**
- 显示 alert "请先添加任务平台账户"
- 不执行同步操作

---

### TC-017: 批量忽略测试

**前置条件:** 已选中多个任务

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/pending"
take_snapshot
// 选择多个任务
click uid="<任务1复选框uid>"
click uid="<任务2复选框uid>"
click uid="<批量忽略按钮uid>"
wait_for text=["确定要忽略选中的"]
send_keys key="Enter"
take_snapshot
```

**预期结果:**
- 显示确认对话框 "确定要忽略选中的 N 个任务吗？"
- 确认后所有选中任务从列表移除
- 发送 DELETE 请求到 `/api/tasks/{id}`

---

### TC-018: 批量操作取消测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/pending"
take_snapshot
click uid="<批量忽略按钮uid>"
wait_for text=["确定要忽略选中的"]
send_keys key="Escape"
take_snapshot
```

**预期结果:**
- 对话框关闭
- 任务仍保留在列表中

---

### TC-019: 平台选择下拉框测试

**前置条件:** 有多个任务账户

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/pending"
take_snapshot → 获取平台选择下拉框 uid
click uid="<平台选择下拉框uid>"
take_snapshot
```

**预期结果:**
- 下拉框展开显示选项
- 默认显示 "选择平台"
- 列出所有连接的任务账户
- 每个选项显示平台名称（飞书/Notion/Todoist）

---

### TC-020: 选择平台同步测试

**前置条件:** 有多个任务账户

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/pending"
take_snapshot
click uid="<平台选择下拉框uid>"
// 选择第二个平台
click uid="<平台2选项uid>"
wait_for text=["太棒了"] 或 [任务减少]
```

**预期结果:**
- 选中指定平台
- 触发任务同步到该平台
- 任务从列表移除

---

### TC-021: 空状态测试（全部处理完）

**前置条件:** 没有待确认任务

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/pending"
take_snapshot
```

**预期结果:**
- 显示空状态组件
- AlertCircle 图标 (w-12 h-12 text-[#B1ADA1])
- 标题 "没有待处理项"
- 提示 "太棒了！所有待办事项已处理完毕"

---

### TC-022: 筛选后空状态测试

**前置条件:** 有任务但不符合筛选条件

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/pending"
take_snapshot
click uid="<高按钮uid>"
// 如果没有高优先级任务
take_snapshot
```

**预期结果:**
- 显示空状态
- 提示 "当前筛选条件下没有待确认的任务"

---

### TC-023: 加载状态测试

**步骤:**
```
// 使用网络节流模拟慢速加载
emulate network="offline"
navigate_page type="url" url="http://localhost:3003/dashboard/pending"
take_screenshot filePath="e2e/screenshots/pending/loading.png"
```

**预期结果:**
- 显示加载骨架屏
- 包含:
  - 标题骨架 (h-8 bg-[#E8E6E1] rounded mb-6 w-32)
  - 副标题骨架 (h-4 bg-[#E8E6E1] rounded mb-8 w-64)
  - 3 条任务骨架 (h-32 bg-[#E8E6E1] rounded-xl)
- 有 animate-pulse 动画效果

---

### TC-024: 同步中状态测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/pending"
take_snapshot
click uid="<确认按钮uid>"
// 立即截图捕获加载状态
take_screenshot filePath="e2e/screenshots/pending/syncing.png"
```

**预期结果:**
- 按钮显示 Loader2 图标
- 图标旋转 (animate-spin)
- 按钮变为 disabled
- 其他按钮仍可点击

---

### TC-025: 批量同步中状态测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/pending"
take_snapshot
// 选择多个任务
click uid="<任务1复选框uid>"
click uid="<任务2复选框uid>"
click uid="<批量确认按钮uid>"
take_screenshot filePath="e2e/screenshots/pending/batch_syncing.png"
```

**预期结果:**
- 批量确认按钮显示 Loader2 图标旋转
- 按钮变为 disabled
- 其他操作可能被禁用

---

### TC-026: API 失败测试

**步骤:**
```
// 模拟 API 失败
navigate_page type="url" url="http://localhost:3003/dashboard/pending"
take_snapshot
click uid="<确认按钮uid>"
wait_for text=["同步失败"]
list_console_messages types=["error"]
```

**预期结果:**
- 显示 alert "同步失败: {错误信息}"
- 任务保留在列表中
- 控制台记录错误

---

### TC-027: 批量操作失败测试

**步骤:**
```
// 模拟 API 失败
navigate_page type="url" url="http://localhost:3003/dashboard/pending"
take_snapshot
// 选择多个任务
click uid="<任务1复选框uid>"
click uid="<任务2复选框uid>"
click uid="<批量确认按钮uid>"
wait_for text=["批量同步失败"]
```

**预期结果:**
- 显示 alert "批量同步失败，请重试"
- 选中状态保留
- 控制台记录错误

---

### TC-028: 任务卡片悬停效果测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/pending"
take_snapshot
hover uid="<任务卡片uid>"
take_screenshot filePath="e2e/screenshots/pending/card_hover.png"
```

**预期结果:**
- 卡片边框颜色变为 hover:border-[#B1ADA1]
- 过渡效果平滑 (transition-colors)

---

### TC-029: 筛选按钮切换测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/pending"
take_snapshot
// 依次测试所有筛选
click uid="<高按钮uid>"
take_screenshot filePath="e2e/screenshots/pending/filter_high.png"

click uid="<中按钮uid>"
take_screenshot filePath="e2e/screenshots/pending/filter_medium.png"

click uid="<低按钮uid>"
take_screenshot filePath="e2e/screenshots/pending/filter_low.png"

click uid="<全部按钮uid>"
take_screenshot filePath="e2e/screenshots/pending/filter_all.png"
```

**预期结果:**
- 每次点击后正确切换筛选状态
- 选中按钮样式: bg-[#C15F3C] text-white
- 未选中按钮样式: bg-[#F4F3EE] text-[#6B6966] hover:bg-[#E8E6E1]
- 任务列表正确更新

---

### TC-030: 同步失败后重试测试

**步骤:**
```
// 第一次同步失败
navigate_page type="url" url="http://localhost:3003/dashboard/pending"
take_snapshot
click uid="<确认按钮uid>"
wait_for text=["同步失败"]
// 再次尝试
click uid="<确认按钮uid>"
// 这次假设成功
wait_for text=["太棒了"] 或 [任务减少]
```

**预期结果:**
- 第二次同步可以正常执行
- 失败不影响后续操作

---

## 响应式测试

### TC-040: 移动端布局测试 (375x667)

**步骤:**
```
emulate viewport="375x667"
navigate_page type="url" url="http://localhost:3003/dashboard/pending"
take_screenshot filePath="e2e/screenshots/pending/mobile_layout.png"
take_snapshot
```

**预期结果:**
- 操作栏元素可能换行
- 筛选按钮可横向滚动
- 任务卡片内容正常显示
- 所有功能可用

---

### TC-041: 平板布局测试 (768x1024)

**步骤:**
```
emulate viewport="768x1024"
navigate_page type="url" url="http://localhost:3003/dashboard/pending"
take_screenshot filePath="e2e/screenshots/pending/tablet_layout.png"
take_snapshot
```

**预期结果:**
- 布局适应中等屏幕
- 操作栏布局合理
- 任务卡片充分利用空间

---

### TC-042: 桌面布局测试 (1920x1080)

**步骤:**
```
emulate viewport="1920x1080"
navigate_page type="url" url="http://localhost:3003/dashboard/pending"
take_screenshot filePath="e2e/screenshots/pending/desktop_layout.png"
take_snapshot
```

**预期结果:**
- 内容居中 (max-w-4xl mx-auto)
- 操作栏布局美观
- 任务卡片排列整齐

---

## 性能测试

### TC-050: 页面加载性能

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/pending"
lighthouse_audit mode="navigation"
```

**预期结果:**
- FCP < 1.8s
- LCP < 2.5s
- TTI < 3.8s

---

### TC-051: 大数据量渲染测试

**前置条件:** 有 50+ 条待确认任务

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/pending"
take_snapshot
```

**预期结果:**
- 页面流畅滚动
- 筛选切换响应迅速
- 批量操作正常执行

---

## 可访问性测试

### TC-060: 键盘导航测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/pending"
send_keys key="Tab"  // 聚焦到全选复选框
send_keys key="Space"  // 切换全选
send_keys key="Tab"  // 聚焦到筛选按钮
send_keys key="Enter"  // 激活筛选
send_keys key="Tab"  // 聚焦到任务复选框
send_keys key="Space"  // 选择任务
```

**预期结果:**
- 所有交互元素可通过 Tab 键访问
- 焦点指示器清晰可见
- Space 键可切换复选框
- Enter 键可激活按钮

---

### TC-061: 屏幕阅读器测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/pending"
take_snapshot
```

**预期结果:**
- 复选框有关联的 label
- 按钮有明确的文本内容
- 优先级标签可被正确读出
- 任务信息结构清晰

---

## 边界条件测试

### TC-070: 特殊字符处理

**前置条件:** 任务标题或描述包含特殊字符

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/pending"
take_snapshot
```

**预期结果:**
- 特殊字符正确显示
- HTML 实体被正确转义
- XSS 防护有效

---

### TC-071: 超长文本处理

**前置条件:** 有超长任务标题和描述

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/pending"
take_snapshot
```

**预期结果:**
- 描述被截断 (line-clamp-2)
- 布局不破坏
- 文字可读

---

### TC-072: 无任务账户时测试

**前置条件:** 没有连接任务平台账户

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/pending"
take_snapshot
```

**预期结果:**
- 页面正常显示
- 单个确认按钮仍可用
- 平台选择下拉框不显示
- 批量确认提示添加账户

---

### TC-073: 快速连续操作测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/pending"
take_snapshot
click uid="<确认按钮uid>"
// 立即点击另一个
click uid="<确认按钮uid2>"
```

**预期结果:**
- 两个操作都能正确执行
- 没有竞态条件问题
- UI 正确更新

---

### TC-074: 同步时切换筛选测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/pending"
take_snapshot
click uid="<确认按钮uid>"
// 在同步过程中切换筛选
click uid="<高按钮uid>"
```

**预期结果:**
- 筛选可以正常切换
- 同步操作继续执行
- 不产生错误

---

## 集成测试

### TC-080: 从 Dashboard 导航

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard"
take_snapshot
click uid="<处理待办邮件按钮uid>"
wait_for text=["待确认"]
take_snapshot
```

**预期结果:**
- 成功导航到待确认页
- URL 变为 /dashboard/pending

---

### TC-081: 从统计卡片导航

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard"
take_snapshot
click uid="<待处理卡片uid>"
wait_for text=["待确认"]
```

**预期结果:**
- 成功导航到待确认页
- 显示待确认任务列表

---

### TC-082: 同步后导航到历史页

**前置条件:** 确认一个任务

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/pending"
take_snapshot
click uid="<确认按钮uid>"
// 同步完成后
navigate_page type="url" url="http://localhost:3003/dashboard/history"
wait_for text=["同步历史"]
```

**预期结果:**
- 历史页显示已同步的任务
- 状态为 "已同步"

---

### TC-083: 未登录访问测试

**前置条件:** 清除所有 session

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/pending"
take_snapshot
```

**预期结果:**
- 重定向到登录页或首页
- 显示登录提示

---

## 测试用例汇总

| ID | 用例名称 | 优先级 | 类型 |
|----|---------|--------|------|
| TC-001 | 页面加载 | P0 | 基础 |
| TC-002 | 操作栏显示 | P1 | UI |
| TC-003 | 全选功能 | P1 | 功能 |
| TC-004 | 取消全选 | P1 | 功能 |
| TC-005 | 单个任务选择 | P1 | 功能 |
| TC-006 | 全部筛选 | P1 | 功能 |
| TC-007 | 高优先级筛选 | P1 | 功能 |
| TC-008 | 中优先级筛选 | P1 | 功能 |
| TC-009 | 低优先级筛选 | P1 | 功能 |
| TC-010 | 任务项显示 | P1 | UI |
| TC-011 | 截止日期显示 | P2 | UI |
| TC-012 | 单个任务确认 | P0 | 功能 |
| TC-013 | 单个任务忽略 | P1 | 功能 |
| TC-014 | 取消忽略 | P1 | 功能 |
| TC-015 | 批量确认 | P1 | 功能 |
| TC-016 | 批量确认无账户 | P1 | 功能 |
| TC-017 | 批量忽略 | P1 | 功能 |
| TC-018 | 批量操作取消 | P1 | 功能 |
| TC-019 | 平台选择下拉框 | P2 | 功能 |
| TC-020 | 选择平台同步 | P2 | 功能 |
| TC-021 | 空状态(全部处理) | P1 | UI |
| TC-022 | 筛选后空状态 | P1 | UI |
| TC-023 | 加载状态 | P1 | UI |
| TC-024 | 同步中状态 | P1 | UI |
| TC-025 | 批量同步中状态 | P1 | UI |
| TC-026 | API 失败 | P1 | 错误处理 |
| TC-027 | 批量操作失败 | P1 | 错误处理 |
| TC-028 | 任务卡片悬停 | P2 | UI |
| TC-029 | 筛选按钮切换 | P1 | 交互 |
| TC-030 | 同步失败重试 | P2 | 错误处理 |
| TC-040 | 移动端布局 | P2 | 响应式 |
| TC-041 | 平板布局 | P2 | 响应式 |
| TC-042 | 桌面布局 | P2 | 响应式 |
| TC-050 | 加载性能 | P2 | 性能 |
| TC-051 | 大数据量渲染 | P2 | 性能 |
| TC-060 | 键盘导航 | P1 | 可访问性 |
| TC-061 | 屏幕阅读器 | P2 | 可访问性 |
| TC-070 | 特殊字符处理 | P2 | 边界 |
| TC-071 | 超长文本处理 | P2 | 边界 |
| TC-072 | 无任务账户 | P1 | 边界 |
| TC-073 | 快速连续操作 | P2 | 边界 |
| TC-074 | 同步时切换筛选 | P2 | 边界 |
| TC-080 | 从 Dashboard 导航 | P1 | 集成 |
| TC-081 | 从统计卡片导航 | P1 | 集成 |
| TC-082 | 同步后导航历史 | P1 | 集成 |
| TC-083 | 未登录访问 | P0 | 认证 |

**总计: 50 个测试用例**

---

## 附加说明

### API 端点依赖

- `GET /api/tasks?status=PENDING&limit=50` - 获取待确认任务
- `GET /api/task-accounts` - 获取任务平台账户
- `POST /api/tasks/{id}/sync` - 同步单个任务
- `PATCH /api/tasks/{id}` - 更新任务（设置 taskAccountId）
- `DELETE /api/tasks/{id}` - 删除/忽略任务

### 优先级说明

- **高优先级 (priority >= 4)**: 红色标签 text-[#B85450] bg-[#B85450]/10
- **中优先级 (priority === 3 或 2)**: 棕色标签 text-[#D4A574] bg-[#D4A574]/10
- **低优先级 (priority === 1)**: 灰色标签 text-[#6B6966] bg-[#6B6966]/10
- **默认优先级 (priority === null)**: 视为中优先级 (priority || 2)

### 相关文件

- 页面组件: `app/dashboard/pending/page.tsx`
- Page Object: `e2e/pages/pending.page.ts`
- 测试文件: `e2e/tests/pending.spec.ts`

### 测试数据准备建议

1. **待确认任务准备:**
   - 至少 3 条不同优先级的任务（高、中、低）
   - 至少 2 条带截止日期的任务
   - 至少 2 条超长文本的任务
   - 至少 1 条带特殊字符的任务

2. **任务账户准备:**
   - 至少 1 个任务平台账户
   - 如需测试平台选择，准备 2+ 个账户

3. **批量操作测试:**
   - 准备 5+ 条任务用于批量操作测试
