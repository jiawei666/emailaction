---
name: generate-e2e-test
description: 使用 Chrome DevTools MCP 探索页面并生成 E2E 测试用例文档。当用户提到"生成测试用例"、"E2E测试"、"添加测试"、"测试覆盖率"、"测试某个页面"时触发此 skill��生成的测试用例使用 Chrome DevTools MCP 工具执行。
---

# E2E 测试用例生成器

使用 Chrome DevTools MCP 探索页面，生成可执行的 E2E 测试用例文档。

## 工作流程

### 第一步：探索页面

使用以下 MCP 工具探索目标页面：

```
1. navigate_page → 导航到目标页面
2. take_snapshot → 获取页面元素树，识别所有交互元素
3. list_console_messages → 检查控制台错误
4. list_network_requests → 检查网络请求状态
```

### 第二步：分析元素

从快照中提取测试目标：

| 元素类型 | 测试场景 |
|---------|---------|
| button | 点击响应、状态变化 |
| link | 导航目标、URL 变化 |
| textbox | 输入验证、边界值 |
| checkbox | 选中/取消选中 |
| combobox | 选项切换 |
| form | 提交验证、错误处理 |

### 第三步：生成测试用例

将测试用例保存到 `e2e/test-cases/{page-name}.md`

## 测试用例文档格式

```markdown
# {页面名称} E2E 测试用例

> 生成时间: {时间戳}
> 页面URL: {URL}

## 测试前准备

1. 确保开发服务器运行: `npm run dev`
2. 打开 Chrome DevTools MCP 连接

## 测试用例

### TC-001: 页面加载测试

**步骤:**
```
navigate_page type="url" url="{页面URL}"
take_snapshot
list_console_messages types=["error"]
```

**预期结果:**
- 页面正常加载，无 404 错误
- 控制台无 error 级别日志
- 页面标题包含 "{预期标题}"

---

### TC-002: {元素}点击测试

**前置条件:** 已完成 TC-001

**步骤:**
```
take_snapshot → 获取元素 uid
click uid="{元素uid}"
wait_for text=["{预期文本}"]
```

**预期结果:**
- 点击成功，无报错
- 页面跳转到 {预期URL} / 显示 {预期内容}

---

### TC-003: 表单验证测试

**步骤:**
```
fill uid="{输入框uid}" value=""  // 空值
click uid="{提交按钮uid}"
take_snapshot
```

**预期结果:**
- 显示必填字段错误提示
- 表单不提交

**步骤 (有效输入):**
```
fill uid="{输入框uid}" value="{有效值}"
click uid="{提交按钮uid}"
wait_for text=["{成功提示}"]
```

**预期结果:**
- 表单提交成功
- 显示成功提示

---

## 响应式测试

### TC-010: 移动端布局测试

**步骤:**
```
emulate viewport="375x667"
take_screenshot filePath="screenshots/{page}_mobile.png"
take_snapshot
```

**预期结果:**
- 关键元素可见
- 布局无重叠/溢出

---

## 性能测试

### TC-020: Lighthouse 检查

**步骤:**
```
lighthouse_audit mode="navigation"
```

**预期结果:**
- Accessibility >= 80
- Best Practices >= 90
- SEO >= 90
```

## 执行命令模板

### 运行单个测试
```
navigate_page type="url" url="http://localhost:3000/xxx"
take_snapshot
click uid="xxx"
wait_for text=["xxx"]
```

### 运行完整测试套件
```
对每个测试用例:
1. 执行步骤命令
2. 验证预期结果
3. 记录通过/失败状态
4. 截图保存证据
```

## 输出报告格式

测试完成后生成报告：

```markdown
# E2E 测试报告

## 测试概览
- 测试页面: {页面名称}
- 测试时间: {时间}
- 总用例: {总数}
- 通过: {通过数}
- 失败: {失败数}

## 详细结果

| 用例ID | 用例名称 | 状态 | 备注 |
|--------|---------|------|------|
| TC-001 | 页面加载 | ✅ | |
| TC-002 | 按钮点击 | ❌ | 点击无响应 |

## 失败用例详情

### TC-002 失败原因
- 预期: 跳转到 /dashboard
- 实际: 停留在当前页面
- 截图: screenshots/tc-002-failure.png
```

## 使用示例

```
用户: 帮我给 settings 页面生成 E2E 测试用例

执行流程:
1. navigate_page → http://localhost:3000/dashboard/settings
2. take_snapshot → 分析页面元素
3. 识别: 3个开关、2个按钮、1个下拉框
4. 生成: e2e/test-cases/settings.md
5. 包含: 10个测试用例（加载、交互、表单、响应式）
```

## 文件结构

```
e2e/
├── test-cases/
│   ├── home.md
│   ├── signin.md
│   ├── dashboard.md
│   ├── pending.md
│   ├── history.md
│   ├── settings.md
│   └── accounts.md
├── screenshots/
│   ├── home_mobile.png
│   ├── home_desktop.png
│   └── ...
└── reports/
    └── {date}-test-report.md
```
