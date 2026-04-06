'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function useRequireAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const loading = status === 'loading'

  useEffect(() => {
    if (!loading && !session) {
      router.push('/auth/signin')
    }
  }, [loading, session, router])

  return {
    user: session?.user,
    loading,
    isAuthenticated: !!session,
  }
}
