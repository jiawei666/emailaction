# 认证流程 E2E 测试用例

## 流程概述
认证流程包括：未登录访问 → 登录页 → OAuth 授权 → 登录成功 → Dashboard 重定向

---

## TC-AUTH-001: 完整的 Google 登录流程
**优先级**: P0 (高)

**前置条件:**
- 配置有效的 Google OAuth 凭据
- 用户未登录

**步骤:**
```
# 清除现有会话
clear_cookies
navigate_page type="url" url="http://localhost:3002"
take_snapshot step="1-首页访问"

# 从首页点击登录
click uid="登录链接"
wait_for url="/auth/signin"
take_snapshot step="2-登录页"

# 点击 Google 登录
click uid="Google登录按钮"
wait_for url="accounts.google.com"
take_snapshot step="3-Google授权页"

# 完成授权后跳转
wait_for url="/dashboard"
take_snapshot step="4-登录成功"
```

**预期结果:**
- 首页成功加载
- 点击登录跳转到 /auth/signin
- 点击 Google 登录跳转到 Google 授权页
- 授权成功后重定向到 /dashboard
- Dashboard 显示用户信息

---

## TC-AUTH-002: 完整的 GitHub 登录流程
**优先级**: P0 (高)

**前置条件:**
- 配置有效的 GitHub OAuth 凭据
- 用户未登录

**步骤:**
```
# 清除现有会话
clear_cookies
navigate_page type="url" url="http://localhost:3002"
take_snapshot step="1-首页访问"

# 从首页点击免费开始
click uid="免费开始按钮"
wait_for url="/auth/signin"
take_snapshot step="2-登录页"

# 点击 GitHub 登录
click uid="GitHub登录按钮"
wait_for url="github.com/login/oauth"
take_snapshot step="3-GitHub授权页"

# 完成授权后跳转
wait_for url="/dashboard"
take_snapshot step="4-登录成功"
```

**预期结果:**
- 首页成功加载
- 点击免费开始跳转到 /auth/signin
- 点击 GitHub 登录跳转到 GitHub 授权页
- 授权成功后重定向到 /dashboard
- Dashboard 显示用户信息

---

## TC-AUTH-003: 从首页 CTA 开始登录流程
**优先级**: P0 (高)

**步骤:**
```
clear_cookies
navigate_page type="url" url="http://localhost:3002"
take_snapshot

# 点击 Hero 区域的"开始使用"按钮
click uid="开始使用按钮"
wait_for url="/auth/signin"
take_snapshot
```

**预期结果:**
- 跳转到登录页面
- URL 为 /auth/signin

---

## TC-AUTH-004: 从底部 CTA 开始登录流程
**优先级**: P0 (高)

**步骤:**
```
clear_cookies
navigate_page type="url" url="http://localhost:3002"
# 滚动到底部 CTA
scroll_to element="#bottom-cta"
take_snapshot

click uid="立即开始按钮"
wait_for url="/auth/signin"
take_snapshot
```

**预期结果:**
- 跳转到登录页面
- URL 为 /auth/signin

---

## TC-AUTH-005: 已登录用户访问登录页自动重定向
**优先级**: P0 (高)

**前置条件:** 用户已登录

**步骤:**
```
# 模拟已登录状态
set_cookie name="next-auth.session-token" value="valid_token"
navigate_page type="url" url="http://localhost:3002/auth/signin"
take_snapshot
```

**预期结果:**
- 自动重定向到 /dashboard
- 不显示登录表单

---

## TC-AUTH-006: 已登录用户访问首页保持状态
**优先级**: P1 (中)

**前置条件:** 用户已登录

**步骤:**
```
set_cookie name="next-auth.session-token" value="valid_token"
navigate_page type="url" url="http://localhost:3002"
take_snapshot
```

**预期结果:**
- 首页正常显示
- Header 导航可能变化（显示用户信息/登出）

---

## TC-AUTH-007: 登录失败错误处理
**优先级**: P1 (中)

**步骤:**
```
clear_cookies
navigate_page type="url" url="http://localhost:3002/auth/signin"
take_snapshot

# 模拟网络错误或授权拒绝
mock_oauth_response status="error"
click uid="Google登录按钮"
wait_for duration="2000"
take_snapshot
```

**预期结果:**
- 显示错误提示 "登录失败，请重试"
- 错误提示为浅红色背景
- 用户可以重新尝试登录

---

## TC-AUTH-008: 登录超时处理
**优先级**: P2 (低)

**步骤:**
```
clear_cookies
navigate_page type="url" url="http://localhost:3002/auth/signin"
take_snapshot

# 模拟超长时间响应
mock_oauth_delay timeout="30000"
click uid="Google登录按钮"
wait_for duration="35000"
take_snapshot
```

**预期结果:**
- 显示超时错误
- 按钮恢复可点击状态
- 加载动画停止

---

## TC-AUTH-009: 多次登录尝试
**优先级**: P1 (中)

**步骤:**
```
clear_cookies
navigate_page type="url" url="http://localhost:3002/auth/signin"
take_snapshot

# 第一次失败
mock_oauth_response status="error"
click uid="Google登录按钮"
wait_for duration="2000"
take_snapshot step="1-首次失败"

# 第二次成功
mock_oauth_response status="success"
click uid="Google登录按钮"
wait_for url="/dashboard"
take_snapshot step="2-重试成功"
```

**预期结果:**
- 第一次失败后显示错误
- 错误清除后可以重新点击
- 第二次成功后正常跳转

---

## TC-AUTH-010: 会话持久化验证
**优先级**: P1 (中)

