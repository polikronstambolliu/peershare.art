import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase-server'

const CATEGORIES = ['All', 'Camera', 'Lens', 'Lighting', 'Audio', 'Support', 'Monitor', 'Other']

export default async function GearPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  let query = supabase
    .from('gear')
    .select('*, profiles(username, full_name)')
    .eq('is_available', true)
    .order('created_at', { ascending: false })

  if (category && category !== 'All') query = query.ilike('category', category)
  const { data: gear } = await query

  return (
    <div style={{ background: '#1A1714', minHeight: '100vh' }}>

      <div style={{ width: '100%', lineHeight: 0 }}>
        <svg width="100%" height="36" viewBox="0 0 800 36"
          preserveAspectRatio="none"
          className="hidden sm:block">
          <defs>
            <pattern id="clap-lg-home" x="0" y="0" width="72" height="36" patternUnits="userSpaceOnUse">
              <rect width="72" height="36" fill="#111009"/>
              <polygon points="0,0 18,0 36,36 18,36" fill="#3A3530"/>
              <polygon points="36,0 54,0 72,36 54,36" fill="#3A3530"/>
            </pattern>
          </defs>
          <rect width="800" height="36" fill="url(#clap-lg-home)"/>
        </svg>
        <svg width="100%" height="22" viewBox="0 0 800 22"
          preserveAspectRatio="none"
          className="block sm:hidden">
          <defs>
            <pattern id="clap-sm-home" x="0" y="0" width="44" height="22" patternUnits="userSpaceOnUse">
              <rect width="44" height="22" fill="#111009"/>
              <polygon points="0,0 11,0 22,22 11,22" fill="#3A3530"/>
              <polygon points="22,0 33,0 44,22 33,22" fill="#3A3530"/>
            </pattern>
          </defs>
          <rect width="800" height="22" fill="url(#clap-sm-home)"/>
        </svg>
      </div>

      {/* HEADER */}
      <div style={{ borderBottom: '1px solid #2E2A26', padding: '40px 24px 32px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <div className="flex flex-wrap gap-2" style={{ marginBottom: '16px' }}>
              <span style={{ background: '#2E2A26', color: '#7A7060', fontFamily: 'monospace', fontSize: '10px', letterSpacing: '3px', padding: '4px 10px', borderRadius: '2px' }}>
                NODE · MÜNCHEN · MUC/DE
              </span>
              <span style={{ background: '#1D5C45', color: '#C4DAD0', fontFamily: 'monospace', fontSize: '10px', letterSpacing: '2px', padding: '4px 10px', borderRadius: '2px' }}>
                ● LIVE
              </span>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <svg className="w-10 h-10 sm:w-[52px] sm:h-[52px] shrink-0 block" viewBox="0 0 96 96" fill="none">
                <circle cx="48" cy="48" r="44" stroke="#E8B800" strokeWidth="2" fill="none"/>
                <polygon points="21,11 21,85 89,48" fill="#E8B800" opacity="0.9"/>
                <line x1="21" y1="11" x2="21" y2="85" stroke="#1A1714" strokeWidth="1.5" opacity="0.5"/>
                <line x1="21" y1="11" x2="89" y2="48" stroke="#1A1714" strokeWidth="1.5" opacity="0.5"/>
                <line x1="21" y1="85" x2="89" y2="48" stroke="#1A1714" strokeWidth="1.5" opacity="0.5"/>
                <circle cx="21" cy="11" r="8" fill="#1A1714" stroke="#E8B800" strokeWidth="1.5"/>
                <circle cx="21" cy="85" r="8" fill="#1A1714" stroke="#E8B800" strokeWidth="1.5"/>
                <circle cx="89" cy="48" r="8" fill="#1A1714" stroke="#E8B800" strokeWidth="1.5"/>
                <circle cx="21" cy="11" r="3.5" fill="#C24B1E"/>
                <circle cx="21" cy="85" r="3.5" fill="#C24B1E"/>
                <circle cx="89" cy="48" r="3.5" fill="#C24B1E"/>
              </svg>
              <h1 className="flex items-baseline" style={{ lineHeight: 1, marginBottom: '8px' }}>
                <span className="text-[32px] sm:text-[44px]" style={{ fontFamily: 'Georgia, serif', color: '#F5F0E8', letterSpacing: '-0.5px' }}>
                  PeerShare
                </span>
                <span className="text-[17px] sm:text-[24px]" style={{ fontFamily: 'system-ui, sans-serif', fontWeight: 300, color: '#C24B1E', letterSpacing: '-0.5px', paddingLeft: '2px' }}>
                  .art
                </span>
              </h1>
            </div>

            <p style={{ fontFamily: 'monospace', fontSize: '10px', letterSpacing: '3px', color: '#4A453E', textTransform: 'uppercase', marginBottom: '12px' }}>
              Film · Rent · Sell
            </p>

            {!user && (
              <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '13px', color: '#7A7060', maxWidth: '400px' }}>
                Browse the München gear grid freely. Sign in to contact a peer.
              </p>
            )}
          </div>

          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Link href="/list-gear" className="hidden sm:inline-block" style={{ background: '#C24B1E', color: '#F5F0E8', fontFamily: 'monospace', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', padding: '10px 20px', borderRadius: '3px', textDecoration: 'none' }}>
                + Share Gear
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* CATEGORY FILTER */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 24px 0' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <Link key={cat}
              href={cat === 'All' ? '/' : `/?category=${cat}`}
              style={{
                fontFamily: 'monospace',
                fontSize: '10px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                padding: '6px 14px',
                borderRadius: '2px',
                textDecoration: 'none',
                border: (cat === 'All' && !category) || category === cat ? '1px solid #C24B1E' : '1px solid #2E2A26',
                color: (cat === 'All' && !category) || category === cat ? '#C24B1E' : '#4A453E',
                background: 'transparent',
              }}>
              {cat}
            </Link>
          ))}
        </div>
      </div>

      {/* GEAR GRID */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 24px 80px' }}>
        {gear?.length ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {gear.map(item => (
              <div key={item.id} style={{ background: '#111009', border: '1px solid #2E2A26', borderRadius: '4px', overflow: 'hidden' }}>

                <div style={{ height: '160px', background: '#2E2A26', position: 'relative' }}>
                  {item.image_url
                    ? <img src={item.image_url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2E2A26', fontSize: '36px' }}>🎬</div>
                  }
                  <span style={{
                    position: 'absolute', top: '10px', right: '10px',
                    fontFamily: 'monospace', fontSize: '9px', letterSpacing: '1.5px', textTransform: 'uppercase',
                    padding: '3px 8px', borderRadius: '2px',
                    background: item.availability === 'free' ? '#1D5C45' : item.availability === 'by_agreement' ? '#2E2A26' : '#8B3010',
                    color: item.availability === 'free' ? '#C4DAD0' : item.availability === 'by_agreement' ? '#7A7060' : '#F2C4B0',
                  }}>
                    {item.availability === 'free' ? 'Munich Clause' : item.availability === 'by_agreement' ? 'By agreement' : `€${item.price_per_day}/day`}
                  </span>
                </div>

                <div style={{ padding: '14px 16px 16px' }}>
                  <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: '#F5F0E8', margin: '0 0 4px', lineHeight: 1.2 }}>
                    {item.title}
                  </h3>
                  <p style={{ fontFamily: 'monospace', fontSize: '10px', letterSpacing: '1px', color: '#4A453E', textTransform: 'uppercase', marginBottom: '4px' }}>
                    {(item.profiles as any)?.full_name || (item.profiles as any)?.username}
                  </p>
                  {item.location && (
                    <p style={{ fontFamily: 'monospace', fontSize: '10px', color: '#4A453E', marginBottom: '14px' }}>
                      {item.location}
                    </p>
                  )}

                  {user ? (
                    <Link href={`/gear/${item.id}`} style={{ display: 'block', textAlign: 'center', background: '#E8B800', color: '#1A1714', fontFamily: 'monospace', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', padding: '8px', borderRadius: '2px', textDecoration: 'none' }}>
                      ▶ Contact Peer
                    </Link>
                  ) : (
                    <Link href="/login" style={{ display: 'block', textAlign: 'center', background: 'transparent', color: '#4A453E', fontFamily: 'monospace', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', padding: '8px', borderRadius: '2px', textDecoration: 'none', border: '1px solid #2E2A26' }}>
                      Sign in to contact
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#4A453E' }}>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '22px', marginBottom: '12px' }}>No gear in the grid yet.</p>
            {user && (
              <Link href="/list-gear" style={{ background: '#C24B1E', color: '#F5F0E8', fontFamily: 'monospace', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', padding: '10px 20px', borderRadius: '3px', textDecoration: 'none' }}>
                Be the first to share
              </Link>
            )}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: '1px solid #2E2A26', padding: '24px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'monospace', fontSize: '9px', letterSpacing: '2px', color: '#2E2A26' }}>
          PEERSHARE.ART · MÜNCHEN NODE · COMMUNITY SUPPORTED
        </p>
      </div>

    </div>
  )
}
