# EmailAction

>   AI 驱动的邮件待办事项提取工具，自动从 Gmail 邮件中识别待办任务。

## 功能特性

- 📧 **Gmail 集成** - 连接 Gmail 账户，自动扫描邮件
- 🤖 **AI 分析** - 使用 GLM-4 智能识别邮件中的待办事项
- 📋 **任务同步** - 支持同步到 Notion（飞书敬请期待）
- 🔐 **多账户支持** - 支持多个 Gmail 账户和任务平台
- 🎨 **简洁界面** - 温暖极简的设计风格

## 技术栈

- **框架**: Next.js 15 (App Router)
- **数据库**: PostgreSQL (Prisma ORM)
- **认证**: NextAuth.js v5
- **UI**: Tailwind CSS + Radix UI
- **AI**: 智谱 GLM-4
- **测试**: Vitest + Playwright

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/jiawei666/emailaction.git
cd emailaction
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制环境变��模板：

```bash
cp .env.example .env.local
```

编辑 `.env.local`，填入以下配置：

| 变量名 | 说明 | 获取方式 |
|--------|------|----------|
| `DATABASE_URL` | PostgreSQL 连接串 | [Neon](https://neon.tech) / [Supabase](https://supabase.com) |
| `NEXTAUTH_SECRET` | JWT 加密密钥 | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | 应用地址 | 本地: `http://localhost:3000` |
| `GOOGLE_CLIENT_ID` | Google OAuth ID | [Google Cloud Console](https://console.cloud.google.com) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Secret | 同上 |
| `GITHUB_CLIENT_ID` | GitHub OAuth ID | [GitHub Settings](https://github.com/settings/developers) |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth Secret | 同上 |
| `GLM_API_KEY` | 智谱 API Key | [智谱开放平台](https://open.bigmodel.cn) |
| `GLM_API_URL` | API 代理地址（可选） | 默认使用智谱官方 API |

### 4. 初始化数据库

```bash
npx prisma migrate deploy
```

### 5. 启动开��服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 部署到 Vercel

### 1. 导入项目

在 [Vercel](https://vercel.com/new) 导入 GitHub 仓库。

### 2. 配置 Root Directory

设置 Root Directory 为 `apps/emailaction`（如果是 monorepo）

### 3. 配置环境变量

在 Vercel Dashboard → Settings → Environment Variables 添加：

```
DATABASE_URL=your-postgresql-connection-string
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.vercel.app
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GLM_API_KEY=your-glm-api-key
```

### 4. 部署

点击 Deploy，等待构建完成。

## 项目结构

```
emailaction/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── gmail/         # Gmail OAuth & 同步
│   │   ├── tasks/         # 任务管理
│   │   └── cron/          # 定时同步（可选）
│   ├── dashboard/         # 仪表盘页面
│   └── auth/              # 认证页面
├── components/            # React 组件
│   └── ui/               # UI 基础组件
├── lib/                   # 核心库
│   ├── gmail.ts          # Gmail API 封装
│   ├── glm.ts            # GLM AI 封装
│   └── db.ts             # 数据库客户端
├── prisma/               # 数据库 Schema
├── e2e/                  # E2E 测试
└── test/                 # 单元测试
```

## 开发命令

```bash
# 开发服务器
npm run dev

# 构建
npm run build

# 数据库
npm run db:migrate    # 部署迁移
npm run db:generate   # 生成 Prisma Client

# 测试
npm run test          # 单元测试
npm run test:e2e      # E2E 测试
npm run test:coverage # 测试覆盖率

# 代码检查
npm run lint
```

## 环境变量说明

### 必需

| 变量 | 说明 |
|------|------|
| `DATABASE_URL` | PostgreSQL 连接串 |
| `NEXTAUTH_SECRET` | NextAuth 加密密钥 |
| `NEXTAUTH_URL` | 应用完整 URL |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Secret |
| `GLM_API_KEY` | 智谱 AI API Key |

### 可选

| 变量 | 说明 |
|------|------|
| `GITHUB_CLIENT_ID` | GitHub OAuth（可选登录方式） |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth Secret |
| `GLM_API_URL` | 自定义 API 代理地址 |

## API 代理配置

如果使用第三方 API 代理（如 Coding Plan），配置：

```env
GLM_API_URL=https://your-proxy.com/v2
GLM_API_KEY=your-api-key
```

## License

MIT
