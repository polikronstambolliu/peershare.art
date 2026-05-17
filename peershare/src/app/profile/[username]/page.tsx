import { createServerSupabase } from '@/lib/supabase-server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import type { CSSProperties } from 'react'

const cardStyle: CSSProperties = {
  background: '#111009',
  border: '1px solid #2E2A26',
  borderRadius: '4px',
  overflow: 'hidden',
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createServerSupabase()

  const { data: profile } = await supabase.from('profiles').select('*').eq('username', username).single()
  if (!profile) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  const isMe = user?.id === profile.id

  const { data: gear } = await supabase.from('gear').select('*').eq('owner_id', profile.id).order('created_at', { ascending: false })
  const { data: helpRequests } = await supabase.from('help_requests').select('*').eq('author_id', profile.id).order('created_at', { ascending: false })
  const { data: marketListings } = await supabase.from('gear_market').select('*').eq('seller_id', profile.id).eq('is_sold', false)

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Profile header */}
      <div style={{ ...cardStyle, padding: '24px', marginBottom: '32px' }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-5">
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: '#2E2A26',
              color: '#F5F0E8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '30px',
              flexShrink: 0,
            }}>
              {profile.full_name?.[0]?.toUpperCase() || profile.username?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{profile.full_name || profile.username}</h1>
              <p style={{ color: '#7A7060', fontSize: '14px' }}>@{profile.username}</p>
              {profile.location && <p className="text-white/40 text-sm mt-1">📍 {profile.location}</p>}
              <div className="flex items-center gap-3 mt-2">
                <span style={{ color: '#E8B800', fontWeight: 600 }}>⭐ {profile.karma} karma</span>
                <span style={{ color: '#7A7060', fontSize: '14px' }}>Member since {new Date(profile.created_at).getFullYear()}</span>
              </div>
            </div>
          </div>
          {isMe && <Link href="/profile/edit" className="btn-secondary text-sm">Edit profile</Link>}
        </div>

        {profile.bio && <p className="text-white/60 text-sm mt-5 leading-relaxed border-t border-zinc-800 pt-5">{profile.bio}</p>}

        {profile.skills?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {profile.skills.map((s: string) => <span key={s} className="badge badge-blue">{s}</span>)}
          </div>
        )}
      </div>

      {/* Gear */}
      {gear && gear.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Gear available to borrow</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gear.map(item => (
              <Link key={item.id} href={`/gear/${item.id}`} style={cardStyle} className="hover:border-[#4A453E] transition-colors group block">
                <div className="h-36 bg-zinc-800 overflow-hidden">
                  {item.image_url
                    ? <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    : <div className="w-full h-full flex items-center justify-center text-3xl text-white/10">🎬</div>}
                </div>
                <div className="p-3">
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className="text-xs text-white/40 mt-1">{item.availability === 'free' ? 'Free' : item.availability === 'by_agreement' ? 'By agreement' : `€${item.price_per_day}/day`}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Help requests */}
      {helpRequests && helpRequests.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Help requests</h2>
          <div className="space-y-3">
            {helpRequests.map(req => (
              <Link key={req.id} href={`/help-board/${req.id}`} style={{ ...cardStyle, padding: '16px' }} className="hover:border-[#4A453E] transition-colors block">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-sm">{req.title}</p>
                  <span className={`badge shrink-0 ${req.is_open ? 'badge-green' : 'badge-gray'}`}>{req.is_open ? 'Open' : 'Closed'}</span>
                </div>
                <p className="text-xs text-white/40 mt-1">{req.type} · {req.is_paid ? 'Paid' : 'Volunteer'}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Market */}
      {marketListings && marketListings.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Selling</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {marketListings.map(item => (
              <Link key={item.id} href={`/market/${item.id}`} style={{ ...cardStyle, padding: '16px' }} className="hover:border-[#4A453E] transition-colors flex gap-4">
                {item.image_url && <img src={item.image_url} alt={item.title} className="w-16 h-16 object-cover rounded-lg shrink-0" />}
                <div>
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className="text-yellow-400 font-bold">€{item.price}</p>
                  <p className="text-xs text-white/40">{item.condition}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {isMe && gear?.length === 0 && helpRequests?.length === 0 && (
        <div style={{ ...cardStyle, padding: '40px', textAlign: 'center' }} className="py-12 text-white/30">
          <p className="text-lg mb-4">Your profile is ready — now add some gear!</p>
          <Link
            href="/list-gear"
            style={{
              display: 'inline-block',
              background: '#C24B1E',
              color: '#F5F0E8',
              fontWeight: 600,
              padding: '10px 20px',
              borderRadius: '4px',
              textDecoration: 'none',
              fontSize: '14px',
            }}
          >
            Share your first gear
          </Link>
        </div>
      )}
    </div>
  )
}
