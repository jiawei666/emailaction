# EmailAction Vercel 部署指南

本文档介绍如何将 EmailAction 部署到 Vercel 平台。

## 前置要求

1. Vercel 账号 (https://vercel.com)
2. GitHub 账号（用于连接代码仓库）
3. Google Cloud 项目（用于 Gmail API）
4. 智谱 AI 账号（用于 AI 任务提取）

## 部署步骤

### 1. 连接 GitHub 仓库

1. 登录 Vercel
2. 点击 "Add New Project"
3. 从 GitHub 导入 EmailAction 仓库
4. 如果是 monorepo，请将 **Root Directory** 设置为 `apps/emailaction`

### 2. 配置环境变量

在 Vercel 项目设置中，添加以下环境变量：

#### 必需的环境变量

| 变量名 | 说明 | 获取方式 |
|--------|------|----------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | 使用 Neon/Supabase/Railway 等托管 PostgreSQL |
| `NEXTAUTH_URL` | 生产环境域名 | 部署后自动设置，如 `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | JWT 加密密钥 | 运行 `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | Google OAuth 客户端 ID | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 密钥 | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `GLM_API_KEY` | 智谱 AI API Key | [智谱 AI 开放平台](https://open.bigmodel.cn/usercenter/apikeys) |
| `CRON_SECRET` | Cron 任务验证密钥 | 运行 `openssl rand -base64 32` |

#### 可选的环境变量

| 变量名 | 说明 |
|--------|------|
| `GITHUB_CLIENT_ID` | GitHub OAuth 客户端 ID（支持 GitHub 登录） |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth 密钥 |
| `FEISHU_APP_ID` | 飞书应用 ID（飞书任务集成） |
| `FEISHU_APP_SECRET` | 飞书应用密钥 |
| `GMAIL_PUBSUB_TOPIC` | Gmail Push Notification Topic（实时监听） |
| `GLM_API_URL` | 智谱 API 代理地址（可选） |

### 3. 配置数据库

#### 选项 A: 使用 Vercel Marketplace + Neon（推荐）

1. 在 Vercel 项目中，进入 "Storage" 选项卡
2. 创建 Neon 数据库
3. Vercel 会自动注入数据库连接环境变量
4. 将数据库主连接串配置到 `DATABASE_URL`

#### 选项 B: 使用外部 PostgreSQL

1. 创建外部 PostgreSQL 数据库（如 Supabase、Neon、Railway）
2. 将连接字符串添加为 `DATABASE_URL` 环境变量

### 4. 配置 Google OAuth

1. 访问 [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. 创建 OAuth 2.0 客户端 ID
3. 添加授权重定向 URI：
   - `https://your-app.vercel.app/api/auth/callback/google`
4. 复制 Client ID 和 Client Secret 到 Vercel 环境变量

### 5. 部署

点击 "Deploy" 按钮，Vercel 将自动构建和部署应用。

本项目在 Vercel 使用以下构建命令（见 `vercel.json`）：

```bash
npm run build:vercel
```

该命令会先执行 `prisma migrate deploy`，再执行 `next build`。

### 6. 配置 Cron Jobs

Vercel 会自动读取 `vercel.json` 中的 Cron 配置，每 15 分钟执行一次邮件同步。

验证 Cron 配置：
1. 进入 Vercel 项目 "Settings" → "Cron Jobs"
2. 确认 `/api/cron/sync` 已添加
3. 本项目支持两种鉴权方式：
   - `Authorization: Bearer <CRON_SECRET>`（Vercel Cron 推荐）
   - `?secret=<CRON_SECRET>`（本地/手动调试）

### 7. 域名配置（可选）

1. 进入 "Settings" → "Domains"
2. 添加自定义域名
3. 更新 Google OAuth 的重定向 URI

## 生产环境检查清单

- [ ] 所有环境变量已配置
- [ ] 数据库连接正常
- [ ] Google OAuth 回调 URL 正确
- [ ] CRON_SECRET 已设置（随机强密码）
- [ ] Cron Jobs 已启用
- [ ] 自定义域名已配置（可选）

## 故障排查

### Cron 任务未执行

检查 Vercel 的 Cron Jobs 日志，确保 `CRON_SECRET` 环境变量已正确配置。

### Google OAuth 失败

确认 Google Cloud Console 中的授权重定向 URI 与生产环境域名匹配。

### 数据库连接失败

检查 `DATABASE_URL` 格式是否正确，并确认数据库允许来自 Vercel 的连接。

## 本地开发

复制环境变量到本地：

```bash
cp .env.example .env.local
```

根据 `.env.example` 填入实际值，然后运行：

```bash
npm run dev
```
