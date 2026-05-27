import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase-server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ gearId: string }> }
) {
  const { gearId } = await params
  const supabase = await createServerSupabase()

  // Must be authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify the gear listing exists, is available, and belongs to a real owner
  const { data: gear } = await supabase
    .from('gear')
    .select('owner_id')
    .eq('id', gearId)
    .eq('is_available', true)
    .single()

  if (!gear) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  }

  // Prevent owners from fetching their own contact via this endpoint
  if (gear.owner_id === user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: contact } = await supabase
    .from('profiles')
    .select('phone, whatsapp, signal, full_name')
    .eq('id', gear.owner_id)
    .single()

  return NextResponse.json(contact ?? {})
}
