# Settings 页面 E2E 测试用例

> 生成时间: 2026-04-04
> 页面URL: http://localhost:3003/dashboard/settings
> 组件: app/dashboard/settings/page.tsx

## 测试前准备

1. 确保开发服务器运行: `npm run dev`
2. 确保已登录（需要有有效的 session）
3. 准备测试: 需要测试各种设置开关和按钮
4. 打开 Chrome DevTools MCP 连接

---

## 测试用��

### TC-001: 页面加载测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
list_console_messages types=["error"]
```

**预期结果:**
- 页面正常加载
- 控制台无 error 级别日志
- 页面标题显示 "设置"
- 副标题显示 "管理您的账户和偏好设置"

---

### TC-002: Gmail 账户区域显示测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
```

**预期结果:**
- 显示 "Gmail 账户" 区域
- 显示 Mail 图标 (w-5 h-5 text-[#C15F3C])
- 显示说明文字 "管理连接的 Gmail 账户"
- 显示已连接账户列表

---

### TC-003: Gmail 账户信息显示测试

**前置条件:** 已连接 Gmail 账户

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
```

**预期结果:**
每个 Gmail 账户显示:
- 邮箱地址 (font-medium)
- 上次同步时间 (text-sm text-[#6B6966])
- "已连接" 状态 (text-[#4A7C59] 带 Check 图标)
- "断开" 按钮 (px-3 py-1.5 border border-[#E8E6E1] rounded-md)

---

### TC-004: 断开 Gmail 账户测试

**前置条件:** 已连接 Gmail 账户

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot → 获取断开按钮 uid
click uid="<断开按钮uid>"
wait_for text=["确认"] 或 [账户消失]
take_snapshot
```

**预期结果:**
- 显示确认对话框
- 确认后账户从列表中移除
- 发送 DELETE 请求到对应 API

---

### TC-005: 添加另一个 Gmail 账户测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot → 获取添加按钮 uid
click uid="<添加另一个Gmail账户按钮uid>"
wait_for text=["Google"]
```

**预期结果:**
- 触发 Google OAuth 流程
- 跳转到授权页面
- ExternalLink 图标可见

---

### TC-006: 多 Gmail 账户显示测试

**前置条件:** 已连接多个 Gmail 账户

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
```

**预期结果:**
- 所有账户垂直排列 (space-y-4)
- 每个账户独立显示
- 每个账户有独立的断开按钮

---

### TC-007: 无 Gmail 账户空状态测试

**前置条件:** 没有连接 Gmail 账户

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
```

**预期结果:**
- 显示空状态提示
- 只显示 "添加另一个 Gmail 账户" 按钮
- 按钮可点击

---

### TC-008: 任务平台区域显示测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
```

**预期结果:**
- 显示 "任务平台" 区域
- 显示说明文字 "管理同步目标平台"
- 显示三个平台卡片（飞书、Notion、Todoist）

---

### TC-009: 已连接任务平台显示测试

**前置条件:** 已连接飞书

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
```

**预期结果:**
- 飞书卡片显示:
  - 平台名称 "飞书"
  - 工作区地址 (如 workspace.feishu.cn)
  - "已连接" 状态 (text-[#4A7C59] 带 Check 图标)
  - "断开" 按钮

---

### TC-010: 未连接任务平台显示测试

**前置条件:** Notion 和 Todoist 未连接

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
```

**预期结果:**
- Notion 和 Todoist 卡片显示:
  - 平台名称
  - 无邮箱信息
  - "未连接" 状态
  - "连接" 按钮 (bg-[#C15F3C] hover:bg-[#A64D2E] text-white)

---

### TC-011: 连接 Notion 测试

**前置条件:** Notion 未连接

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot → 获取 Notion 连接按钮 uid
click uid="<Notion连接按钮uid>"
wait_for text=["Notion"] 或 ["授权"]
```

**预期结果:**
- 触发 Notion OAuth 流程
- 或显示授权对话框
- 成功后状态变为 "已连接"

---

### TC-012: 连接 Todoist 测试

**前置条件:** Todoist 未连接

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
click uid="<Todoist连接按钮uid>"
wait_for text=["Todoist"] 或 ["授权"]
```

**预期结果:**
- 触发 Todoist OAuth 流程
- 成功后状态变为 "已连接"

---

### TC-013: 断开任务平台测试

**前置条件:** 已连接飞书

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
click uid="<飞书断开按钮uid>"
wait_for text=["确认"]
take_snapshot
```

**预期结果:**
- 显示确认对话框
- 确认后平台状态变为 "未连接"
- "断开" 按钮变为 "连接" 按钮

---

### TC-014: 同步设置区域显示测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
```

**预期结果:**
- 显示 "同步设置" 区域
- 显示说明文字 "配置自动同步行为"
- 包含三个设置项:
  - 自动同步新邮件 (开关)
  - 邮件通知 (开关)
  - 同步频率 (下拉框)

---

### TC-015: 自动同步开关关闭到开启测试

**前置条件:** 自动同步当前关闭

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot step="关闭状态"
click uid="<自动同步开关uid>"
take_snapshot step="开启状态"
```

**预期结果:**
- 关闭状态: bg-[#E8E6E1] 圆点在左侧
- 开启状态: bg-[#C15F3C] 圆点 translate-x-5
- 设置自动保存

---

### TC-016: 自动同步开关开启到关闭测试

**前置条件:** 自动同步当前开启

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot step="开启状态"
click uid="<自动同步开关uid>"
take_snapshot step="关闭状态"
```

**预期结果:**
- 开关状态切换为关闭
- 设置自动保存

---

### TC-017: 邮件通知开关测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
click uid="<邮件通知开关uid>"
take_snapshot
```

**预期结果:**
- 开关状态切换
- 设置自动保存
- 样式与自动同步开关相同

---

### TC-018: 同步频率下拉框展开测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
click uid="<同步频率下拉框uid>"
take_snapshot
```

**预期结果:**
- 下拉框展开
- 显示四个选项:
  - 每 15 分钟
  - 每 30 分钟
  - 每小时
  - 手动同步

---

### TC-019: 同步频率选择测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
click uid="<同步频率下拉框uid>"
click uid="<每30分钟选项uid>"
take_snapshot
```

**预期结果:**
- 下拉框值更新为 "每 30 分钟"
- 下拉框收起
- 设置自动保存

---

### TC-020: 同步频率所有选项测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
// 依次选择所有选项
click uid="<同步频率下拉框uid>"
click uid="<每15分钟选项uid>"
take_snapshot step="15分钟"

click uid="<同步频率下拉框uid>"
click uid="<每小时选项uid>"
take_snapshot step="每小时"

click uid="<同步频率下拉框uid>"
click uid="<手动同步选项uid>"
take_snapshot step="手动同步"
```

**预期结果:**
- 每个选项都可正常选择
- 选中值正确显示
- 设置保存

---

### TC-021: 安全设置区域显示测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
```

**预期结果:**
- 显示 "安全" 区域
- 显示 Shield 图标 (w-5 h-5 text-[#C15F3C])
- 显示说明文字 "管理账户安全设置"
- 包含两个按钮:
  - 修改密码
  - 登录历史

---

### TC-022: 修改密码按钮测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
click uid="<修改密码按钮uid>"
wait_for text=["密码"] 或 ["新密码"]
take_snapshot
```

**预期结果:**
- 显示修改密码对话框
- 或跳转到修改密码页面
- 包含密码输入字段

---

### TC-023: 登录历史按钮测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
click uid="<登录历史按钮uid>"
wait_for text=["登录记录"] 或 ["历史"]
take_snapshot
```

**预期结果:**
- 显示登录历史对话框
- 或跳转到登录历史页面
- 显示最近的登录记录

---

### TC-024: 危险区域显示测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
```

**预期结果:**
- 显示 "危险区域" section
- 边框颜色: border-[#B85450]/30
- 标题颜色: text-[#B85450]
- 显示警告: "以下操作不可撤销，请谨慎操作"
- 显示 "删除账户" 按钮 (红色边框和文字)

---

### TC-025: 删除账户按钮测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
click uid="<删除账户按钮uid>"
wait_for text=["确认删除"] 或 ["删除"]
take_snapshot
```

**预期结果:**
- 显示确认对话框
- 对话框包含警告信息
- 需要输入确认信息（如邮箱或密码）
- 有取消和确认按钮

---

### TC-026: 取消删除账户测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
click uid="<删除账户按钮uid>"
wait_for text=["确认删除"]
send_keys key="Escape"  // 或点击取消
take_snapshot
```

**预期结果:**
- 对话框关闭
- 账户未删除
- 用户留在设置页

---

### TC-027: 开关悬停效果测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
hover uid="<自动同步开关uid>"
take_screenshot filePath="e2e/screenshots/settings/toggle_hover.png"
```

**预期结果:**
- 开关可能有光标变化
- 过渡效果平滑

---

### TC-028: 按钮悬停效果测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
hover uid="<断开按钮uid>"
take_screenshot filePath="e2e/screenshots/settings/disconnect_hover.png"
hover uid="<连接按钮uid>"
take_screenshot filePath="e2e/screenshots/settings/connect_hover.png"
```

**预期结果:**
- 断开按钮: hover:bg-white transition-colors
- 连接按钮: hover:bg-[#A64D2E] (深橙色)

---

### TC-029: 删除账户按钮悬停效果测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
hover uid="<删除账户按钮uid>"
take_screenshot filePath="e2e/screenshots/settings/delete_account_hover.png"
```

**预期结果:**
- 背景变为 hover:bg-[#B85450]/10
- 文字和边框保持红色

---

### TC-030: 快速切换开关测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
click uid="<自动同步开关uid>"
click uid="<邮件通知开关uid>"
click uid="<自动同步开关uid>"
take_snapshot
```

**预期结果:**
- 所有开关状态正确更新
- 没有状态混乱
- 设置正确保存

---

### TC-031: 设置区域分隔线测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
```

**预期结果:**
- Gmail 账户区域有底部边框 border-b border-[#E8E6E1]
- 同步设置内部设置项之间有分隔线 border-t border-[#E8E6E1]
- 安全设置区域有底部边框 border-b border-[#E8E6E1]
- 危险区域有顶部边框 border-b border-[#B85450]/20

---

### TC-032: 设置图标显示测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
```

**预期结果:**
- Gmail 区域: Mail 图标 (w-5 h-5 text-[#C15F3C])
- 安全区域: Shield 图标 (w-5 h-5 text-[#C15F3C])
- 修改密码: ExternalLink 图标 (w-4 h-4)
- 登录历史: Bell 图标 (w-4 h-4)
- 删除账户: Trash2 图标 (w-4 h-4)

---

### TC-033: 上次同步时间格式测试

**前置条件:** 有已同步的 Gmail 账户

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
```

**预期结果:**
- 显示格式: "上次同步: X 分钟前" 或 "上次同步: X 小时前"
- 或显示绝对时间

---

### TC-034: 无同步时间显示测试

**前置条件:** 有从未同步过的 Gmail 账户

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
```

**预期结果:**
- 可能显示 "从未同步"
- 或不显示同步时间

---

### TC-035: 已连接状态标签测试

**前置条件:** 已连接账户

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
```

**预期结果:**
- Gmail 账户: "已连接" (text-[#4A7C59] 带 Check 图标)
- 任务平台: "已连接" (text-[#4A7C59] 带 Check 图标)
- Check 图标: w-4 h-4

---

### TC-036: 未连接状态测试

**前置条件:** 未连接任务平台

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
```

**预期结果:**
- 显示 "未连接" 文字
- 不显示 Check 图标
- 显示 "连接" 按钮

---

### TC-037: 连接按钮样式测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
```

**预期结果:**
- 基础样式: px-4 py-1.5 text-sm
- 背景: bg-[#C15F3C]
- 文字: text-white
- 圆角: rounded-md
- 悬停: hover:bg-[#A64D2E]
- 过渡: transition-colors

---

### TC-038: 断开按钮样式测试

**前置条件:** 已连接账户

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
```

**预期结果:**
- 基础样式: px-3 py-1.5 text-sm
- 边框: border border-[#E8E6E1]
- 背景: transparent
- 悬停: hover:bg-white
- 圆角: rounded-md

---

### TC-039: 下拉框样式测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
```

**预期结果:**
- 宽度: w-full
- 内边距: p-3
- 边框: border border-[#E8E6E1]
- 圆角: rounded-lg
- 背景: bg-white
- 文字: text-[#1A1918]
- 焦点: focus:ring-2 focus:ring-[#C15F3C] focus:border-transparent

---

### TC-040: 开关样式测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
```

**预期结果:**
- 容器: relative w-11 h-6 rounded-full
- 关闭状态: bg-[#E8E6E1]
- 开启状态: bg-[#C15F3C]
- 圆点: absolute top-1 left-1 w-4 h-4 bg-white rounded-full
- 圆点偏移: translate-x-5 (开启时)

---

### TC-041: 区域容器样式测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
```

**预期结果:**
- 基础: bg-white rounded-xl border border-[#E8E6E1]
- 溢出: overflow-hidden
- 最大宽度: max-w-2xl mx-auto

---

### TC-042: 区域标题样式测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
```

**预期结果:**
- 标题: text-lg font-semibold text-[#1A1918]
- 说明: text-sm text-[#6B6966]
- 内边距: p-6
- 底部边框区域: border-b border-[#E8E6E1]

---

### TC-043: 同步设置说明文字测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
```

**预期结果:**
- 自动同步: "检测到新邮件时自动分析并提取待办事项"
- 邮件通知: "发现新待办事项时发送邮件通知"

---

### TC-044: 工作区地址显示测试

**前置条件:** 已连接飞书且有 workspaceName

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
```

**预期结果:**
- 显示工作区地址 (如 workspace.feishu.cn)
- 样式: text-sm text-[#6B6966]

---

### TC-045: 无工作区地址显示测试

**前置条件:** 已连接任务平台但无工作区地址

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
```

**预期结果:**
- 可能显示 "已连接"
- 或不显示额外信息

---

### TC-046: 断开所有账户后状态测试

**前置条件:** 有已连接账户

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
// 依次断开所有账户
click uid="<Gmail断开按钮uid>"
send_keys key="Enter"
click uid="<飞书断开按钮uid>"
send_keys key="Enter"
take_snapshot
```

**预期结果:**
- Gmail 区域显示空状态
- 任务平台所有状态变为 "未连接"
- 添加/连接按钮仍可用

---

### TC-047: 设置保存后刷新测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
click uid="<自动同步开关uid>"  // 改变设置
navigate_page type="reload"
take_snapshot
```

**预期结果:**
- 刷新后设置状态保持
- 如果未实现持久化，可能重置为默认值

---

### TC-048: 快速连续点击开关测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
click uid="<自动同步开关uid>"
click uid="<自动同步开关uid>"
click uid="<自动同步开关uid>"
take_snapshot
```

**预期结果:**
- 最终状态正确
- 没有中间状态错误
- 设置保存最终值

---

### TC-049: 同步频率变更后立即刷新测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
click uid="<同步频率下拉框uid>"
click uid="<每小时选项uid>"
navigate_page type="reload"
take_snapshot
```

**预期结果:**
- 刷新后选择保持
- 或恢复为默认值（如果未持久化）

---

---

## 响应式测试

### TC-060: 移动端布局测试 (375x667)

**步骤:**
```
emulate viewport="375x667"
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_screenshot filePath="e2e/screenshots/settings/mobile_layout.png"
take_snapshot
```

**预期结果:**
- 内容区域垂直堆叠
- 开关和说明文字可能换行
- 所有功能可用
- 按钮大小适合触摸

---

### TC-061: 平板布局测试 (768x1024)

**步骤:**
```
emulate viewport="768x1024"
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_screenshot filePath="e2e/screenshots/settings/tablet_layout.png"
take_snapshot
```

**预期结果:**
- 布局适应中等屏幕
- 最大宽度 max-w-2xl 生效
- 内容居中

---

### TC-062: 桌面布局测试 (1920x1080)

**步骤:**
```
emulate viewport="1920x1080"
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_screenshot filePath="e2e/screenshots/settings/desktop_layout.png"
take_snapshot
```

**预期结果:**
- 内容居中 (max-w-2xl mx-auto)
- 布局美观
- 两侧留白合理

---

## 性能测试

### TC-070: 页面加载性能

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
lighthouse_audit mode="navigation"
```

**预期结果:**
- FCP < 1.8s
- LCP < 2.5s
- TTI < 3.8s

---

### TC-071: 开关切换响应性能

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
measure_time {
  click uid="<自动同步开关uid>"
}
```

**预期结果:**
- 开关切换响应时间 < 100ms
- 视觉更新流畅

---

## 错误处理测试

### TC-080: 断开账户失败测试

**前置条件:** 已连接账户

**步骤:**
```
// 模拟网络错误
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
click uid="<断开按钮uid>"
send_keys key="Enter"
list_console_messages types=["error"]
```

**预期结果:**
- 如果请求失败，显示错误提示
- 账户仍显示在列表中
- 用户可重试

---

### TC-081: 连接平台失败测试

**前置条件:** 平台未连接

**步骤:**
```
// 模拟 OAuth 失败
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
click uid="<连接按钮uid>"
wait_for text=["失败"] 或 ["错误"]
```

**预期结果:**
- 显示错误提示
- 状态保持为 "未连接"
- 用户可重试

---

### TC-082: 修改密码失败测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
click uid="<修改密码按钮uid>"
// 输入无效密码...
click uid="<确认按钮uid>"
wait_for text=["错误"]
```

**预期结果:**
- 显示密码错误提示
- 密码未修改
- 对话框保持打开

---

### TC-083: 删除账户失败测试

**步骤:**
```
// 模拟 API 失败
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
click uid="<删除账户按钮uid>"
// 确认删除...
wait_for text=["失败"]
```

**预期结果:**
- 显示错误提示
- 账户未删除
- 用户需重试

---

### TC-084: 网络离线测试

**步骤:**
```
emulate network="offline"
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
click uid="<自动同步开关uid>"
```

**预期结果:**
- 开关可能仍可切换
- 保存时显示错误
- 或提示网络不可用

---

## 可访问性测试

### TC-090: 键盘导航测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
send_keys key="Tab"  // 聚焦第一个开关
send_keys key="Enter"  // 切换开关
send_keys key="Tab"  // 聚焦下一个开关
send_keys key="Enter"  // 切换
send_keys key="Tab"  // 聚焦下拉框
send_keys key="Enter"  // 展开下拉框
```

**预期结果:**
- 所有交互元素可通过 Tab 访问
- Enter/Space 可激活开关和按钮
- 焦点指示器清晰可见

---

### TC-091: 屏幕阅读器测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
```

**预期结果:**
- 开关有明确的状态标签（开启/关闭）
- 按钮有明确的文本或 aria-label
- 区域标题清晰
- 下拉框有描述性标签

---

### TC-092: 焦点顺序测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
send_keys key="Tab"
send_keys key="Tab"
send_keys key="Tab"
send_keys key="Tab"
```

**预期结果:**
- 焦点顺序符合逻辑
- 从上到下，从左到右
- 跳过不可交互元素

---

### TC-093: 颜色对比度测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
check_color_contrast
```

**预期结果:**
- 所有文本符合 WCAG AA 标准
- 按钮文字对比度足够
- 状态标签清晰可读

---

### TC-094: 危险区域可访问性测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
```

**预期结果:**
- 删除账户按钮有明确的警告
- 可能使用 role="alert" 或类似
- 屏幕阅读器能识别危险操作

---

## 集成测试

### TC-100: 从 Dashboard 导航

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard"
take_snapshot
click uid="<设置链接uid>"
wait_for text=["设置"]
take_snapshot
```

**预期结果:**
- 成功导航到设置页
- URL 变为 /dashboard/settings

---

### TC-101: 未登录访问测试

**前置条件:** 清除所有 session

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
```

**预期结果:**
- 重定向到登录页或首页
- 显示登录提示

---

### TC-102: 设置变更跨页面同步测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
click uid="<自动同步开关uid>"  // 开启
navigate_page type="url" url="http://localhost:3003/dashboard"
take_snapshot
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
```

**预期结果:**
- 设置在页面间保持
- 返回设置页时状态一致

---

### TC-103: 断开账户后其他页面影响测试

**前置条件:** 已连接 Gmail 账户

**步骤:**
```
// 在设置页断开账户
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
click uid="<断开按钮uid>"
send_keys key="Enter"

// 验证其他页面
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_snapshot step="账户页"
navigate_page type="url" url="http://localhost:3003/dashboard"
take_snapshot step="Dashboard"
```

**预期结果:**
- 账户页账户消失
- Dashboard 显示无账户提示
- 历史页无法同步

---

### TC-104: 连接账户后其他页面影响测试

**前置条件:** 无连接账户

**步骤:**
```
// 在设置页添加账户
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
click uid="<添加Gmail按钮uid>"
// 完成 OAuth...

// 验证其他页面
navigate_page type="url" url="http://localhost:3003/dashboard/accounts"
take_snapshot step="账户页"
navigate_page type="url" url="http://localhost:3003/dashboard"
take_snapshot step="Dashboard"
```

**预期结果:**
- 账户页显示新账户
- Dashboard 显示账户信息
- 同步功能可用

---

### TC-105: 删除账户后登出测试

**前置条件:** 用户有多个账户

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
click uid="<删除账户按钮uid>"
// 完成确认...
wait_for url="/"
```

**预期结果:**
- 账户被删除
- Session 被清除
- 重定向到首页

---

### TC-106: 浏览器前进后退测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
click uid="<自动同步开关uid>"
take_snapshot step="开关后"
send_keys key="Back"
take_snapshot step="后退"
send_keys key="Forward"
take_snapshot step="前进"
```

**预期结果:**
- 后退/前进正确工作
- 页面状态正确恢复

---

## 边界条件测试

### TC-110: 超长邮箱地址测试

**前置条件:** 有超长邮箱的 Gmail 账户

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
```

**预期结果:**
- 邮箱地址可能被截断
- 布局不破坏
- 悬停显示完整地址

---

### TC-111: 特殊字符处理测试

**前置条件:** 工作区地址包含特殊字符

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
```

**预期结果:**
- 特殊字符正确显示
- HTML 实体被正确转义
- XSS 防护有效

---

### TC-112: 多次快速删除操作测试

**前置条件:** 有多个账户

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
click uid="<断开按钮uid1>"
// 不等待确认
click uid="<断开按钮uid2>"
```

**预期结果:**
- 可能显示多个确认对话框
- 或第一个对话框获得焦点
- 没有竞态条件

---

### TC-113: 所有开关同时开启测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
click uid="<自动同步开关uid>"
click uid="<邮件通知开关uid>"
take_snapshot
```

**预期结果:**
- 两个开关都开启
- 设置正确保存
- 没有冲突

---

### TC-114: 所有开关同时关闭测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
// 如果开关是开启的，关闭它们
click uid="<自动同步开关uid>"
click uid="<邮件通知开关uid>"
take_snapshot
```

**预期结果:**
- 两个开关都关闭
- 设置正确保存

---

### TC-115: 同步频率手动同步与其他设置测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
click uid="<同步频率下拉框uid>"
click uid="<手动同步选项uid>"
click uid="<自动同步开关uid>"  // 尝试开启
take_snapshot
```

**预期结果:**
- 自动同步开关可能被禁用
- 或显示提示 "手动同步模式下不可用"
- 或可以正常开启

---

### TC-116: 零账户状态测试

**前置条件:** 没有连接任何账户

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
```

**预期结果:**
- Gmail 区域显示空状态
- 所有任务平台显示 "未连接"
- 添加/连接按钮可用
- 同步设置可能受限

---

### TC-117: 刷新页面状态持久化测试

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
click uid="<自动同步开关uid>"
navigate_page type="reload"
take_snapshot
```

**预期结果:**
- 如果实现了持久化，设置保持
- 否则可能恢复默认值

---

## 全链路测试

### TC-120: 登录后访问设置页

**步骤:**
```
# 1. 登录
navigate_page type="url" url="http://localhost:3003"
click uid="<登录按钮>"
# 完成 OAuth...
wait_for url="/dashboard"

# 2. 访问设置页
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
```

**预期结果:**
- 登录成功后重定向到 Dashboard
- 导航到设置页成功
- 显示用户的账户信息

---

### TC-121: 完整修改密码流程

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot step="1-设置页"
click uid="<修改密码按钮uid>"
wait_for text=["新密码"]
take_snapshot step="2-修改对话框"
# 输入旧密码和新密码...
click uid="<确认按钮uid>"
wait_for text=["成功"]
take_snapshot step="3-成功提示"
```

**预期结果:**
- 显示修改密码对话框
- 输入有效密码后修改成功
- 显示成功提示
- 密码已更新

---

### TC-122: 完整断开账户流程

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot step="1-断开前"
click uid="<断开按钮uid>"
wait_for text=["确认"]
take_snapshot step="2-确认对话框"
send_keys key="Enter"
wait_for absence="<被断开账户>"
take_snapshot step="3-断开后"
```

**预期结果:**
- 断开前账户存在
- 显示确认对话框
- 确认后账户消失
- 显示空状态

---

### TC-123: 完整连接平台流程

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot step="1-连接前"
click uid="<Notion连接按钮uid>"
# 完成 OAuth...
wait_for url="/dashboard/settings"
take_snapshot step="2-连接后"
```

**预期结果:**
- 连接前显示 "未连接"
- 触发 OAuth 流程
- 连接后显示 "已连接"
- 显示平台信息

---

### TC-124: 完整删除账户流程

**步骤:**
```
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot step="1-删除前"
click uid="<删除账户按钮uid>"
wait_for text=["确认删除"]
take_snapshot step="2-确认对话框"
# 输入确认信息...
click uid="<确认删除按钮uid>"
wait_for url="/"
take_snapshot step="3-已删除"
```

**预期结果:**
- 删除前账户存在
- 显示确认对话框
- 需要输入确认信息
- 确认后删除账户
- Session 被清除
- 重定向到首页

---

### TC-125: 设置变更后功能影响测试

**步骤:**
```
# 1. 开启自动同步
navigate_page type="url" url="http://localhost:3003/dashboard/settings"
take_snapshot
click uid="<自动同步开关uid>"

# 2. 去验证功能
navigate_page type="url" url="http://localhost:3003/dashboard"
take_snapshot step="Dashboard"
# 检查自动同步是否生效...
```

**预期结果:**
- 设置变更保存
- 功能行为相应改变
- Dashboard 反映新设置

---

## 测试用例汇总

| ID | 用例名称 | 优先级 | 类型 |
|----|---------|--------|------|
| TC-001 | 页面加载 | P0 | 基础 |
| TC-002 | Gmail 区域显示 | P1 | UI |
| TC-003 | Gmail 账户信息显示 | P1 | UI |
| TC-004 | 断开 Gmail | P1 | 功能 |
| TC-005 | 添加另一个 Gmail | P1 | 功能 |
| TC-006 | 多 Gmail 账户显示 | P2 | UI |
| TC-007 | Gmail 空状态 | P1 | UI |
| TC-008 | 任务平台区域显示 | P1 | UI |
| TC-009 | 已连接任务平台显示 | P1 | UI |
| TC-010 | 未连接任务平台显示 | P1 | UI |
| TC-011 | 连接 Notion | P1 | 功能 |
| TC-012 | 连接 Todoist | P1 | 功能 |
| TC-013 | 断开任务平台 | P1 | 功能 |
| TC-014 | 同步设置区域显示 | P1 | UI |
| TC-015 | 自动同步关到开 | P1 | 功能 |
| TC-016 | 自动同步开到关 | P1 | 功能 |
| TC-017 | 邮件通知开关 | P1 | 功能 |
| TC-018 | 同步频率下拉框展开 | P1 | 功能 |
| TC-019 | 同步频率选择 | P1 | 功能 |
| TC-020 | 同步频率所有选项 | P2 | 功能 |
| TC-021 | 安全设置区域显示 | P1 | UI |
| TC-022 | 修改密码按钮 | P1 | 功能 |
| TC-023 | 登录历史按钮 | P1 | 功能 |
| TC-024 | 危险区域显示 | P1 | UI |
| TC-025 | 删除账户按钮 | P1 | 危险 |
| TC-026 | 取消删除账户 | P1 | 危险 |
| TC-027 | 开关悬停效果 | P2 | UI |
| TC-028 | 按钮悬停效果 | P2 | UI |
| TC-029 | 删除按钮悬停 | P2 | UI |
| TC-030 | 快速切换开关 | P2 | 交互 |
| TC-031 | 区域分隔线 | P2 | UI |
| TC-032 | 设置图标显示 | P2 | UI |
| TC-033 | 上次同步时间格式 | P2 | UI |
| TC-034 | 无同步时间显示 | P2 | 边界 |
| TC-035 | 已连接状态标签 | P2 | UI |
| TC-036 | 未连接状态 | P2 | UI |
| TC-037 | 连接按钮样式 | P2 | UI |
| TC-038 | 断开按钮样式 | P2 | UI |
| TC-039 | 下拉框样式 | P2 | UI |
| TC-040 | 开关样式 | P2 | UI |
| TC-041 | 区域容器样式 | P2 | UI |
| TC-042 | 区域标题样式 | P2 | UI |
| TC-043 | 同步设置说明文字 | P2 | UI |
| TC-044 | 工作区地址显示 | P2 | UI |
| TC-045 | 无工作区地址显示 | P2 | 边界 |
| TC-046 | 断开所有账户 | P2 | 功能 |
| TC-047 | 设置保存后刷新 | P2 | 功能 |
| TC-048 | 快速连续点击开关 | P2 | 边界 |
| TC-049 | 同步频率变更刷新 | P2 | 功能 |
| TC-060 | 移动端布局 | P2 | 响应式 |
| TC-061 | 平板布局 | P2 | 响应式 |
| TC-062 | 桌面布局 | P2 | 响应式 |
| TC-070 | 加载性能 | P2 | 性能 |
| TC-071 | 开关切换性能 | P2 | 性能 |
| TC-080 | 断开账户失败 | P1 | 错误处理 |
| TC-081 | 连接平台失败 | P1 | 错误处理 |
| TC-082 | 修改密码失败 | P1 | 错误处理 |
| TC-083 | 删除账户失败 | P1 | 错误处理 |
| TC-084 | 网络离线 | P1 | 错误处理 |
| TC-090 | 键盘导航 | P1 | 可访问性 |
| TC-091 | 屏幕阅读器 | P2 | 可访问性 |
| TC-092 | 焦点顺序 | P2 | 可访问性 |
| TC-093 | 颜色对比度 | P2 | 可访问性 |
| TC-094 | 危险区域可访问性 | P1 | 可访问性 |
| TC-100 | 从 Dashboard 导航 | P1 | 集成 |
| TC-101 | 未登录访问 | P0 | 认证 |
| TC-102 | 设置跨页面同步 | P1 | 集成 |
| TC-103 | 断开后影响 | P1 | 集成 |
| TC-104 | 连接后影响 | P1 | 集成 |
| TC-105 | 删除后登出 | P0 | 集成 |
| TC-106 | 浏览器前进后退 | P2 | 集成 |
| TC-110 | 超长邮箱 | P2 | 边界 |
| TC-111 | 特殊字符处理 | P2 | 边界 |
| TC-112 | 多次快速删除 | P2 | 边界 |
| TC-113 | 所有开关开启 | P2 | 边界 |
| TC-114 | 所有开关关闭 | P2 | 边界 |
| TC-115 | 手动同步模式 | P2 | 边界 |
| TC-116 | 零账户状态 | P2 | 边界 |
| TC-117 | 刷新状态持久化 | P2 | 功能 |
| TC-120 | 登录后访问设置 | P0 | 全链路 |
| TC-121 | 完整修改密码流程 | P0 | 全链路 |
| TC-122 | 完整断开账户流程 | P0 | 全链路 |
| TC-123 | 完整连接平台流程 | P0 | 全链路 |
| TC-124 | 完整删除账户流程 | P0 | 全链路 |
| TC-125 | 设置变更后功能影响 | P1 | 全链路 |

**总计: 95 个测试用例**

---

## 附加说明

### API 端点依赖

- `GET /api/gmail/accounts` - 获取 Gmail 账户列表
- `DELETE /api/gmail/accounts?id={accountId}` - 删除 Gmail 账户
- `GET /api/task-accounts` - 获取任务账户列表
- `DELETE /api/task-accounts?id={accountId}` - 删除任务账户
- `PUT /api/user/settings` - 更新用户设置（如果实现）
- `DELETE /api/user/account` - 删除用户账户
- `POST /api/user/change-password` - 修改密码

### 相关文件

- 页面组件: `app/dashboard/settings/page.tsx`
- Page Object: `e2e/pages/settings.page.ts`
- 测试文件: `e2e/tests/settings.spec.ts`

### 测试数据准备建议

1. **账户测试:**
   - 准备测试用 Gmail 账户
   - 准备测试用任务平台账户
   - 测试多账户场景

2. **设置测试:**
   - 测试不同开关组合
   - 测试所有同步频率选项

3. **危险操作:**
   - 准备可删除的测试账户
   - 或使用 Mock 跳过实际删除

### 全链路测试说明

全链路测试需要：
1. 先完成登录
2. 执行设置页面操作
3. 验证跨页面影响
4. 可能需要清理测试数据

### 注意事项

1. **删除账户操作**: 这是不可逆的危险操作，测试时需要:
   - 使用专门的测试账户
   - 或 Mock API 响应
   - 避免在真实数据上执行

2. **OAuth 流程**: 连接平台需要 OAuth:
   - 可以使用测试应用
   - 或 Mock OAuth 回调

3. **设置持久化**: 需要验证设置是否保存到数据库
   - 刷新页面后状态保持
   - 跨设备同步（如果实现）
