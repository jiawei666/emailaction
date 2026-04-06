# 首页 (/) E2E 测试用例

## 页面概述
首页是 EmailAction 的营销落地页，包含产品介绍、功能展示和用户引导。

---

## TC-001: 页面基本加载验证
**优先级**: P0 (高)

**步骤:**
```
navigate_page type="url" url="http://localhost:3002"
take_snapshot
```

**预期结果:**
- 页面成功加载，无 JS 错误
- 页面标题显示 "EmailAction"
- 背景色为 `#F4F3EE`
- Header 固定在顶部

---

## TC-002: Header 导航验证
**优先级**: P0 (高)

**步骤:**
```
navigate_page type="url" url="http://localhost:3002"
take_snapshot
```

**预期结果:**
- Header 显示 EmailAction logo（邮件图标 + 文字）
- Header 显示两个导航链接:
  - "登录" 链接指向 `/api/auth/signin`
  - "免费开始" 按钮指向 `/api/auth/signin`

**交互元素:**
| UID 类型 | 描述 | 操作 |
|----------|------|------|
| link | "登录" 文本链接 | 点击跳转到登录页 |
| link | "免费开始" 按钮 | 点击跳转到登录页 |

---

## TC-003: Hero 区域内容验证
**优先级**: P0 (高)

**步骤:**
```
navigate_page type="url" url="http://localhost:3002"
take_snapshot
```

**预期结果:**
- 显示标签 "AI 驱动的邮件效率工具"
- 显示主标题 "邮件中的待办 自动进入任务列表"
- 显示描述文字 "不再遗漏邮件里的重要事项..."
- 显示两个 CTA 按钮:
  - "开始使���" 主按钮（橙色 #C15F3C）
  - "了解工作原理" 次要链接
- 显示社交证明 "已有 2,000+ 用户"

---

## TC-004: Hero CTA 按钮交互
**优先级**: P0 (高)

**步骤:**
```
navigate_page type="url" url="http://localhost:3002"
take_snapshot
click uid="开始使用按钮"
wait_for text="欢迎"
```

**预期结果:**
- 点击 "开始使用" 按钮后跳转到登录页面
- 页面显示 "欢迎使用 EmailAction" 标题

---

## TC-005: "了解工作原理" 锚点跳转
**优先级**: P1 (中)

**步骤:**
```
navigate_page type="url" url="http://localhost:3002"
take_snapshot
click uid="了解工作原理链接"
```

**预期结果:**
- 页面滚动到 "三个步骤，告别遗漏" 区域
- URL hash 变为 `#how-it-works`

---

## TC-006: 工作原理三步骤展示
**优先级**: P1 (中)

**步骤:**
```
navigate_page type="url" url="http://localhost:3002#how-it-works"
take_snapshot
```

**预期结果:**
- 显示三个步骤卡片:
  1. "01 连接账户" - "授权 Gmail 和任务平台，安全加密存储"
  2. "02 AI 识别" - "智能分析邮件，提取待办事项和截止日期"
  3. "03 一键同步" - "确认后自动创建任务，保持一切井然有序"

---

## TC-007: 支持平台展示
**优先级**: P2 (低)

**步骤:**
```
navigate_page type="url" url="http://localhost:3002"
take_snapshot
```

**预期结果:**
- 显示 "支持的任务平台" 标题
- 显示三个平台名称: 飞书、Notion、Todoist

---

## TC-008: 底部 CTA 区域
**优先级**: P0 (高)

**步骤:**
```
navigate_page type="url" url="http://localhost:3002"
take_snapshot
```

**预期结果:**
- 显示深色背景 (#1A1918) CTA 区域
- 显示标题 "准备好了吗？"
- 显示描述 "免费开始使用，无需信用卡"
- 显示 "立即开始" 按钮（橙色）

---

## TC-009: 底部 CTA 按钮交互
**优先级**: P0 (高)

**步骤:**
```
navigate_page type="url" url="http://localhost:3002"
take_snapshot
click uid="立即开始按钮"
wait_for text="欢迎"
```

**预期结果:**
- 点击 "立即开始" 按钮后跳转到登录页面
- 页面显示登录表单

---

## TC-010: Footer 信息验证
**优先级**: P2 (低)

**步骤:**
```
navigate_page type="url" url="http://localhost:3002"
take_snapshot
```

**预期结果:**
- Footer 显示 EmailAction logo
- 显示版权信息 "© 2025 EmailAction"
- Footer 与主内容有边框分隔

---

## TC-011: 响应式布局 - 移动端视图
**优先级**: P1 (中)

**步骤:**
```
navigate_page type="url" url="http://localhost:3002"
emulate viewport="375x828x1,mobile,touch"
take_snapshot
```

**预期结果:**
- Header 在移动端正确显示
- Hero 区域变为单列布局
- 右侧视觉卡片隐藏 (hidden lg:block)
- 三个步骤卡片垂直堆叠
- 按钮和文字大小适配移动端

---

## TC-012: 悬停效果验证
**优先级**: P2 (低)

**步骤:**
```
navigate_page type="url" url="http://localhost:3002"
hover uid="开始使用按钮"
take_snapshot
hover uid="登录链接"
take_snapshot
```

**预期结果:**
- "开始使用" 按钮悬停时:
  - 背景色变深 (#A64D2E)
  - 显示阴影效果
  - 箭头图标向右移动
- "登录" 链接悬停时文字颜色变深

---

## TC-013: 页面可访问性检查
**优先级**: P1 (中)

**步骤:**
```
navigate_page type="url" url="http://localhost:3002"
lighthouse_audit device="desktop" mode="navigation"
```

**预期结果:**
- 无障碍评分 >= 90
- 所有链接有可访问的名称
- 颜色对比度符合 WCAG 标准
- 键盘导航可正常使用

---

## TC-014: SEO 元素验证
**优先级**: P2 (低)

**步骤:**
```
navigate_page type="url" url="http://localhost:3002"
evaluate_script function="() => { return { title: document.title, metaDescription: document.querySelector('meta[name=\"description\"]')?.content, lang: document.documentElement.lang } }"
```

**预期结果:**
- 页面包含描述性的 title
- 包含 meta description
- html lang 属性正确设置

---

## 元素定位器参考

| 元素描述 | 选择器类型 | 定位器 |
|----------|------------|--------|
| EmailAction Logo | text | EmailAction |
| 登录链接 | link text | 登录 |
| 免费开始按钮 | link text | 免费开始 |
| 开始使用按钮 | link text | 开始使用 |
| 了解工作原理 | link text | 了解工作原理 |
| 立即开始按钮 | link text | 立即开始 |
| Google 登录按钮 | text | 使用 Google 继续 |
| GitHub 登录按钮 | text | 使用 GitHub 继续 |
