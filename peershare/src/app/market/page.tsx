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
        <svg width="100%" height="20" viewBox="0 0 800 20"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          className="block sm:hidden">
          <defs>
            <pattern id="clapper-sm-mk" x="0" y="0" width="40" height="20" patternUnits="userSpaceOnUse">
              <rect width="40" height="20" fill="#1A1714"/>
              <polygon points="0,0 20,0 40,10 20,10" fill="#4A453E"/>
              <polygon points="0,10 20,10 40,20 20,20" fill="#4A453E"/>
            </pattern>
          </defs>
          <rect width="800" height="20" fill="url(#clapper-sm-mk)"/>
        </svg>
        <svg width="100%" height="32" viewBox="0 0 800 32"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          className="hidden sm:block">
          <defs>
            <pattern id="clapper-lg-mk" x="0" y="0" width="64" height="32" patternUnits="userSpaceOnUse">
              <rect width="64" height="32" fill="#1A1714"/>
              <polygon points="0,0 32,0 64,16 32,16" fill="#4A453E"/>
              <polygon points="0,16 32,16 64,32 32,32" fill="#4A453E"/>
            </pattern>
          </defs>
          <rect width="800" height="32" fill="url(#clapper-lg-mk)"/>
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
