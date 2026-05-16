import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase-server'

export default async function MarketPage() {
  const supabase = await createServerSupabase()
  const { data: listings } = await supabase
    .from('gear_market')
    .select('*, profiles(username, full_name)')
    .eq('is_sold', false)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold">Gear Market</h1>
          <p className="text-white/40 mt-1">Buy and sell within the community — trusted people only</p>
        </div>
        <Link href="/market/sell" className="btn-primary">+ Sell gear</Link>
      </div>

      <div className="bg-blue-900/20 border border-blue-800/40 rounded-xl p-4 mb-8 text-sm text-blue-300">
        Buying from a PeerShare member means buying from someone you share a community with. Much better than eBay.
      </div>

      {listings?.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map(item => (
            <Link key={item.id} href={`/market/${item.id}`} className="card hover:border-white/20 transition-colors group">
              <div className="h-48 bg-zinc-800 overflow-hidden">
                {item.image_url
                  ? <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  : <div className="w-full h-full flex items-center justify-center text-4xl text-white/10">💰</div>}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
                <p className="text-yellow-400 font-bold text-lg mb-1">€{item.price}</p>
                <div className="flex items-center justify-between text-xs text-white/40">
                  <span>{(item.profiles as any)?.full_name || (item.profiles as any)?.username}</span>
                  <span className="badge badge-gray">{item.condition}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 text-white/30">
          <p className="text-2xl mb-3">Nothing for sale yet</p>
          <Link href="/market/sell" className="btn-primary inline-block">List something</Link>
        </div>
      )}
    </div>
  )
}
