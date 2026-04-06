# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> 认证流程 - 真实环境 >> 点击 Google 登录应该跳转到 OAuth
- Location: e2e/tests/auth.spec.ts:34:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('button:has-text("Google")').first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('button:has-text("Google")').first()

```

# Page snapshot

```yaml
- generic [active]:
  - alert [ref=e1]
  - dialog "Server Error" [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - navigation [ref=e8]:
          - button "previous" [disabled] [ref=e9]:
            - img "previous" [ref=e10]
          - button "next" [disabled] [ref=e12]:
            - img "next" [ref=e13]
          - generic [ref=e15]: 1 of 1 error
          - generic [ref=e16]:
            - text: Next.js (15.1.6) is outdated
            - link "(learn more)" [ref=e18] [cursor=pointer]:
              - /url: https://nextjs.org/docs/messages/version-staleness
        - generic [ref=e19]:
          - heading "Server Error" [level=1] [ref=e20]
          - generic [ref=e21]:
            - button "Copy error stack" [ref=e22] [cursor=pointer]:
              - img [ref=e23]
            - link "Learn more about enabling Node.js inspector for server code with Chrome DevTools" [ref=e26] [cursor=pointer]:
              - /url: https://nextjs.org/docs/app/building-your-application/configuring/debugging#server-side-code
              - img [ref=e27]
        - paragraph [ref=e30]: "Error: Cannot find module './vendor-chunks/next-auth.js' Require stack: - /Users/yuanjiawei/ai-coding/coviber/apps/emailaction/.next/server/webpack-runtime.js - /Users/yuanjiawei/ai-coding/coviber/apps/emailaction/.next/server/app/api/auth/[...nextauth]/route.js - /Users/yuanjiawei/ai-coding/coviber/apps/emailaction/node_modules/next/dist/server/require.js - /Users/yuanjiawei/ai-coding/coviber/apps/emailaction/node_modules/next/dist/server/load-components.js - /Users/yuanjiawei/ai-coding/coviber/apps/emailaction/node_modules/next/dist/build/utils.js - /Users/yuanjiawei/ai-coding/coviber/apps/emailaction/node_modules/next/dist/server/dev/static-paths-worker.js - /Users/yuanjiawei/ai-coding/coviber/apps/emailaction/node_modules/next/dist/compiled/jest-worker/processChild.js"
        - generic [ref=e31]: This error happened while generating the page. Any console logs will be displayed in the terminal window.
      - generic [ref=e32]:
        - generic [ref=e33]:
          - heading "__webpack_require__.f.require" [level=3] [ref=e34]
          - generic [ref=e36]: file:///Users/yuanjiawei/ai-coding/coviber/apps/emailaction/.next/server/webpack-runtime.js (208:28)
        - button "Show ignored frames" [ref=e37] [cursor=pointer]
```

# Test source

```ts
  1  | /**
  2  |  * 认证流程 E2E 测试 - 真实环境
  3  |  * 不使用 mock，验证真实 OAuth 流程
  4  |  *
  5  |  * 前置条件：
  6  |  * - 开发服务器运行中
  7  |  * - 数据库已配置
  8  |  * - 真实账号可用
  9  |  */
  10 | 
  11 | import { test, expect } from '@playwright/test'
  12 | 
  13 | test.describe('认证流程 - 真实环境', () => {
  14 |   test('登录页应该正确加载并显示 OAuth 选项', async ({ page }) => {
  15 |     await page.goto('/api/auth/signin')
  16 |     await page.waitForLoadState('networkidle')
  17 | 
  18 |     // 验证页面标题
  19 |     const title = await page.title()
  20 |     expect(title).toBeTruthy()
  21 |     console.log('页面标题:', title)
  22 | 
  23 |     // 验证 OAuth 按钮存在（至少一个）
  24 |     const googleBtn = page.locator('button:has-text("Google")')
  25 |     const githubBtn = page.locator('button:has-text("GitHub")')
  26 | 
  27 |     const hasGoogle = await googleBtn.count()
  28 |     const hasGithub = await githubBtn.count()
  29 | 
  30 |     expect(hasGoogle + hasGithub).toBeGreaterThan(0)
  31 |     console.log('OAuth 选项: Google=' + hasGoogle + ', GitHub=' + hasGithub)
  32 |   })
  33 | 
  34 |   test('点击 Google 登录应该跳转到 OAuth', async ({ page }) => {
  35 |     await page.goto('/api/auth/signin')
  36 |     await page.waitForLoadState('networkidle')
  37 | 
  38 |     const googleBtn = page.locator('button:has-text("Google")').first()
> 39 |     await expect(googleBtn).toBeVisible({ timeout: 10000 })
     |                             ^ Error: expect(locator).toBeVisible() failed
  40 |     await googleBtn.click()
  41 | 
  42 |     // 验证跳转
  43 |     await page.waitForURL(/accounts\.google\.com|\/api\/auth\/callback|\/dashboard/, { timeout: 30000 })
  44 |     const url = page.url()
  45 |     console.log('跳转到:', url)
  46 | 
  47 |     expect(url).toMatch(/accounts\.google\.com|\/api\/auth\/callback|\/dashboard/)
  48 |   })
  49 | })
  50 | 
  51 | test.describe('已登录状态 - 真实环境', () => {
  52 |   test.use({ storageState: 'e2e/.auth/user.json' })
  53 | 
  54 |   test('Dashboard 应该显示用户数据', async ({ page }) => {
  55 |     await page.goto('/dashboard')
  56 |     await page.waitForLoadState('networkidle')
  57 | 
  58 |     // 验证 URL
  59 |     expect(page.url()).toContain('/dashboard')
  60 | 
  61 |     // 验证页面内容（不 mock）
  62 |     const mainContent = await page.locator('main').textContent()
  63 |     console.log('Dashboard 内容长度:', mainContent?.length || 0)
  64 | 
  65 |     // 验证关键元素存在
  66 |     const nav = page.locator('nav')
  67 |     await expect(nav).toBeVisible({ timeout: 10000 })
  68 |   })
  69 | 
  70 |   test('API 应该返回真实数据', async ({ page }) => {
  71 |     // 调用真实 API
  72 |     const response = await page.request.get('/api/user/account')
  73 |     console.log('API 状态:', response.status())
  74 | 
  75 |     if (response.ok()) {
  76 |       const data = await response.json()
  77 |       console.log('用户数据:', JSON.stringify(data, null, 2))
  78 |       expect(data).toHaveProperty('email')
  79 |     } else {
  80 |       console.log('API 返回非 200，可能未登录')
  81 |     }
  82 |   })
  83 | })
  84 | 
```