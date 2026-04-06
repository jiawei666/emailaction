# 登录页 (/auth/signin) E2E 测试用例

## 页面概述
登录页提供 Google 和 GitHub OAuth 认证方式，包含安全说明和返回首页链接。

---

## TC-SIGN-001: 页面基本加载验证
**优先级**: P0 (高)

**步骤:**
```
navigate_page type="url" url="http://localhost:3002/auth/signin"
take_snapshot
```

**预期结果:**
- 页面成功加载，无 JS 错误
- 页面背景色为 `#F4F3EE`
- 居中显示登录卡片

---

## TC-SIGN-002: Logo 和标题显示
**优先级**: P0 (高)

**步��:**
```
navigate_page type="url" url="http://localhost:3002/auth/signin"
take_snapshot
```

**预期结果:**
- 显示 EmailAction logo（橙色方形背景 #C15F3C，白色邮件图标）
- 显示标题 "欢迎使用 EmailAction"
- 显示副标题 "连接您的 Gmail 账户开始使用"

---

## TC-SIGN-003: Google 登录按钮显示
**优先级**: P0 (高)

**步骤:**
```
navigate_page type="url" url="http://localhost:3002/auth/signin"
take_snapshot
```

**预期结果:**
- 显示白色背景的登录按钮
- 显示 Google 彩色图标
- 显示文字 "使用 Google 继续"
- 按钮可点击（非禁用状态）

**交互元素:**
| UID 类型 | 描述 | 选择器 |
|----------|------|--------|
| button | Google 登录按钮 | text=使用 Google 继续 |

---

## TC-SIGN-004: GitHub 登录按钮显示
**优先级**: P0 (高)

**步骤:**
```
navigate_page type="url" url="http://localhost:3002/auth/signin"
take_snapshot
```

