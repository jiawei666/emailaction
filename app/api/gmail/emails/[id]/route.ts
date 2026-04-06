import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/session'
import { getEmail } from '@/lib/gmail'
import { z } from 'zod'

const paramsSchema = z.object({
  accountId: z.string(),
})

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params

    const { searchParams } = new URL(req.url)
    const accountId = searchParams.get('accountId')

    if (!accountId) {
      return NextResponse.json({ error: 'accountId is required' }, { status: 400 })
    }

    const email = await getEmail(user.id, accountId, id)

    return NextResponse.json(email)
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: error.message || 'Failed to fetch email' }, { status: 500 })
  }
}
