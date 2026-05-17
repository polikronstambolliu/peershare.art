import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase-server'
import type { CSSProperties } from 'react'

const CATEGORIES = ['All', 'Camera', 'Lens', 'Lighting', 'Audio', 'Support', 'Monitor', 'Other']

const shareButtonStyle: CSSProperties = {
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

export default async function GearPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams
  const supabase = await createServerSupabase()

  let query = supabase.from('gear').select('*, profiles(username, full_name)').eq('is_available', true).order('created_at', { ascending: false })
  if (category && category !== 'All') query = query.ilike('category', category)

  const { data: gear } = await query

  return (
    <div style={{ minHeight: '100vh', background: '#1A1714' }}>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 style={{ fontFamily: 'Georgia, serif', color: '#F5F0E8', fontSize: '28px', fontWeight: 400, margin: 0 }}>
              Gear Library
            </h1>
            <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#7A7060', fontSize: '13px', marginTop: '4px' }}>
              Borrow from your community
            </p>
          </div>
          <Link href="/list-gear" style={shareButtonStyle}>+ Share gear</Link>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map(cat => {
            const isActive = (cat === 'All' && !category) || category === cat
            return (
              <Link
                key={cat}
                href={cat === 'All' ? '/gear' : `/gear?category=${cat}`}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  transition: 'color 0.15s, border-color 0.15s',
                  border: `1px solid ${isActive ? '#C24B1E' : '#2E2A26'}`,
                  color: isActive ? '#C24B1E' : '#4A453E',
                  background: 'transparent',
                  textDecoration: 'none',
                  borderRadius: '3px',
                }}
              >
                {cat}
              </Link>
            )
          })}
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
          <div style={{ textAlign: 'center', padding: '96px 0' }}>
            <p style={{ fontFamily: 'Georgia, serif', color: '#4A453E', fontSize: '22px', marginBottom: '12px' }}>
              No gear yet
            </p>
            <Link href="/list-gear" style={shareButtonStyle}>Be the first to share</Link>
          </div>
        )}
      </div>
    </div>
  )
}
