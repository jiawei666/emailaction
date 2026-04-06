import { NextRequest, NextResponse } from "next/server"

// 检查是否是测试模式
function isTestMode(req: NextRequest) {
  const testCookie = req.cookies.get("e2e-test-mode")
  if (testCookie?.value === "true") return true

  const testHeader = req.headers.get("x-e2e-test")
  if (testHeader === "true") return true

  if (process.env.NODE_ENV === "test" || process.env.PLAYWRIGHT_TEST === "true") {
    return true
  }

  return false
}

// 轻量级 session 检查（只检查 JWT cookie 是否存在）
function hasSession(req: NextRequest): boolean {
  // NextAuth v5 使用 authjs.session-token 或 __Secure-authjs.session-token
  const sessionToken = req.cookies.get("authjs.session-token")?.value ||
    req.cookies.get("__Secure-authjs.session-token")?.value
  return !!sessionToken
}

export function middleware(req: NextRequest) {
  const { nextUrl } = req

  // 测试模式：跳过所有认证检查
  if (isTestMode(req)) {
    return NextResponse.next()
  }

  const isLoggedIn = hasSession(req)

  // 如果访问 dashboard 但未登录，重定向到登录页
  if (nextUrl.pathname.startsWith("/dashboard") && !isLoggedIn) {
    const signInUrl = new URL("/auth/signin", nextUrl.origin)
    signInUrl.searchParams.set("callbackUrl", nextUrl.pathname)
    return NextResponse.redirect(signInUrl)
  }

  // 如果已登录但访问登录页，重定向到 dashboard
  if (nextUrl.pathname.startsWith("/auth/signin") && isLoggedIn) {
    const callbackUrl = nextUrl.searchParams.get("callbackUrl") || "/dashboard"
    return NextResponse.redirect(new URL(callbackUrl, nextUrl.origin))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public|api|_next).*)",
  ],
}
