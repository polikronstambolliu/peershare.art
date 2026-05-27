import Link from 'next/link'
import { createServerSupabase } from '@/lib/supabase-server'
import type { CSSProperties } from 'react'

const TYPE_LABELS: Record<string, string> = { crew: '👥 Crew', gear: '🎥 Gear', location: '📍 Location', other: '💬 Other' }

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

const paidBadgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '2px 10px',
  borderRadius: '9999px',
  fontSize: '12px',
  fontWeight: 500,
  border: '1px solid #C24B1E',
  color: '#C24B1E',
  background: 'transparent',
}

export default async function HelpBoardPage() {
  const supabase = await createServerSupabase()
  const { data: requests } = await supabase
    .from('help_requests')
    .select('*, profiles(username, full_name, karma)')
    .eq('is_open', true)
    .order('created_at', { ascending: false })

  return (
    <div style={{ minHeight: '100vh', background: '#1A1714' }}>
      <div style={{ width: '100%', lineHeight: 0 }}>
        <svg width="100%" height="36" viewBox="0 0 800 36"
          preserveAspectRatio="none"
          className="hidden sm:block">
          <defs>
            <pattern id="clap-lg-hb" x="0" y="0" width="72" height="36" patternUnits="userSpaceOnUse">
              <rect width="72" height="36" fill="#111009"/>
              <polygon points="0,0 18,0 36,36 18,36" fill="#3A3530"/>
              <polygon points="36,0 54,0 72,36 54,36" fill="#3A3530"/>
            </pattern>
          </defs>
          <rect width="800" height="36" fill="url(#clap-lg-hb)"/>
        </svg>
        <svg width="100%" height="22" viewBox="0 0 800 22"
          preserveAspectRatio="none"
          className="block sm:hidden">
          <defs>
            <pattern id="clap-sm-hb" x="0" y="0" width="44" height="22" patternUnits="userSpaceOnUse">
              <rect width="44" height="22" fill="#111009"/>
              <polygon points="0,0 11,0 22,22 11,22" fill="#3A3530"/>
              <polygon points="22,0 33,0 44,22 33,22" fill="#3A3530"/>
            </pattern>
          </defs>
          <rect width="800" height="22" fill="url(#clap-sm-hb)"/>
        </svg>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 style={{ fontFamily: 'Georgia, serif', color: '#F5F0E8', fontSize: '28px', fontWeight: 400 }}>Help Board</h1>
          <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#7A7060', fontSize: '13px', marginTop: '4px' }}>Filmmakers who need a hand — crew, gear, locations, anything</p>
        </div>
        <Link href="/help-board/new" style={buttonStyle}>+ Post request</Link>
      </div>

      <div style={{
        borderLeft: '2px solid #C24B1E',
        background: '#111009',
        padding: '16px',
        marginBottom: '32px',
        fontSize: '14px',
        color: '#C24B1E',
      }}>
        This is where the community lives. Help someone out — you&apos;ll earn karma and they&apos;ll remember it.
      </div>

      {requests?.length ? (
        <div className="space-y-4">
          {requests.map(req => (
            <Link key={req.id} href={`/help-board/${req.id}`} className="card p-5 hover:border-white/20 transition-colors block">
              <div className="flex items-start gap-4">
                <div className="shrink-0 text-2xl w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                  {TYPE_LABELS[req.type]?.split(' ')[0] ?? '💬'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold">{req.title}</h3>
                    <span className={`badge shrink-0 ${req.is_paid ? '' : 'badge-green'}`} style={req.is_paid ? paidBadgeStyle : undefined}>
                      {req.is_paid ? 'Paid' : 'Volunteer'}
                    </span>
                  </div>
                  <p className="text-white/50 text-sm line-clamp-2 mb-3">{req.description}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/30">
                    <span>by <span className="text-white/50">{(req.profiles as any)?.full_name || (req.profiles as any)?.username}</span></span>
                    <span className="badge badge-gray">{TYPE_LABELS[req.type] ?? req.type}</span>
                    {req.location && <span>📍 {req.location}</span>}
                    {req.date_from && <span>📅 {req.date_from}{req.date_to && req.date_to !== req.date_from ? ` → ${req.date_to}` : ''}</span>}
                    {req.skills_needed?.length > 0 && req.skills_needed.map((s: string) => <span key={s} className="badge badge-blue">{s}</span>)}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-24">
          <p style={{ fontFamily: 'Georgia, serif', color: '#4A453E', fontSize: '22px', marginBottom: '12px' }}>No open requests</p>
          <p className="text-sm mb-6" style={{ color: '#4A453E' }}>Be the first to ask for help</p>
          <Link href="/help-board/new" style={buttonStyle}>Post a request</Link>
        </div>
      )}
      </div>
    </div>
  )
}
