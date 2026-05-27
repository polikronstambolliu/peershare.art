import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

const ALLOWED_TYPES = ['crew', 'gear', 'location', 'other']

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()

  if (!body.title?.trim() || !body.description?.trim()) {
    return NextResponse.json({ error: 'Title and description are required.' }, { status: 400 })
  }
  if (!ALLOWED_TYPES.includes(body.type)) {
    return NextResponse.json({ error: 'Invalid type.' }, { status: 400 })
  }

  const { error } = await supabase.from('help_requests').insert({
    author_id: user.id,
    title: String(body.title).slice(0, 200),
    description: String(body.description).slice(0, 2000),
    type: body.type,
    skills_needed: Array.isArray(body.skills_needed) ? body.skills_needed : [],
    location: body.location ? String(body.location).slice(0, 200) : null,
    date_from: body.date_from || null,
    date_to: body.date_to || null,
    is_paid: Boolean(body.is_paid),
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true }, { status: 201 })
}
