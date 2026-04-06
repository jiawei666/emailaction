import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import { prisma } from "@/lib/db"

// Test user for E2E testing
const TEST_USER = {
  id: "cmnkggz3q00029fs0jbyyno0v",
  email: "beconfident666@gmail.com",
  name: "E2E Test User",
}

// Global variable to store test mode from middleware
declare global {
  // eslint-disable-next-line no-var
  var __testMode__: boolean
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile https://www.googleapis.com/auth/gmail.readonly",
        },
      },
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
      }

      if (account?.provider === "google") {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at
      }

      return token
    },
    async session({ session, token }) {
      // Check test mode
      if (globalThis.__testMode__) {
        return {
          ...session,
          user: {
            id: TEST_USER.id,
            email: TEST_USER.email,
            name: TEST_USER.name,
            emailVerified: null,
          },
        }
      }

      // Pass token info to session
      if (session.user && token.id) {
        session.user.id = token.id as string
      }

      // Pass Google token to session for Gmail API
      if (token.accessToken) {
        (session as any).accessToken = token.accessToken
      }

      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
})

export function getTestUser(headers: Headers) {
  const testCookie = headers.get("cookie")?.includes("e2e-test-mode=true")
  const testHeader = headers.get("x-e2e-test") === "true"

  if (testCookie || testHeader || process.env.NODE_ENV === "test" || process.env.PLAYWRIGHT_TEST === "true") {
    // Set global test mode for session callback
    globalThis.__testMode__ = true
    return TEST_USER
  }

  globalThis.__testMode__ = false
  return null
}
