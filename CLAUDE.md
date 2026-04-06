# EmailAction 项目配置

## 团队成员权限

团队成员自动拥有以下权限，无需手动确认：

### Bash 命令
- `npm run *` - 所有 npm 脚本
- `npm test *` - 测试命令
- `npm run dev` - 开发服务器
- `npm run build` - 构建
- `npx prisma *` - Prisma 命令
- `npx vitest *` - Vitest 测试

### 文件操作
- 所有项目文件的读写操作

### API 密钥配置
需要在 `.env.local` 中配置：
- `GLM_API_KEY` - 智谱 AI API Key（从 https://open.bigmodel.cn 获取）
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - Google OAuth
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` - GitHub OAuth
