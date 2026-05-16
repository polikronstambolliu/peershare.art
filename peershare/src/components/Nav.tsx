'use client'
import Link from 'next/link'
import { createClientSupabase } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import CoffeeBanner from './CoffeeBanner'

export default function Nav() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const supabase = createClientSupabase()
  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data } = await supabase.from('profiles').select('username, full_name, avatar_url').eq('id', user.id).single()
        setProfile(data)
      }
    }
    loadUser()
    const { data: listener } = supabase.auth.onAuthStateChange(async (_e, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data } = await supabase.from('profiles').select('username, full_name, avatar_url').eq('id', session.user.id).single()
        setProfile(data)
      } else {
        setProfile(null)
      }
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const initial = profile?.full_name?.[0]?.toUpperCase() || profile?.username?.[0]?.toUpperCase() || '?'

  const linkStyle: React.CSSProperties = {
    fontFamily: 'monospace',
    fontSize: '9px',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: '#4A453E',
    textDecoration: 'none',
  }

  const joinStyle: React.CSSProperties = {
    ...linkStyle,
    color: '#F5F0E8',
    background: '#C24B1E',
    padding: '6px 14px',
    borderRadius: '2px',
  }

  return (
    <nav style={{
      background: '#111009',
      borderBottom: '1px solid #2E2A26',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        padding: '0 24px',
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '1100px',
        margin: '0 auto',
      }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: '1px' }}>
          <span style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: '#F5F0E8' }}>
            PeerShare
          </span>
          <span style={{ fontFamily: 'system-ui, sans-serif', fontSize: '10px', fontWeight: 300, color: '#C24B1E' }}>
            .art
          </span>
        </Link>

        <div className="hidden md:flex" style={{ alignItems: 'center', gap: '20px' }}>
          <Link href="/gear" style={linkStyle}>Gear Library</Link>
          <Link href="/help-board" style={linkStyle}>Help Board</Link>
          <Link href="/market" style={linkStyle}>Market</Link>
        </div>

        <div className="hidden md:flex" style={{ alignItems: 'center', gap: '20px' }}>
          {user && profile ? (
            <>
              <Link href="/list-gear" style={linkStyle}>+ Share Gear</Link>
              <Link href={`/profile/${profile.username}`} style={{ ...linkStyle, display: 'flex', alignItems: 'center', gap: '8px' }}>
                {profile.avatar_url
                  ? <img src={profile.avatar_url} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} alt={profile.full_name} />
                  : <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#C24B1E', color: '#F5F0E8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>{initial}</span>}
                <span>{profile.full_name || profile.username}</span>
              </Link>
              <button type="button" onClick={handleLogout} style={{ ...linkStyle, background: 'none', border: 'none', cursor: 'pointer' }}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" style={linkStyle}>Sign in</Link>
              <Link href="/signup" style={joinStyle}>Join the Node</Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ color: '#4A453E', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden" style={{ borderTop: '1px solid #2E2A26', background: '#111009', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {user && profile && (
            <Link href={`/profile/${profile.username}`} onClick={() => setMenuOpen(false)}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', paddingBottom: '12px', borderBottom: '1px solid #2E2A26' }}>
              {profile.avatar_url
                ? <img src={profile.avatar_url} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} alt={profile.full_name} />
                : <span style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#C24B1E', color: '#F5F0E8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{initial}</span>}
              <div>
                <p style={{ fontFamily: 'Georgia, serif', color: '#F5F0E8', fontWeight: 600, margin: 0 }}>{profile.full_name || profile.username}</p>
                <p style={{ fontFamily: 'monospace', fontSize: '10px', color: '#4A453E', margin: 0 }}>@{profile.username}</p>
              </div>
            </Link>
          )}
          <Link href="/gear" onClick={() => setMenuOpen(false)} style={linkStyle}>Gear Library</Link>
          <Link href="/help-board" onClick={() => setMenuOpen(false)} style={linkStyle}>Help Board</Link>
          <Link href="/market" onClick={() => setMenuOpen(false)} style={linkStyle}>Market</Link>
          {user && profile ? (
            <>
              <Link href="/list-gear" onClick={() => setMenuOpen(false)} style={joinStyle}>+ Share Gear</Link>
              <Link href={`/profile/${profile.username}`} onClick={() => setMenuOpen(false)} style={linkStyle}>My Profile</Link>
              <button type="button" onClick={handleLogout} style={{ ...linkStyle, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
                Sign out
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '12px' }}>
              <Link href="/login" onClick={() => setMenuOpen(false)} style={{ ...linkStyle, flex: 1, textAlign: 'center', border: '1px solid #2E2A26', padding: '8px', borderRadius: '2px' }}>Sign in</Link>
              <Link href="/signup" onClick={() => setMenuOpen(false)} style={{ ...joinStyle, flex: 1, textAlign: 'center' }}>Join the Node</Link>
            </div>
          )}
          <div style={{ paddingTop: '8px', borderTop: '1px solid #2E2A26' }}>
            <CoffeeBanner compact />
          </div>
        </div>
      )}
    </nav>
  )
}
