import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase-server'

const CATEGORIES = ['All', 'Camera', 'Lens', 'Lighting', 'Audio', 'Support', 'Monitor', 'Other']

export default async function GearPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams
  const supabase = await createServerSupabase()

  let query = supabase.from('gear').select('*, profiles(username, full_name)').eq('is_available', true).order('created_at', { ascending: false })
  if (category && category !== 'All') query = query.ilike('category', category)

  const { data: gear } = await query

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gear Library</h1>
          <p className="text-white/40 mt-1">Borrow from your community</p>
        </div>
        <Link href="/list-gear" className="btn-primary">+ Share gear</Link>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-8">
        {CATEGORIES.map(cat => (
          <Link key={cat}
            href={cat === 'All' ? '/gear' : `/gear?category=${cat}`}
            className={`px-4 py-2 rounded-xl text-sm transition-colors border ${
              (cat === 'All' && !category) || category === cat
                ? 'bg-yellow-400 text-black border-yellow-400 font-semibold'
                : 'border-zinc-800 text-white/50 hover:text-white hover:border-white/30'
            }`}>
            {cat}
          </Link>
        ))}
      </div>

      {gear?.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {gear.map(item => (
            <Link key={item.id} href={`/gear/${item.id}`} className="card hover:border-white/20 transition-colors group">
              <div className="h-48 bg-zinc-800 overflow-hidden">
                {item.image_url
                  ? <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  : <div className="w-full h-full flex items-center justify-center text-4xl text-white/10">🎬</div>}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-sm">{item.title}</h3>
                  <span className={`badge shrink-0 ${item.availability === 'free' ? 'badge-green' : item.availability === 'by_agreement' ? 'badge-blue' : 'badge-yellow'}`}>
                    {item.availability === 'free' ? 'Free' : item.availability === 'by_agreement' ? 'By agreement' : `€${item.price_per_day}/day`}
                  </span>
                </div>
                <p className="text-xs text-white/40 mb-2">{(item.profiles as any)?.full_name || (item.profiles as any)?.username}</p>
                {item.location && <p className="text-xs text-white/30">📍 {item.location}</p>}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 text-white/30">
          <p className="text-2xl mb-3">No gear yet</p>
          <Link href="/list-gear" className="btn-primary inline-block">Be the first to share</Link>
        </div>
      )}
    </div>
  )
}
