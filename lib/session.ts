import { auth, getTestUser } from "@/auth.config"
import { cache } from "react"
import { headers } from "next/headers"

export const getSession = cache(async () => {
  // 检查测试模式
  const headersList = headers()
  const testUser = getTestUser(await headersList)

  // 如果是测试模式，返回测试用户会话
  if (testUser) {
    return {
      user: {
        id: testUser.id,
        email: testUser.email,
        name: testUser.name,
      },
      expires: new Date(Date.now() + 86400000).toISOString(),
    }
  }

  return await auth()
})

export async function requireAuth() {
  const session = await getSession()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }
  return session.user
}

export async function requireUserId() {
  const user = await requireAuth()
  return user.id
}

export async function getCurrentUser() {
  const session = await getSession()
  return session?.user
}
