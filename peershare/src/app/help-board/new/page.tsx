'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const TYPES = [
  { v: 'crew', l: '👥 Crew', desc: 'Camera op, sound, gaffer, PA, editor…' },
  { v: 'gear', l: '🎥 Gear', desc: 'Need to borrow specific equipment' },
  { v: 'location', l: '📍 Location', desc: 'Looking for a shooting location' },
  { v: 'other', l: '💬 Other', desc: 'Anything else — feedback, advice, transport…' },
]

const SKILLS = ['Camera Op', 'Camera Assistant', 'Director', 'Sound', 'Boom Op', 'Gaffer', 'Grip', 'Editor', 'Colorist', 'PA', 'Actor', 'Driver', 'DIT', 'Drone Op', 'Script Supervisor', 'Producer']

export default function NewHelpRequestPage() {
  const router = useRouter()
  const supabase = createClient()
  const [form, setForm] = useState({
    title: '', description: '', type: 'crew',
    location: '', date_from: '', date_to: '', is_paid: false
  })
  const [skills, setSkills] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const toggleSkill = (s: string) => setSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    const res = await fetch('/api/posts/help-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        description: form.description,
        type: form.type,
        skills_needed: skills,
        location: form.location || null,
        date_from: form.date_from || null,
        date_to: form.date_to || null,
        is_paid: form.is_paid,
      }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setError(body.error || 'Failed to post request.')
      setSaving(false)
      return
    }
    router.push('/help-board')
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Post a request</h1>
      <p className="text-white/40 mb-8">Ask your community for help. Someone will show up.</p>

      <form onSubmit={submit} className="space-y-6">
        <div>
          <label className="label">What do you need? *</label>
          <div className="grid grid-cols-2 gap-2">
            {TYPES.map(t => (
              <label key={t.v} className={`flex flex-col gap-1 p-3 rounded-xl border cursor-pointer transition-colors ${form.type === t.v ? 'border-yellow-400 bg-yellow-400/5' : 'border-zinc-800 hover:border-white/20'}`}>
                <input type="radio" name="type" value={t.v} checked={form.type === t.v} onChange={() => setForm({ ...form, type: t.v })} className="hidden" />
                <span className="font-medium text-sm">{t.l}</span>
                <span className="text-xs text-white/40">{t.desc}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Title *</label>
          <input required className="input" placeholder="e.g. Need a sound recordist for a student short" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        </div>

        <div>
          <label className="label">Tell us more *</label>
          <textarea required className="input resize-none" rows={4} placeholder="Project details, what you're making, how many days, any conditions…" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>

        {form.type === 'crew' && (
          <div>
            <label className="label">Skills needed</label>
            <div className="flex flex-wrap gap-2">
              {SKILLS.map(s => (
                <button type="button" key={s} onClick={() => toggleSkill(s)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${skills.includes(s) ? 'bg-yellow-400 text-black border-yellow-400 font-medium' : 'border-zinc-800 text-white/50 hover:border-white/30'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">From date</label>
            <input type="date" className="input" value={form.date_from} onChange={e => setForm({ ...form, date_from: e.target.value })} />
          </div>
          <div>
            <label className="label">To date</label>
            <input type="date" className="input" value={form.date_to} onChange={e => setForm({ ...form, date_to: e.target.value })} />
          </div>
        </div>

        <div>
          <label className="label">Location</label>
          <input className="input" placeholder="City or area" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={form.is_paid} onChange={e => setForm({ ...form, is_paid: e.target.checked })} className="w-4 h-4 accent-yellow-400" />
          <div>
            <p className="text-sm font-medium">This is a paid position</p>
            <p className="text-xs text-white/40">Check this if you can offer payment or expenses</p>
          </div>
        </label>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button type="submit" disabled={saving} className="btn-primary w-full py-3 text-base">
          {saving ? 'Posting…' : 'Post request'}
        </button>
      </form>
    </div>
  )
}
