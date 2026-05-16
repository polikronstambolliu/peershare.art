'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const [form, setForm] = useState({ email: '', password: '', full_name: '', username: '', location: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const signup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Check username unique
    const { data: existing } = await supabase.from('profiles').select('id').eq('username', form.username).single()
    if (existing) { setError('Username already taken'); setLoading(false); return }

    const { error: err } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.full_name, username: form.username }
      }
    })

    if (err) { setError(err.message); setLoading(false); return }

    // Update location if provided
    if (form.location) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) await supabase.from('profiles').update({ location: form.location }).eq('id', user.id)
    }

    setDone(true)
  }

  if (done) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">🎬</div>
        <h2 className="text-2xl font-bold mb-2">Welcome to PeerShare!</h2>
        <p className="text-white/50 mb-6">Check your email to confirm your account, then come back and log in.</p>
        <Link href="/login" className="btn-primary inline-block">Go to login</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-yellow-400 font-bold text-2xl">PeerShare</Link>
          <h1 className="text-2xl font-bold mt-4 mb-1">Join the community</h1>
          <p className="text-white/40 text-sm">Filmmakers helping filmmakers</p>
        </div>

        <form onSubmit={signup} className="space-y-4">
          <div>
            <label className="label">Full name</label>
            <input required className="input" placeholder="Your name" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
          </div>
          <div>
            <label className="label">Username</label>
            <input required className="input" placeholder="yourname" value={form.username} onChange={e => setForm({ ...form, username: e.target.value.toLowerCase().replace(/\s/g, '') })} />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" required className="input" placeholder="your@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" required className="input" placeholder="At least 6 characters" minLength={6} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          </div>
          <div>
            <label className="label">Your city <span className="text-white/30 normal-case font-normal">(optional)</span></label>
            <input className="input" placeholder="e.g. Munich, Berlin, Vienna…" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
            {loading ? 'Joining…' : 'Join PeerShare'}
          </button>
        </form>

        <p className="text-center text-white/40 text-sm mt-6">
          Already a member?{' '}
          <Link href="/login" className="text-yellow-400 hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  )
}
