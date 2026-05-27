import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase-server'
import type { CSSProperties } from 'react'

const buttonStyle: CSSProperties = {
  background: '#C24B1E',
  color: '#F5F0E8',
  fontFamily: 'monospace',
  fontSize: '10px',
  letterSpacing: '2px',
  textTransform: 'uppercase',
  borderRadius: '3px',
  padding: '10px 16px',
  textDecoration: 'none',
  display: 'inline-block',
}

export default async function MarketPage() {
  const supabase = await createServerSupabase()
  const { data: listings } = await supabase
    .from('gear_market')
    .select('*, profiles(username, full_name)')
    .eq('is_sold', false)
    .order('created_at', { ascending: false })

  return (
    <div style={{ minHeight: '100vh', background: '#1A1714' }}>
      <div style={{ width: '100%', lineHeight: 0 }}>
        <svg width="100%" height="48" viewBox="0 0 800 48"
          preserveAspectRatio="none"
          className="hidden sm:block">
          <defs>
            <pattern id="clap-lg-mk" x="0" y="0" width="96" height="48" patternUnits="userSpaceOnUse">
              <rect width="96" height="48" fill="#111009"/>
              <polygon points="0,0 24,0 48,48 24,48" fill="#4A4540"/>
              <polygon points="48,0 72,0 96,48 72,48" fill="#4A4540"/>
            </pattern>
          </defs>
          <rect width="800" height="48" fill="url(#clap-lg-mk)"/>
        </svg>
        <svg width="100%" height="30" viewBox="0 0 800 30"
          preserveAspectRatio="none"
          className="block sm:hidden">
          <defs>
            <pattern id="clap-sm-mk" x="0" y="0" width="60" height="30" patternUnits="userSpaceOnUse">
              <rect width="60" height="30" fill="#111009"/>
              <polygon points="0,0 15,0 30,30 15,30" fill="#4A4540"/>
              <polygon points="30,0 45,0 60,30 45,30" fill="#4A4540"/>
            </pattern>
          </defs>
          <rect width="800" height="30" fill="url(#clap-sm-mk)"/>
        </svg>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold">Gear Market</h1>
          <p className="text-white/40 mt-1">Buy and sell within the community — trusted people only</p>
        </div>
        <Link href="/market/sell" style={buttonStyle}>+ Sell gear</Link>
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
                <p className="font-bold text-lg mb-1" style={{ color: '#C24B1E' }}>€{item.price}</p>
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
          <Link href="/market/sell" style={buttonStyle}>List something</Link>
        </div>
      )}
      </div>
    </div>
  )
}
