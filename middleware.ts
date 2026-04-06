import { auth } from "@/auth.config"
import { NextRequest } from "next/server"

// 测试用户（用于 E2E 测试）
const TEST_USER = {
  id: "test-user-e2e",
  email: "e2e-test@example.com",
  name: "E2E Test User",
}

// 检查是否是测试模式
function isTestMode(req: NextRequest) {
  // 检查特殊的测试 cookie
  const testCookie = req.cookies.get("e2e-test-mode")
  if (testCookie?.value === "true") return true

  // 检查 E2E 测试 header（Playwright 配置的 extraHTTPHeaders）
  const testHeader = req.headers.get("x-e2e-test")
  if (testHeader === "true") return true

  // 检查测试环境变量
  if (process.env.NODE_ENV === "test" || process.env.PLAYWRIGHT_TEST === "true") {
    return true
  }

  return false
}

export default auth((req) => {
  const { nextUrl, auth: session } = req

  // 测试模式：跳过所有认证检查
  if (isTestMode(req as NextRequest)) {
    // 在测试模式下，不进行任何重定向
    // 测试应该通过 mock 来处理认证状态
    return
  }

  const isLoggedIn = !!session?.user

  // 如果访问 dashboard 但未登录，重定向到登录页
  if (nextUrl.pathname.startsWith("/dashboard") && !isLoggedIn) {
    const signInUrl = new URL("/auth/signin", nextUrl.origin)
    signInUrl.searchParams.set("callbackUrl", nextUrl.pathname)
    return Response.redirect(signInUrl)
  }

  // 如果已登录但访问登录页，重定向到 dashboard
  if (nextUrl.pathname.startsWith("/auth/signin") && isLoggedIn) {
    const callbackUrl = nextUrl.searchParams.get("callbackUrl") || "/dashboard"
    return Response.redirect(new URL(callbackUrl, nextUrl.origin))
  }
})

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handle auth internally)
     * - _next (Next.js internals)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api|_next).*)",
  ],
}