**预期结果:**
- 显示深色背景 (#1A1918) 的登录按钮
- 显示 GitHub 黑色图标
- 显示文字 "使用 GitHub 继续"
- 按钮可点击（非禁用状态）

**交互元素:**
| UID 类型 | 描述 | 选择器 |
|----------|------|--------|
| button | GitHub 登录按钮 | text=使用 GitHub 继续 |

---

## TC-SIGN-005: 分隔线显示
**优先级**: P1 (中)

**步骤:**
```
navigate_page type="url" url="http://localhost:3002/auth/signin"
take_snapshot
```

**预期结果:**
- Google 和 GitHub 按钮之间显示水平分隔线
- 分隔线中央显示 "或" 文字
- 第二个分隔线中央显示 "安全加密" 文字

---

## TC-SIGN-006: 安全说明显示
**优先级**: P1 (中)

**步骤:**
```
navigate_page type="url" url="http://localhost:3002/auth/signin"
take_snapshot
```

**预期结果:**
- 显示绿色勾选图标
- 显示安全说明文字:
  - "您的数据安全存储，我们不会读取您的邮件内容"
  - "仅使用 Gmail 只读权限访问您的邮件"

---

## TC-SIGN-007: 返回首页链接
**优先级**: P1 (中)

**步骤:**
```
navigate_page type="url" url="http://localhost:3002/auth/signin"
take_snapshot
```

**预期结果:**
- 页面底部显示 "← 返回首页" 链接
- 链接指向 "/"

**交互元素:**
| UID 类型 | 描述 | 选择器 |
|----------|------|--------|
| link | 返回首页 | text=返回首页 |

---

## TC-SIGN-008: Google 登录按钮点击（模拟）
**优先级**: P0 (高)

**前置条件**: 需要配置有效的 Google OAuth 凭据

**步骤:**
```
navigate_page type="url" url="http://localhost:3002/auth/signin"
take_snapshot
click uid="Google登录按钮"
```

**预期结果:**
- 按钮显示加载状态（旋转动画）
- 跳转到 Google OAuth 授权页面

---

## TC-SIGN-009: GitHub 登录按钮点击（模拟）
**优先级**: P0 (高)

**前置条件**: 需要配置有效的 GitHub OAuth 凭据

**步骤:**
```
navigate_page type="url" url="http://localhost:3002/auth/signin"
take_snapshot
click uid="GitHub登录按钮"
```

**预期结果:**
- 按钮显示加载状态（旋转动画）
- 跳转到 GitHub OAuth 授权页面

---

## TC-SIGN-010: 按钮禁用状态
**优先级**: P1 (中)

**步骤:**
```
navigate_page type="url" url="http://localhost:3002/auth/signin"
take_snapshot
evaluate_script function="() => { const btn = document.querySelector('button'); btn.disabled = true; return true; }"
take_snapshot
```

**预期结果:**
- 禁用状态下按钮 opacity 为 50%
- 禁用状态下鼠标指针为 not-allowed
- 按钮无法点击

---

## TC-SIGN-011: 加载状态显示
**优先级**: P1 (中)

**步骤:**
```
navigate_page type="url" url="http://localhost:3002/auth/signin"
take_snapshot
# 模拟点击后的加载状态
evaluate_script function="() => { window.__isLoading = true; }"
take_snapshot
```

**预期结果:**
- 加载时显示旋转动画
- 动画为圆形边框，顶部透明
- Google 按钮加载时动画为橙色 (#C15F3C)
- GitHub 按钮加载时动画为白色

---

## TC-SIGN-012: 返回首页链接功能
**优先级**: P0 (高)

**步骤:**
```
navigate_page type="url" url="http://localhost:3002/auth/signin"
take_snapshot
click uid="返回首页链接"
wait_for text="邮件中的待办"
```

**预期结果:**
- 点击后跳转到首页 (/)
- 显示首页 Hero 内容

---

## TC-SIGN-013: 已登录用户重定向
**优先级**: P0 (高)

**前置条件**: 用户已登录

**步骤:**
```
navigate_page type="url" url="http://localhost:3002/auth/signin"
# 模拟已登录状态
evaluate_script function="() => { localStorage.setItem('next-auth.session-token', 'mock_token'); }"
navigate_page type="url" url="http://localhost:3002/auth/signin"
```

**预期结果:**
- 已登录用户自动重定向到 `/dashboard`
- 不显示登录表单

---

## TC-SIGN-014: 响应式布局 - 移动端视图
**优先级**: P1 (中)

**步骤:**
```
navigate_page type="url" url="http://localhost:3002/auth/signin"
emulate viewport="375x828x1,mobile,touch"
take_snapshot
```

**预期结果:**
- 登录卡片在移动端正确显示
- 左右 padding 适配移动端 (p-6)
- Logo、标题和按钮垂直排列
- 无水平滚动条

---

## TC-SIGN-015: 键盘导航
**优先级**: P1 (中)

**步骤:**
```
navigate_page type="url" url="http://localhost:3002/auth/signin"
press key="Tab"
take_snapshot
press key="Tab"
take_snapshot
```

**预期结果:**
- Tab 键可以依次聚焦到:
  1. Google 登录按钮
  2. GitHub 登录按钮
  3. 返回首页链接
- 聚焦元素有明显的焦点样式

---

## TC-SIGN-016: 按钮悬停效果
**优先级**: P2 (低)

**步骤:**
```
navigate_page type="url" url="http://localhost:3002/auth/signin"
hover uid="Google登录按钮"
take_snapshot
hover uid="GitHub登录按钮"
take_snapshot
```

**预期结果:**
- Google 按钮悬停时:
  - 边框颜色变为 #B1ADA1
  - 背景色变为 #F4F3EE
- GitHub 按钮悬停时:
  - 背景色变深 (#2D2A26)

---

## TC-SIGN-017: 错误状态显示
**优先级**: P1 (中)

**前置条件**: 登录失败场景

**步骤:**
```
navigate_page type="url" url="http://localhost:3002/auth/signin"
# 模拟登录失败
evaluate_script function="() => { window.__loginError = '登录失败，请重试'; }"
take_snapshot
```

**预期结果:**
- 显示错误提示框
- 背景色为浅红色 (#FEE2E2)
- 文字颜色为深红色 (#B85450)
- 显示错误消息 "登录失败，请重试"

---

## TC-SIGN-018: 可访问性检查
**优先级**: P1 (中)

**步骤:**
```
navigate_page type="url" url="http://localhost:3002/auth/signin"
lighthouse_audit device="desktop" mode="navigation"
```

**预期结果:**
- 无障碍评分 >= 90
- 按钮有正确的 aria-label
- 错误信息可被屏幕阅读器识别
- 颜色对比度符合 WCAG 标准

---

## 元素定位器参考

| 元素描述 | 选择器类型 | 定位器 |
|----------|------------|--------|
| EmailAction Logo | alt text | EmailAction |
| 页面标题 | text | 欢迎使用 EmailAction |
| 副标题 | text | 连接您的 Gmail 账户开始使用 |
| Google 登录按钮 | text | 使用 Google 继续 |
| GitHub 登录按钮 | text | 使用 GitHub 继续 |
| 返回首页链接 | text | 返回首页 |
| 登录卡片 | class | bg-white rounded-2xl |
| 错误提示 | class | bg-[#FEE2E2] text-[#B85450] |