**步骤:**
```
# 登录
clear_cookies
navigate_page type="url" url="http://localhost:3002"
click uid="登录链接"
click uid="Google登录按钮"
# 完成授权...
wait_for url="/dashboard"
take_snapshot step="1-登录成功"

# 刷新页面
navigate_page type="reload"
take_snapshot step="2-刷新后"

# 关闭浏览器重新打开
close_browser
open_browser
navigate_page type="url" url="http://localhost:3002/dashboard"
take_snapshot step="3-重新打开"
```

**预期结果:**
- 刷新后仍保持登录状态
- 重新打开浏览器后会话持久化（如果配置了持久化）

---

## TC-AUTH-011: 登出流程
**优先级**: P0 (高)

**前置条件:** 用户已登录

**步骤:**
```
navigate_page type="url" url="http://localhost:3002/dashboard"
take_snapshot step="1-已登录"

# 点击登出（假设有登出按钮）
click uid="登出按钮"
wait_for url="/"
take_snapshot step="2-已登出"

# 尝试访问需要登录的页面
navigate_page type="url" url="http://localhost:3002/dashboard"
take_snapshot step="3-重定向到登录"
```

**预期结果:**
- 点击登出后返回首页
- 会话被清除
- 访问 Dashboard 时重定向到登录页

---

## TC-AUTH-012: 跨标签页登录状态同步
**优先级**: P2 (低)

**步骤:**
```
# 标签页1登录
open_tab id="tab1"
navigate_page type="url" url="http://localhost:3002" tab="tab1"
click uid="登录链接" tab="tab1"
click uid="Google登录按钮" tab="tab1"
# 完成授权...

# 标签页2检查登录状态
open_tab id="tab2"
navigate_page type="url" url="http://localhost:3002/dashboard" tab="tab2"
take_snapshot tab="tab2"
```

**预期结果:**
- 标签页2识别到登录状态
- 可以直接访问 Dashboard

---

## TC-AUTH-013: OAuth 授权取消
**优先级**: P1 (中)

**步骤:**
```
clear_cookies
navigate_page type="url" url="http://localhost:3002/auth/signin"
take_snapshot

click uid="Google登录按钮"
wait_for url="accounts.google.com"
# 用户在授权页点击"取消"
click uid="取消授权"
wait_for url="/auth/signin"
take_snapshot
```

**预期结果:**
- 返回登录页面
- 可能显示取消登录的提示
- 用户可以重新选择登录方式

---

## TC-AUTH-014: 登录后的回调 URL 处理
**优先级**: P1 (中)

**步骤:**
```
clear_cookies
navigate_page type="url" url="http://localhost:3002/auth/signin?callbackUrl=/dashboard/settings"
take_snapshot

click uid="Google登录按钮"
# 完成授权...
wait_for url="/dashboard/settings"
take_snapshot
```

**预期结果:**
- 登录成功后跳转到指定的 callbackUrl
- 而不是默认的 /dashboard

---

## TC-AUTH-015: CSRF 保护验证
**优先级**: P2 (低)

**步骤:**
```
clear_cookies
# 尝试直接提交 OAuth 回调，没有有效的 state 参数
navigate_page type="url" url="http://localhost:3002/api/auth/callback/google?code=test&state=invalid"
take_snapshot
```

**预期结果:**
- 请求被拒绝
- 显示错误页面或重定向到登录页
- 不创建有效会话

---

## TC-AUTH-016: 移动端登录流程
**优先级**: P1 (中)

**步骤:**
```
clear_cookies
emulate viewport="375x828x1,mobile,touch"
navigate_page type="url" url="http://localhost:3002"
take_snapshot

click uid="免费开始按钮"
wait_for url="/auth/signin"
take_snapshot

click uid="Google登录按钮"
# 完成移动端 OAuth 授权...
wait_for url="/dashboard"
take_snapshot
```

**预期结果:**
- 移动端登录页面正常显示
- OAuth 授权页面适配移动端
- 登录成功后正常跳转

---

## TC-AUTH-017: 认证状态切换响应
**优先级**: P1 (中)

**步骤:**
```
# 未登录状态
clear_cookies
navigate_page type="url" url="http://localhost:3002"
take_snapshot step="1-未登录"

# 登录
click uid="登录链接"
click uid="Google登录按钮"
# 完成授权...
wait_for url="/dashboard"
navigate_page type="url" url="http://localhost:3002"
take_snapshot step="2-已登录"

# 登出
click uid="登出按钮"
navigate_page type="url" url="http://localhost:3002"
take_snapshot step="3-已登出"
```

**预期结果:**
- Header 导航根据登录状态变化
- 未登录显示"登录"和"免费开始"
- 已登录显示用户信息/登出

---

## 测试数据准备

### OAuth 配置
需要在 `.env.local` 中配置：
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
NEXTAUTH_URL=http://localhost:3002
NEXTAUTH_SECRET=your_nextauth_secret
```

### 测试账户
- Google 测试账户: test@example.com
- GitHub 测试账户: test-user

---

## 元素定位器参考

| 元素描述 | 选择器类型 | 定位器 |
|----------|------------|--------|
| 登录链接 | link text | 登录 |
| 免费开始按钮 | link text | 免费开始 |
| 开始使用按钮 | link text | 开始使用 |
| 立即开始按钮 | link text | 立即开始 |
| Google 登录按钮 | text | 使用 Google 继续 |
| GitHub 登录按钮 | text | 使用 GitHub 继续 |
| 登出按钮 | text | 登出 |
