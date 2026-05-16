import { createServerSupabase } from '@/lib/supabase-server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ContactButton from '@/app/gear/[id]/ContactButton'

export default async function MarketItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabase()
  const { data: item } = await supabase.from('gear_market').select('*, profiles(id, username, full_name, karma, location)').eq('id', id).single()
  if (!item) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  const seller = item.profiles as any

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href="/market" className="text-white/40 hover:text-white text-sm mb-6 inline-block">← Market</Link>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="card aspect-square overflow-hidden">
          {item.image_url
            ? <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-6xl text-white/10">💰</div>}
        </div>

        <div>
          <span className="badge badge-gray mb-3">{item.category}</span>
          <h1 className="text-3xl font-bold mb-2">{item.title}</h1>
          <p className="text-yellow-400 text-3xl font-bold mb-2">€{item.price}</p>
          <p className="text-white/50 text-sm mb-1">Condition: {item.condition}</p>
          {item.location && <p className="text-white/50 text-sm mb-4">📍 {item.location}</p>}
          {item.description && <p className="text-white/70 text-sm leading-relaxed mb-6">{item.description}</p>}

          <div className="card p-4 mb-6">
            <p className="text-xs text-white/40 mb-2">Sold by</p>
            <Link href={`/profile/${seller?.username}`} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-black font-bold">
                {seller?.full_name?.[0]?.toUpperCase() || seller?.username?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-sm">{seller?.full_name || seller?.username}</p>
                <p className="text-xs text-yellow-400">⭐ {seller?.karma ?? 0} karma</p>
              </div>
            </Link>
          </div>

          {item.is_sold
            ? <div className="bg-red-900/30 border border-red-800 rounded-xl p-4 text-red-400 text-sm text-center">This item has been sold</div>
            : user && user.id !== seller?.id
              ? <ContactButton ownerId={seller?.id} ownerName={seller?.full_name || seller?.username} gearId={item.id} gearTitle={item.title} />
              : !user && <Link href="/login" className="btn-primary w-full text-center block">Log in to contact seller</Link>}
        </div>
      </div>
    </div>
  )
}
