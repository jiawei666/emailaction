# E2E 测试说明

## 测试模式

### 1. Mock 测试（默认）

使用模拟数据进行测试，不需要真实账号。

```bash
npm run test:e2e
```

**优点**：快速、稳定、不依赖外部服务
**缺点**：无法发现真实环境的问题

### 2. 真实账号测试

使用真实 Gmail 账号进行测试，可以发现真实问题。

```bash
# 第一步：设置认证（只需要一次，或 session 过期后重新运行）
npm run test:e2e:auth

# 第二步：运行真实账号测试
npm run test:e2e:real
```

**优点**：能发现真实环境的问题
**缺点**：需要真实账号，可能受 API 限制

## 认证设置

### 方式一：交互式登录（推荐）

```bash
npm run test:e2e:auth
```

脚本会打开浏览器，你手动完成 Google 登录，完成后自动保存认证状态。

### 方式二：使用 App Password（CI 环境）

1. 在 Google 账户设置中生成 App Password
2. 设置环境变量：

```bash
TEST_EMAIL=your-test-gmail@gmail.com
TEST_PASSWORD=your-app-password
```

3. 运行认证脚本

```bash
TEST_EMAIL=xxx TEST_PASSWORD=xxx npm run test:e2e:auth
```

## Session 有效期

- 认证状态保存在 `e2e/.auth/user.json`
- Google OAuth token 通常 1 小时过期
- Refresh token 可能 6 个月过期
- 如果测试失败提示未登录，重新运行 `npm run test:e2e:auth`

## 自主开发循环

使用真实账号运行自主开发循环：

```bash
/auto-loop --config=real
```

这会：
1. 运行真实账号测试
2. 发现真实环境的问题
3. 自动修复代码
4. 循环直到所有测试通过

## 测试文件说明

| 文件 | 模式 | 用途 |
|------|------|------|
| `*.spec.ts` | Mock | 基础功能测试 |
| `real-gmail.spec.ts` | 真实账号 | Gmail 集成测试 |
| `api.spec.ts` | 真实账号 | API 健康检查 |

## 截图

真实账号测试会在 `e2e/screenshots/` 目录保存截图，用于：
- 调试失败原因
- 记录当前状态
- 生成测试报告
