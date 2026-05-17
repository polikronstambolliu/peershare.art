'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: err } = await supabase.auth.updateUser({ password: newPassword })

    setLoading(false)
    if (err) {
      setError(err.message)
      return
    }
    window.location.assign('/')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#1A1714', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
      <div style={{ width: '100%', maxWidth: '360px' }}>

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '13px', color: '#7A7060', marginBottom: '8px' }}>
            München Node
          </p>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '28px', color: '#F5F0E8', fontWeight: 400, marginBottom: '6px' }}>
            Set new password
          </h1>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontFamily: 'monospace', fontSize: '10px', letterSpacing: '2px', color: '#4A453E', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="reset-password-field"
              style={{ width: '100%', background: '#111009', border: '1px solid #2E2A26', color: '#F5F0E8', fontFamily: 'monospace', fontSize: '13px', padding: '12px 14px', borderRadius: '3px', outline: 'none', boxSizing: 'border-box', colorScheme: 'dark' }}
            />
            <style jsx>{`
              .reset-password-field::placeholder {
                color: #4A453E;
                opacity: 1;
              }
            `}</style>
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
            {loading ? 'Saving…' : 'SET PASSWORD'}
          </button>
        </form>

      </div>
    </div>
  )
}
