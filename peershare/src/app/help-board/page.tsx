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
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold">Help Board</h1>
          <p className="text-white/40 mt-1">Filmmakers who need a hand — crew, gear, locations, anything</p>
        </div>
        <Link href="/help-board/new" style={buttonStyle}>+ Post request</Link>
      </div>

      <div style={{
        background: 'rgba(194, 75, 30, 0.1)',
        border: '1px solid rgba(194, 75, 30, 0.2)',
        borderRadius: '4px',
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
        <div className="text-center py-24 text-white/30">
          <p className="text-2xl mb-3">No open requests</p>
          <p className="text-sm mb-6">Be the first to ask for help</p>
          <Link href="/help-board/new" style={buttonStyle}>Post a request</Link>
        </div>
      )}
    </div>
  )
}
