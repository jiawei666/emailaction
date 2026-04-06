# 历史页 E2E 测试用例

> 生成时间: 2026-04-04
> 页面URL: http://localhost:3003/dashboard/history
> 组件: app/dashboard/history/page.tsx

## 测试前准备

1. 确保开发服务器运行: `npm run dev`
2. 确保已登录（需要有有效的 session）
3. 准备测试数据：至少有一条同步记录用于测试筛选功能
4. 打开 Chrome DevTools MCP 连接

---

## 测试用例

### TC-001: 页面加载测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/history"
take_snapshot
list_console_messages types=["error"]
```

**预期结果:**
- 页面正常加载
- 控制台无 error 级别日志
- 页面标题显示 "同步历史"
- 副标题显示 "查看所有已同步和已忽略的任务记录"

---

### TC-002: 筛选栏显示测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/history"
take_snapshot
```

**预期结果:**
- 筛选栏可见
- 显示以下筛选按钮:
  - 全部 (默认选中)
  - 已同步
  - 失败
  - 已忽略
- 显示记录计数 "共 X 条记录"
- 筛选栏右侧显示 Filter 图标

---

### TC-003: 全部筛选测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/history"
take_snapshot → 获取 "全部" 按钮 uid
click uid="<全部按钮uid>"
wait_for text=["全部"]
take_snapshot
```

**预期结果:**
- "全部" 按钮处于选中状态 (bg-[#C15F3C] text-white)
- 显示所有状态的记录
- 记录数量显示正确

---

### TC-004: 已同步筛选测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/history"
take_snapshot → 获取筛选按钮 uid
click uid="<已同步按钮uid>"
wait_for text=["已同步"]
take_snapshot
```

