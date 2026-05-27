import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

const ALLOWED_CATEGORIES = ['Camera', 'Lens', 'Lighting', 'Audio', 'Support', 'Monitor', 'Other']
const ALLOWED_CONDITIONS = ['excellent', 'good', 'fair']

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabase()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()

  if (!body.title?.trim()) {
    return NextResponse.json({ error: 'Title is required.' }, { status: 400 })
  }
  if (!ALLOWED_CATEGORIES.includes(body.category)) {
    return NextResponse.json({ error: 'Invalid category.' }, { status: 400 })
  }
  if (!ALLOWED_CONDITIONS.includes(body.condition)) {
    return NextResponse.json({ error: 'Invalid condition.' }, { status: 400 })
  }
  const price = parseFloat(body.price)
  if (!isFinite(price) || price <= 0) {
    return NextResponse.json({ error: 'Invalid price.' }, { status: 400 })
  }

  const { error } = await supabase.from('gear_market').insert({
    seller_id: user.id,
    title: String(body.title).slice(0, 200),
    description: body.description ? String(body.description).slice(0, 2000) : null,
    category: body.category,
    condition: body.condition,
    price,
    location: body.location ? String(body.location).slice(0, 200) : null,
    image_url: body.image_url || null,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true }, { status: 201 })
}
