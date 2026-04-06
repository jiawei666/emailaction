import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
    } & DefaultSession['user']
    // Google OAuth token（用于 Gmail API）
    accessToken?: string
  }
}
