import { createServerSupabase } from '@/lib/supabase-server'
import Link from 'next/link'
import ContactButton from './ContactButton'
import { notFound } from 'next/navigation'
import { extractAvailability, formatAvailabilityRange } from '@/lib/gear-availability'

export default async function GearDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabase()
  const { data: item } = await supabase.from('gear').select('*, profiles(id, username, full_name, bio, karma)').eq('id', id).single()
  if (!item) notFound()

  const { data: { user } } = await supabase.auth.getUser()

  const conditionLabel: Record<string, string> = { excellent: 'Excellent', good: 'Good', fair: 'Fair' }
  const availLabel: Record<string, string> = { free: 'Free to borrow', by_agreement: 'By agreement', paid: `€${item.price_per_day}/day` }
  const parsed = extractAvailability(item.description)
  const availabilityRange = formatAvailabilityRange(parsed.availability)

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href="/gear" className="text-white/40 hover:text-white text-sm mb-6 inline-block">← Back to gear</Link>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="card aspect-square overflow-hidden">
          {item.image_url
            ? <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-6xl text-white/10">🎬</div>}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="badge badge-gray">{item.category}</span>
            <span className={`badge ${item.availability === 'free' ? 'badge-green' : item.availability === 'by_agreement' ? 'badge-blue' : 'badge-yellow'}`}>
              {availLabel[item.availability] || item.availability}
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-2">{item.title}</h1>
          <p className="text-white/50 text-sm mb-1">Condition: {conditionLabel[item.condition] || item.condition}</p>
          {item.location && <p className="text-white/50 text-sm mb-4">📍 {item.location}</p>}

          {availabilityRange && (
            <div className="mb-4">
              <p className="text-xs text-white/40 mb-1">Availability status</p>
              <div className="w-full rounded-full bg-zinc-800 h-2 overflow-hidden">
                <div className="h-full bg-yellow-400 w-full" />
              </div>
              <p className="text-xs text-yellow-400 mt-2">{availabilityRange}</p>
            </div>
          )}

          {parsed.cleanDescription && (
            <p className="text-white/70 text-sm leading-relaxed mb-6">{parsed.cleanDescription}</p>
          )}

          {/* Owner */}
          <div className="card p-4 mb-6">
            <p className="text-xs text-white/40 mb-2">Shared by</p>
            <Link href={`/profile/${(item.profiles as any)?.username}`} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-black font-bold">
                {(item.profiles as any)?.full_name?.[0]?.toUpperCase() || (item.profiles as any)?.username?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-sm">{(item.profiles as any)?.full_name || (item.profiles as any)?.username}</p>
                <p className="text-xs text-yellow-400">⭐ {(item.profiles as any)?.karma ?? 0} karma</p>
              </div>
            </Link>
          </div>

          {user && user.id !== (item.profiles as any)?.id && (
            <ContactButton ownerId={(item.profiles as any)?.id} ownerName={(item.profiles as any)?.full_name || (item.profiles as any)?.username} gearId={item.id} gearTitle={item.title} />
          )}
          {user && user.id === (item.profiles as any)?.id && (
            <Link href={`/gear/${item.id}/edit`} className="btn-secondary w-full text-center block">Edit listing</Link>
          )}
          {!user && (
            <Link href="/login" className="btn-primary w-full text-center block">Log in to contact owner</Link>
          )}
        </div>
      </div>
    </div>
  )
}
