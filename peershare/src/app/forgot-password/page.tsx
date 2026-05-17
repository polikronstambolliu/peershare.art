'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://www.peershare.art/reset-password',
    })

    setLoading(false)
    if (err) {
      setError(err.message)
      return
    }
    setSuccess(true)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#1A1714', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
      <div style={{ width: '100%', maxWidth: '360px' }}>

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '13px', color: '#7A7060', marginBottom: '8px' }}>
            München Node
          </p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', color: '#F5F0E8', fontWeight: 400, marginBottom: '6px' }}>
            Reset your password
          </h1>
          <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '13px', color: '#7A7060' }}>
            We&apos;ll send you a link
          </p>
        </div>

        {success ? (
          <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '13px', color: '#7A7060', textAlign: 'center' }}>
            Check your email for a reset link.
          </p>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                style={{ width: '100%', background: '#111009', border: '1px solid #2E2A26', color: '#F5F0E8', fontFamily: 'monospace', fontSize: '13px', padding: '12px', borderRadius: '3px', outline: 'none', boxSizing: 'border-box' }}
              />
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
              {loading ? 'Sending…' : 'SEND RESET LINK'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <Link href="/login" style={{ fontFamily: 'monospace', fontSize: '10px', letterSpacing: '1px', color: '#4A453E', textDecoration: 'none' }}>
            Back to sign in
          </Link>
        </div>

      </div>
    </div>
  )
}
