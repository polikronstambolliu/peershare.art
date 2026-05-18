'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

const LOGIN_TIMEOUT_MS = 30000

const loginInputStyle: React.CSSProperties = {
  width: '100%',
  background: '#111009',
  border: '1px solid #2E2A26',
  color: '#F5F0E8',
  fontFamily: 'monospace',
  fontSize: '13px',
  padding: '12px 14px',
  borderRadius: '3px',
  outline: 'none',
  boxSizing: 'border-box',
  colorScheme: 'dark',
  WebkitBoxShadow: '0 0 0 1000px #111009 inset',
  WebkitTextFillColor: '#F5F0E8',
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const login = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const signInPromise = supabase.auth.signInWithPassword({ email, password })
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Login is taking too long. Please try again.')), LOGIN_TIMEOUT_MS)
      )
      const { error: err } = await Promise.race([signInPromise, timeoutPromise])
      if (err) { setError(err.message); return }
      window.location.assign('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#1A1714', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
      <div style={{ width: '100%', maxWidth: '360px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '13px', color: '#7A7060', marginBottom: '8px' }}>
            München Node
          </p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', color: '#F5F0E8', fontWeight: 400, marginBottom: '6px' }}>
            Welcome back
          </h1>
          <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '13px', color: '#7A7060' }}>
            Sign in to contact your peers
          </p>
        </div>

        {/* Form */}
        <form onSubmit={login} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontFamily: 'monospace', fontSize: '10px', letterSpacing: '2px', color: '#4A453E', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              Email
            </label>
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={loginInputStyle}
            />
          </div>

          <div>
            <label style={{ fontFamily: 'monospace', fontSize: '10px', letterSpacing: '2px', color: '#4A453E', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="login-password-field"
              style={loginInputStyle}
            />
            <style jsx>{`
              .login-password-field::placeholder {
                color: #4A453E;
                opacity: 1;
              }
            `}</style>
            <div style={{ textAlign: 'right', marginTop: '8px' }}>
              <Link href="/forgot-password" style={{ fontFamily: 'monospace', fontSize: '9px', color: '#4A453E', textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </div>
          </div>

          {error && (
            <p style={{ fontFamily: 'monospace', fontSize: '11px', color: '#C24B1E', letterSpacing: '0.5px' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ background: loading ? '#2E2A26' : '#C24B1E', color: '#F5F0E8', fontFamily: 'monospace', fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', padding: '14px', borderRadius: '3px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px' }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <p style={{ fontFamily: 'monospace', fontSize: '10px', letterSpacing: '1px', color: '#4A453E' }}>
            Not a member yet?{' '}
            <Link href="/signup" style={{ color: '#C24B1E', textDecoration: 'none' }}>
              Join the Node
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}