**预期结果:**
- "已同步" 按钮处于选中状态
- 只显示 status=SUCCESS 的记录
- 每条记录显示绿色 "已同步" 标签 (bg-[#4A7C59]/10 text-[#4A7C59])
- 记录左侧显示 CheckCircle2 图标 (绿色)

---

### TC-005: 失败筛选测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/history"
take_snapshot
click uid="<失败按钮uid>"
wait_for text=["失败"]
take_snapshot
```

**预期结果:**
- "失败" 按钮处于选中状态
- 只显示 status=FAILED 的记录
- 每条记录显示红色 "失败" 标签 (bg-[#B85450]/10 text-[#B85450])
- 记录左侧显示 XCircle 图标 (灰色)

---

### TC-006: 已忽略筛选测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/history"
take_snapshot
click uid="<已忽略按钮uid>"
wait_for text=["已忽略"]
take_snapshot
```

**预期结果:**
- "已忽略" 按钮处于选中状态
- 只显示 status=CANCELLED 的记录
- 每条记录显示灰色 "已忽略" 标签 (bg-[#B1ADA1]/10 text-[#9E9C98])

---

### TC-007: 空状态测试（无记录）

**前置条件:** 数据库无同步记录

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/history"
take_snapshot
```

**预期结果:**
- 显示空状态组件
- 显示 HistoryIcon 图标 (w-12 h-12, text-[#B1ADA1])
- 显示标题 "暂无历史记录"
- 显示提示 "开始同步任务后，记录将显示在这里"

---

### TC-008: 日期分组测试

**前置条件:** 有今天、昨天和更早的记录

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/history"
take_snapshot
```

**预期结果:**
- 记录按日期分组显示
- 显示分组标题:
  - "今天" - 今天创建的记录
  - "昨天" - 昨天创建的记录
  - "X月X日" - 更早的记录（中文格式）
  - "更早" - 也可用于更旧的记录
- 每个分组下的记录按创建时间排序

---

### TC-009: 历史记录项显示测试

**前置条件:** 有完整的同步记录

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/history"
take_snapshot
```

**预期结果:**
每条记录显示:
- 状态图标 (CheckCircle2 或 XCircle)
- 任务平台标签 (飞书/Notion/Todoist)
- 状态标签 (已同步/失败/已忽略)
- 任务标题 (truncate)
- 任务描述 (如果有，truncate)
- 来源邮箱 (来自: xxx@xxx.com)
- 时间戳 (相对时间或绝对时间)
- 外部链接按钮 (如果有 taskId)

**平台标签颜色:**
- 飞书: bg-[#4A7C59]/10 text-[#4A7C59]
- Notion: bg-[#C15F3C]/10 text-[#C15F3C]
- Todoist: bg-[#D4A574]/10 text-[#D4A574]

---

### TC-010: 外部链接按钮测试

**前置条件:** 有带 taskId 的记录

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/history"
take_snapshot → 获取外部链接按钮 uid
click uid="<外部链接按钮uid>"
```

**预期结果:**
- 点击按钮后打开新标签页
- 跳转到对应任务平台的任务详情页
- 或显示 "在任务平台中查看" 提示

---

### TC-011: 记录悬停效果测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/history"
take_snapshot
hover uid="<记录项uid>"
take_screenshot filePath="e2e/screenshots/history/hover_record.png"
```

**预期结果:**
- 鼠标悬停时记录背景变为 hover:bg-[#F4F3EE]/50
- 过渡效果平滑 (transition-colors)

---

### TC-012: 筛选按钮交互测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/history"
take_snapshot
click uid="<已同步按钮uid>"
wait_for text=["已同步"]
take_screenshot filePath="e2e/screenshots/history/filter_success.png"

click uid="<失败按钮uid>"
wait_for text=["失败"]
take_screenshot filePath="e2e/screenshots/history/filter_failed.png"

click uid="<已忽略按钮uid>"
wait_for text=["已忽略"]
take_screenshot filePath="e2e/screenshots/history/filter_cancelled.png"

click uid="<全部按钮uid>"
wait_for text=["全部"]
take_screenshot filePath="e2e/screenshots/history/filter_all.png"
```

**预期结果:**
- 每次点击后正确切换筛选状态
- 选中按钮样式: bg-[#C15F3C] text-white
- 未选中按钮样式: bg-[#F4F3EE] text-[#6B6966] hover:bg-[#E8E6E1]
- 记录列表正确更新

---

### TC-013: 记录数量计数测试

**前置条件:** 有固定数量的测试数据

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/history"
take_snapshot
```

**预期结果:**
- 筛选 "全部" 时显示总记录数
- 筛选 "已同步" 时只计算 SUCCESS 状态记录
- 筛选 "失败" 时只计算 FAILED 状态记录
- 筛选 "已忽略" 时只计算 CANCELLED 状态记录
- 格式: "共 X 条记录"

---

### TC-014: 加载状态测试

**步骤:**
```
// 使用网络节流模拟慢速加载
emulate network="offline"
navigate_page type="url" url="http://localhost:3003/dashboard/history"
take_screenshot filePath="e2e/screenshots/history/loading.png"
```

**预期结果:**
- 显示加载骨架屏
- 包含:
  - 页面标题骨架 (h-8 bg-[#E8E6E1] rounded mb-6 w-24)
  - 副标题骨架 (h-4 bg-[#E8E6E1] rounded mb-8 w-48)
  - 3 条记录骨架 (h-24 bg-[#E8E6E1] rounded-xl)
- 有 animate-pulse 动画效果

---

### TC-015: API 请求失败测试

**步骤:**
```
// 模拟 API 请求失败
navigate_page type="url" url="http://localhost:3003/dashboard/history"
list_network_requests
list_console_messages types=["error"]
```

**预期结果:**
- 如果 /api/tasks 请求失败
- 控制台记录错误日志 "Failed to fetch history:"
- 页面显示空状态或友好错误提示
- 不影响其他功能

---

### TC-016: 待确认状态记录测试

**前置条件:** 有 status=PENDING 的记录

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/history"
take_snapshot
```

**预期结果:**
- PENDING 状态记录显示
- 标签为 "待确认" (bg-[#D4A574]/10 text-[#D4A574])
- 左侧显示 XCircle 图标

---

### TC-017: 处理中状态记录测试

**前置条件:** 有 status=PROCESSING 的记录

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/history"
take_snapshot
```

**预期结果:**
- PROCESSING 状态记录显示
- 标签为 "处理中" (bg-[#C15F3C]/10 text-[#C15F3C])
- 左侧显示 XCircle 图标

---

### TC-018: 无 taskAccount 记录测试

**前置条件:** 有没有关联任务账户的记录

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/history"
take_snapshot
```

**预期结果:**
- 记录不显示平台标签
- 正常显示其他信息（标题、状态、时间等）

---

### TC-019: 无 taskId 记录测试

**前置条件:** 有没有 taskId 的记录

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/history"
take_snapshot
```

**预期结果:**
- 记录不显示外部链接按钮
- 右侧只显示时间戳

---

### TC-020: 时间戳显示测试

**前置条件:** 有不同时间创建的记录

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/history"
take_snapshot
```

**预期结果:**
- 有 syncedAt 的记录显示绝对时间 (formatDate)
- 没有 syncedAt 的记录显示相对时间 (getRelativeTime)
- 相对时间格式如: "2小时前"、"昨天"、"3天前"

---

### TC-021: 单个��期分组测试

**前置条件:** 所有记录都是今天创建的

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/history"
take_snapshot
```

**预期结果:**
- 只显示一个分组标题 "今天"
- 所有记录都在该分组下

---

### TC-022: 筛选后空状态测试

**前置条件:** 有记录但没有匹配筛选条件的记录

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/history"
take_snapshot
click uid="<失败按钮uid>"
wait_for text=["失败"]
take_snapshot
```

**预期结果:**
- 如果筛选后没有匹配的记录
- 显示空状态组件
- 提示没有符合筛选条件的记录

---

### TC-023: 长标题截断测试

**前置条件:** 有超长标题的记录

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/history"
take_snapshot
```

**预期结果:**
- 超长标题被截断 (truncate 类)
- 显示省略号
- 鼠标悬停可显示完整标题 (如果实现了 title 属性)

---

### TC-024: 无描述记录测试

**前置条件:** 有没有描述的记录

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/history"
take_snapshot
```

**预期结果:**
- 记录正常显示
- 不显示描述区域
- 布局不塌陷

---

### TC-025: 跨日期筛选测试

**前置条件:** 有跨越多天的记录，且状态不同

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/history"
take_snapshot
click uid="<已同步按钮uid>"
wait_for text=["已同步"]
take_snapshot
```

**预期结果:**
- 筛选后记录仍按日期分组
- 每个日期分组独立显示
- 空日期分组自动隐藏

---

### TC-026: 快速筛选切换测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/history"
take_snapshot
click uid="<已同步按钮uid>"
click uid="<失败按钮uid>"
click uid="<已忽略按钮uid>"
click uid="<全部按钮uid>"
take_snapshot
```

**预期结果:**
- 每次切换都正确更新
- 没有闪烁或错误
- 最终显示全部记录

---

### TC-027: 跨天边界测试

**前置条件:** 接近午夜 (23:59) 创建的记录

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/history"
take_snapshot
```

**预期结果:**
- 日期分组基于本地时区
- 边界记录正确分组
- "今天" 和 "昨天" 判断准确

---

### TC-028: 不同平台混合显示测试

**前置条件:** 有不同平台的记录（飞书、Notion、Todoist）

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/history"
take_snapshot
```

**预期结果:**
- 不同平台标签正确显示各自颜色
- 飞书: bg-[#4A7C59]/10 text-[#4A7C59]
- Notion: bg-[#C15F3C]/10 text-[#C15F3C]
- Todoist: bg-[#D4A574]/10 text-[#D4A574]

---

### TC-029: 记录项点击测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/history"
take_snapshot
click uid="<记录项主体uid>"
```

**预期结果:**
- 点击记录项主体无响应
- 点击外部链接按钮才跳转
- 避免误触

---

### TC-030: 连续滚动测试

**前置条件:** 有大量记录（超过一屏）

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/history"
take_snapshot
scroll_to element="bottom"
take_screenshot filePath="e2e/screenshots/history/scroll_bottom.png"
```

**预期结果:**
- 所有记录都可滚动查看
- 滚动流畅无卡顿
- 页面样式保持一致

---

## 响应式测试

### TC-040: 移动端布局测试 (375x667)

**步骤:**
```
emulate viewport="375x667"
navigate_page type="url" url="http://localhost:3003/dashboard/history"
take_screenshot filePath="e2e/screenshots/history/mobile_layout.png"
take_snapshot
```

**预期结果:**
- 筛选按钮在移动端可横向滚动或换行
- 记录项正常显示，内容不溢出
- 外部链接按钮可点击
- 文字被正确截断 (truncate)

---

### TC-041: 平板布局测试 (768x1024)

**步骤:**
```
emulate viewport="768x1024"
navigate_page type="url" url="http://localhost:3003/dashboard/history"
take_screenshot filePath="e2e/screenshots/history/tablet_layout.png"
take_snapshot
```

**预期结果:**
- 布局适应中等屏幕
- 所有筛选按钮可见
- 记录项布局合理

---

### TC-042: 桌面布局测试 (1920x1080)

**步骤:**
```
emulate viewport="1920x1080"
navigate_page type="url" url="http://localhost:3003/dashboard/history"
take_screenshot filePath="e2e/screenshots/history/desktop_layout.png"
take_snapshot
```

**预期结果:**
- 内容居中显示 (max-w-4xl mx-auto)
- 筛选栏布局合理
- 记录项充分利用空间

---

## 性能测试

### TC-050: 页面加载性能

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/history"
lighthouse_audit mode="navigation"
```

**预期结果:**
- FCP < 1.8s
- LCP < 2.5s
- TTI < 3.8s

---

### TC-051: 大数据量渲染测试

**前置条件:** 数据库有 100+ 条记录

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/history"
take_snapshot
```

**预期结果:**
- 页面流畅滚动
- 筛选切换响应迅速
- 无明显卡顿

---

### TC-052: 筛选切换性能测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/history"
take_snapshot
// 测量筛选切换时间
click uid="<已同步按钮uid>"
measure_render_time
```

**预期结果:**
- 筛选切换响应时间 < 200ms
- 视觉更新流畅

---

## 可访问性测试

### TC-060: 键盘导航测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/history"
// 使用 Tab 键遍历所有交互元素
send_keys key="Tab"
send_keys key="Tab"
send_keys key="Enter"
```

**预期结果:**
- 筛选按钮可通过 Tab 键访问
- 外部链接按钮可通过 Tab 键访问
- 焦点指示器清晰可见
- Enter/Space 键可激活按钮

---

### TC-061: 屏幕阅读器测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/history"
take_snapshot
```

**预期结果:**
- 按钮有明确的 aria-label 或文本内容
- 状态标签可被正确读出
- 链接目的明确

---

### TC-062: 颜色对比度测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/history"
take_snapshot
check_color_contrast
```

**预期结果:**
- 所有文本与背景对比度符合 WCAG AA 标准
- 状态标签颜色清晰可辨

---

## 边界条件测试

### TC-070: 特殊字符处理

**前置条件:** 有包含特殊字符的任务标题

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/history"
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
navigate_page type="url" url="http://localhost:3003/dashboard/history"
take_snapshot
```

**预期结果:**
- 标题被截断 (truncate)
- 描述被截断 (truncate)
- 布局不破坏

---

### TC-072: 时区处理测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/history"
take_snapshot
```

**预期结果:**
- 日期分组基于用户本地时区
- 时间戳显示正确的相对/绝对时间
- "今天"/"昨天" 判断准确

---

### TC-073: 邮箱地址显示测试

**前置条件:** 有各种格式的邮箱地址

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/history"
take_snapshot
```

**预期结果:**
- 邮箱地址完整显示在 "来自: xxx" 部分
- 超长邮箱可能被截断
- 邮箱格式正确

---

### TC-074: 空描述 null 处理测试

**前置条件:** 有 description=null 的记录

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/history"
take_snapshot
```

**预期结果:**
- 记录正常显示
- 不显示描述段落
- 无空白区域

---

### TC-075: 混合状态筛选测试

**前置条件:** 有多种状态的记录

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/history"
// 快速切换所有筛选
click uid="<已同步按钮uid>"
wait_for duration="100"
click uid="<失败按钮uid>"
wait_for duration="100"
click uid="<已忽略按钮uid>"
wait_for duration="100"
click uid="<全部按钮uid>"
take_snapshot
```

**预期结果:**
- 每次筛选结果正确
- 没有状态混乱
- 计数准确

---

## 集成测试

### TC-080: 从其他页面导航

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard"
take_snapshot
click uid="<历史链接uid>"
wait_for text=["同步历史"]
take_snapshot
```

**预期结果:**
- 从 Dashboard 点击 "历史" 链接
- 成功导航到历史页
- URL 变为 /dashboard/history

---

### TC-081: 未登录访问测试

**前置条件:** 清除所有 session

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/history"
take_snapshot
```

**预期结果:**
- 重定向到登录页或首页
- 显示 "欢迎使用 EmailAction" 或登录提示

---

### TC-082: 浏览器前进后退测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/history"
click uid="<已同步按钮uid>"
take_snapshot
send_keys key="Back"  // 浏览器后退
take_snapshot
send_keys key="Forward"  // 浏览器前进
take_snapshot
```

**预期结果:**
- 后退/前进正确保持筛选状态
- URL 正确更新
- 页面状态一致

---

### TC-083: 页面刷新状态保持测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/history"
take_snapshot
click uid="<失败按钮uid>"
wait_for text=["失败"]
navigate_page type="reload"
take_snapshot
```

**预期结果:**
- 刷新后页面重新加载
- 筛选状态可能重置为默认 "全部"
- 数据重新获取

---

### TC-084: 从待确认页导航测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/pending"
take_snapshot
click uid="<历史链接uid>"
wait_for text=["同步历史"]
take_snapshot
```

**预期结果:**
- 成功导航到历史页
- 显示所有历史记录（包括刚处理的）

---

## 错误场景测试

### TC-090: 网络错误恢复测试

**步骤:**
```
// 模拟网络断开
emulate network="offline"
navigate_page type="url" url="http://localhost:3003/dashboard/history"
take_snapshot
// 恢复网络
emulate network="online"
navigate_page type="reload"
take_snapshot
```

**预期结果:**
- 离线时显示错误或空状态
- 恢复后刷新可正常加载

---

### TC-091: API 响应延迟测试

**步骤:**
```
// 模拟慢速网络
emulate network="slow3g"
navigate_page type="url" url="http://localhost:3003/dashboard/history"
take_screenshot filePath="e2e/screenshots/history/slow_loading.png"
```

**预期结果:**
- 显示加载骨架屏
- 加载完成后正确显示内容
- 无超时错误

---

### TC-092: API 返回空数组测试

**前置条件:** API 返回空数组

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/history"
take_snapshot
```

**预期结果:**
- 显示空状态组件
- 不显示错误
- 筛选栏仍可交互

---

## 测试用例汇总

| ID | 用例名称 | 优先级 | 类型 |
|----|---------|--------|------|
| TC-001 | 页面加载 | P0 | 基础 |
| TC-002 | 筛选栏显示 | P1 | UI |
| TC-003 | 全部筛选 | P1 | 功能 |
| TC-004 | 已同步筛选 | P1 | 功能 |
| TC-005 | 失败筛选 | P1 | 功能 |
| TC-006 | 已忽略筛选 | P1 | 功能 |
| TC-007 | 空状态 | P1 | UI |
| TC-008 | 日期分组 | P2 | UI |
| TC-009 | 记录项显示 | P1 | UI |
| TC-010 | 外部链接 | P2 | 功能 |
| TC-011 | 悬停效果 | P2 | UI |
| TC-012 | 筛选切换 | P1 | 交互 |
| TC-013 | 记录计数 | P2 | 功能 |
| TC-014 | 加载状态 | P1 | UI |
| TC-015 | API 失败 | P1 | 错误处理 |
| TC-016 | 待确认状态 | P2 | UI |
| TC-017 | 处理中状态 | P2 | UI |
| TC-018 | 无任务账户 | P2 | 边界 |
| TC-019 | 无任务ID | P2 | 边界 |
| TC-020 | 时间戳显示 | P2 | UI |
| TC-021 | 单日期分组 | P2 | 边界 |
| TC-022 | 筛选空状态 | P1 | UI |
| TC-023 | 长标题截断 | P2 | 边界 |
| TC-024 | 无描述记录 | P2 | 边界 |
| TC-025 | 跨日期筛选 | P2 | 功能 |
| TC-026 | 快速筛选切换 | P2 | 交互 |
| TC-027 | 跨天边界 | P2 | 边界 |
| TC-028 | 混合平台显示 | P2 | UI |
| TC-029 | 记录项点击 | P2 | 交互 |
| TC-030 | 连续滚动 | P2 | 交互 |
| TC-040 | 移动端布局 | P2 | 响应式 |
| TC-041 | 平板布局 | P2 | 响应式 |
| TC-042 | 桌面布局 | P2 | 响应式 |
| TC-050 | 加载性能 | P2 | 性能 |
| TC-051 | 大数据量 | P2 | 性能 |
| TC-052 | 筛选切换性能 | P2 | 性能 |
| TC-060 | 键盘导航 | P1 | 可访问性 |
| TC-061 | 屏幕阅读器 | P2 | 可访问性 |
| TC-062 | 颜色对比度 | P2 | 可访问性 |
| TC-070 | 特殊字符 | P2 | 边界 |
| TC-071 | 超长文本 | P2 | 边界 |
| TC-072 | 时区处理 | P2 | 边界 |
| TC-073 | 邮箱地址显示 | P2 | 边界 |
| TC-074 | 空描述处理 | P2 | 边界 |
| TC-075 | 混合状态筛选 | P2 | 功能 |
| TC-080 | 页面导航 | P1 | 集成 |
| TC-081 | 未登录访问 | P0 | 认证 |
| TC-082 | 前进后退 | P2 | 集成 |
| TC-083 | 刷新状态保持 | P2 | 集成 |
| TC-084 | 待确认页导航 | P2 | 集成 |
| TC-090 | 网络错误恢复 | P1 | 错误处理 |
| TC-091 | API 响应延迟 | P1 | 错误处理 |
| TC-092 | API 空数组 | P1 | 错误处理 |

**总计: 53 个测试用例**

---

## 附加说明

### 需要的测试数据准备

1. **创建不同状态的记录:**
   - SUCCESS 状态记录 (至少 2 条，不同日期)
   - FAILED 状态记录 (至少 1 条)
   - CANCELLED 状态记录 (至少 1 条)
   - PENDING 状态记录 (至少 1 条)
   - PROCESSING 状态记录 (至少 1 条)

2. **创建不同平台的记录:**
   - 飞书记录
   - Notion 记录
   - Todoist 记录
   - 无平台记录

3. **创建不同日期的记录:**
   - 今天的记录
   - 昨天的记录
   - 更早的记录

4. **创建带 taskId 的记录** (用于测试外部链接)

5. **创建特殊数据:**
   - 超长标题的记录
   - 特殊字符标题的记录
   - 无描述的记录
   - 超长邮箱的记录

### API 端点依赖

- `GET /api/tasks?limit=100` - 获取同步历史记录

### 相关文件

- 页面组件: `app/dashboard/history/page.tsx`
- Page Object: `e2e/pages/history.page.ts`
- 测试文件: `e2e/tests/history.spec.ts`

### 全链路测试前置条件

在执行历史页测试前，需要先完成登录流程：

```
# 1. 登录
navigate_page type="url" url="http://localhost:3003"
click uid="<登录按钮>"
# 完成 OAuth 授权...
wait_for url="/dashboard"

# 2. 导航到历史页
navigate_page type="url" url="http://localhost:3003/dashboard/history"
```
