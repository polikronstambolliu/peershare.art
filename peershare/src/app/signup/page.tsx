'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const signup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { error: err } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, username, city }
        }
      })
      if (err) { setError(err.message); return }
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed.')
    } finally {
      setLoading(false)
    }
  }

  if (success) return (
    <div style={{ minHeight: '100vh', background: '#1A1714', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
      <div style={{ textAlign: 'center', maxWidth: '360px' }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: '32px', color: '#E8B800', marginBottom: '16px' }}>▶</div>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '24px', color: '#F5F0E8', fontWeight: 400, marginBottom: '8px' }}>Check your email</h1>
        <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '13px', color: '#7A7060', marginBottom: '24px' }}>Click the confirmation link we sent to {email}</p>
        <Link href="/login" style={{ fontFamily: 'monospace', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#4A453E', textDecoration: 'none' }}>
          Back to sign in
        </Link>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#1A1714', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ width: '100%', maxWidth: '360px' }}>

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '13px', color: '#7A7060', marginBottom: '8px' }}>München Node</p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', color: '#F5F0E8', fontWeight: 400, marginBottom: '6px' }}>Join the Node</h1>
          <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '13px', color: '#7A7060' }}>Filmmakers helping filmmakers</p>
        </div>

        <form onSubmit={signup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div>
            <label style={{ fontFamily: 'monospace', fontSize: '10px', letterSpacing: '2px', color: '#4A453E', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Full Name</label>
            <input type="text" required placeholder="Your name" value={fullName} onChange={e => setFullName(e.target.value)}
              style={{ width: '100%', background: '#111009', border: '1px solid #2E2A26', color: '#F5F0E8', fontFamily: 'monospace', fontSize: '13px', padding: '12px 14px', borderRadius: '3px', outline: 'none', boxSizing: 'border-box', colorScheme: 'dark' }} />
          </div>

          <div>
            <label style={{ fontFamily: 'monospace', fontSize: '10px', letterSpacing: '2px', color: '#4A453E', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Username</label>
            <input type="text" required placeholder="yourname" value={username} onChange={e => setUsername(e.target.value)}
              style={{ width: '100%', background: '#111009', border: '1px solid #2E2A26', color: '#F5F0E8', fontFamily: 'monospace', fontSize: '13px', padding: '12px 14px', borderRadius: '3px', outline: 'none', boxSizing: 'border-box', colorScheme: 'dark' }} />
          </div>

          <div>
            <label style={{ fontFamily: 'monospace', fontSize: '10px', letterSpacing: '2px', color: '#4A453E', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Email</label>
            <input type="email" required placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)}
              style={{ width: '100%', background: '#111009', border: '1px solid #2E2A26', color: '#F5F0E8', fontFamily: 'monospace', fontSize: '13px', padding: '12px 14px', borderRadius: '3px', outline: 'none', boxSizing: 'border-box', colorScheme: 'dark' }} />
          </div>

          <div>
            <label style={{ fontFamily: 'monospace', fontSize: '10px', letterSpacing: '2px', color: '#4A453E', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Password</label>
            <input type="password" required placeholder="At least 6 characters" value={password} onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', background: '#111009', border: '1px solid #2E2A26', color: '#F5F0E8', fontFamily: 'monospace', fontSize: '13px', padding: '12px 14px', borderRadius: '3px', outline: 'none', boxSizing: 'border-box', colorScheme: 'dark' }} />
          </div>

          <div>
            <label style={{ fontFamily: 'monospace', fontSize: '10px', letterSpacing: '2px', color: '#4A453E', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Your City <span style={{ color: '#2E2A26' }}>(optional)</span></label>
            <input type="text" placeholder="e.g. München, Berlin..." value={city} onChange={e => setCity(e.target.value)}
              style={{ width: '100%', background: '#111009', border: '1px solid #2E2A26', color: '#F5F0E8', fontFamily: 'monospace', fontSize: '13px', padding: '12px 14px', borderRadius: '3px', outline: 'none', boxSizing: 'border-box', colorScheme: 'dark' }} />
          </div>

          {error && <p style={{ fontFamily: 'monospace', fontSize: '11px', color: '#C24B1E' }}>{error}</p>}

          <button type="submit" disabled={loading}
            style={{ background: loading ? '#2E2A26' : '#C24B1E', color: '#F5F0E8', fontFamily: 'monospace', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', padding: '14px', borderRadius: '3px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px' }}>
            {loading ? 'Joining…' : 'Join the Node'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <p style={{ fontFamily: 'monospace', fontSize: '10px', letterSpacing: '1px', color: '#4A453E' }}>
            Already a member?{' '}
            <Link href="/login" style={{ color: '#C24B1E', textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>

      </div>
    </div>
  )
}
