import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/session'
import { getEmails } from '@/lib/gmail'
import { z } from 'zod'

const querySchema = z.object({
  accountId: z.string(),
  maxResults: z.coerce.number().min(1).max(100).optional().default(20),
  query: z.string().optional(),
  pageToken: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()

    const { searchParams } = new URL(req.url)
    const params = Object.fromEntries(searchParams)

    const { accountId, ...options } = querySchema.parse(params)

    const result = await getEmails(user.id, accountId, options)

    return NextResponse.json(result)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid parameters', details: error.errors }, { status: 400 })
    }
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: error.message || 'Failed to fetch emails' }, { status: 500 })
  }
}
