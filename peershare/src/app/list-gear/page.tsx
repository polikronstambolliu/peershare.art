'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { withAvailability } from '@/lib/gear-availability'

const CATEGORIES = ['Camera', 'Lens', 'Lighting', 'Audio', 'Support', 'Monitor', 'Other']
const CONDITIONS = [{ v: 'excellent', l: 'Excellent' }, { v: 'good', l: 'Good' }, { v: 'fair', l: 'Fair' }]
const AVAILABILITIES = [
  { v: 'free', l: 'Free to borrow', desc: 'No cost — just return it in good shape' },
  { v: 'by_agreement', l: 'By agreement', desc: 'Discuss terms with the borrower' },
  { v: 'paid', l: 'Small fee', desc: 'Cover wear and maintenance costs' },
]

export default function ListGearPage() {
  const router = useRouter()
  const supabase = createClient()
  const [form, setForm] = useState({ title: '', description: '', category: 'Camera', condition: 'good', availability: 'free', price_per_day: '', location: '' })
  const [availabilityWindow, setAvailabilityWindow] = useState({ dateFrom: '', dateTo: '', timeFrom: '', timeTo: '' })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    let image_url = null
    if (imageFile) {
      const ext = imageFile.name.split('.').pop()
      const path = `${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('gear-images').upload(path, imageFile)
      if (!upErr) {
        const { data } = supabase.storage.from('gear-images').getPublicUrl(path)
        image_url = data.publicUrl
      }
    }

    const { error: insErr } = await supabase.from('gear').insert({
      owner_id: user.id,
      title: form.title,
      description: withAvailability(form.description, availabilityWindow),
      category: form.category,
      condition: form.condition,
      availability: form.availability,
      price_per_day: form.availability === 'paid' ? parseFloat(form.price_per_day) : null,
      location: form.location || null,
      image_url,
    })

    if (insErr) { setError(insErr.message); setSaving(false); return }
    router.push('/gear')
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Share your gear</h1>
      <p className="text-white/40 mb-8">Help a fellow filmmaker. Your gear is worth more being used.</p>

      <form onSubmit={submit} className="space-y-6">
        {/* Image upload */}
        <div>
          <label className="label">Photo</label>
          <label className="block cursor-pointer">
            <div className={`card h-44 flex items-center justify-center overflow-hidden hover:border-[#C24B1E]/40 transition-colors ${preview ? '' : 'border-dashed'}`}>
              {preview
                ? <img src={preview} className="w-full h-full object-cover" alt="preview" />
                : <div className="text-center text-white/30"><div className="text-3xl mb-2">📷</div><p className="text-sm">Click to add a photo</p></div>}
            </div>
            <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
          </label>
        </div>

        <div>
          <label className="label">Gear name *</label>
          <input required className="input" placeholder="e.g. Sony FX3, Aputure 300d, Rode NTG3…" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea className="input resize-none" rows={3} placeholder="Accessories included, any quirks, usage notes…" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>

        <div className="card p-4">
          <p className="font-medium text-sm mb-3">Availability status</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">From date</label>
              <input type="date" className="input" value={availabilityWindow.dateFrom} onChange={e => setAvailabilityWindow({ ...availabilityWindow, dateFrom: e.target.value })} />
            </div>
            <div>
              <label className="label">To date</label>
              <input type="date" className="input" value={availabilityWindow.dateTo} onChange={e => setAvailabilityWindow({ ...availabilityWindow, dateTo: e.target.value })} />
            </div>
            <div>
              <label className="label">Daily from</label>
              <input type="time" className="input" value={availabilityWindow.timeFrom} onChange={e => setAvailabilityWindow({ ...availabilityWindow, timeFrom: e.target.value })} />
            </div>
            <div>
              <label className="label">Daily to</label>
              <input type="time" className="input" value={availabilityWindow.timeTo} onChange={e => setAvailabilityWindow({ ...availabilityWindow, timeTo: e.target.value })} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Condition</label>
            <select className="input" value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })}>
              {CONDITIONS.map(c => <option key={c.v} value={c.v}>{c.l}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Availability</label>
          <div className="space-y-2">
            {AVAILABILITIES.map(a => (
              <label key={a.v} className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${form.availability === a.v ? 'border-[#C24B1E] bg-[#C24B1E]/5' : 'border-zinc-800 hover:border-white/20'}`}>
                <input type="radio" name="availability" value={a.v} checked={form.availability === a.v} onChange={() => setForm({ ...form, availability: a.v })} className="mt-0.5 accent-[#C24B1E]" />
                <div>
                  <p className="font-medium text-sm">{a.l}</p>
                  <p className="text-xs text-white/40">{a.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {form.availability === 'paid' && (
          <div>
            <label className="label">Price per day (€)</label>
            <input type="number" className="input" placeholder="e.g. 25" value={form.price_per_day} onChange={e => setForm({ ...form, price_per_day: e.target.value })} />
          </div>
        )}

        <div>
          <label className="label">Your location</label>
          <input className="input" placeholder="City or neighbourhood" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          style={{
            width: '100%',
            background: saving ? '#2E2A26' : '#C24B1E',
            color: '#F5F0E8',
            fontFamily: 'monospace',
            fontSize: '10px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            borderRadius: '3px',
            border: 'none',
            padding: '14px',
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Sharing…' : 'Share gear'}
        </button>
      </form>
    </div>
  )
}
