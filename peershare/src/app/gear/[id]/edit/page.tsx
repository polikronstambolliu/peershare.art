'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { extractAvailability, withAvailability } from '@/lib/gear-availability'
import DeleteGearButton from './DeleteGearButton'

const CATEGORIES = ['Camera', 'Lens', 'Lighting', 'Audio', 'Support', 'Monitor', 'Other']
const CONDITIONS = [{ v: 'excellent', l: 'Excellent' }, { v: 'good', l: 'Good' }, { v: 'fair', l: 'Fair' }]
const AVAILABILITIES = [
  { v: 'free', l: 'Free to borrow', desc: 'No cost - just return it in good shape' },
  { v: 'by_agreement', l: 'By agreement', desc: 'Discuss terms with the borrower' },
  { v: 'paid', l: 'Small fee', desc: 'Cover wear and maintenance costs' }
]

const saveButtonStyle: React.CSSProperties = {
  width: '100%',
  background: '#C24B1E',
  color: '#F5F0E8',
  fontFamily: 'monospace',
  fontSize: '10px',
  letterSpacing: '2px',
  textTransform: 'uppercase',
  borderRadius: '3px',
  border: 'none',
  padding: '14px',
  cursor: 'pointer',
}

export default function EditGearPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Camera',
    condition: 'good',
    availability: 'free',
    price_per_day: '',
    location: ''
  })
  const [availabilityWindow, setAvailabilityWindow] = useState({ dateFrom: '', dateTo: '', timeFrom: '', timeTo: '' })
  const [preview, setPreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [isAvailable, setIsAvailable] = useState(true)
  const [togglingPause, setTogglingPause] = useState(false)
  const [pauseMessage, setPauseMessage] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!id) return
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/login')
        return
      }

      const { data: item, error: itemErr } = await supabase
        .from('gear')
        .select('*')
        .eq('id', id)
        .single()

      if (itemErr || !item) {
        setError(itemErr?.message || 'Gear listing not found.')
        setLoading(false)
        return
      }

      if (item.owner_id !== user.id) {
        router.replace(`/gear/${id}`)
        return
      }

      const parsed = extractAvailability(item.description)
      setForm({
        title: item.title || '',
        description: parsed.cleanDescription || '',
        category: item.category || 'Camera',
        condition: item.condition || 'good',
        availability: item.availability || 'free',
        price_per_day: item.price_per_day?.toString() || '',
        location: item.location || ''
      })
      setAvailabilityWindow({
        dateFrom: parsed.availability.dateFrom || '',
        dateTo: parsed.availability.dateTo || '',
        timeFrom: parsed.availability.timeFrom || '',
        timeTo: parsed.availability.timeTo || ''
      })
      setPreview(item.image_url || null)
      setIsAvailable(item.is_available !== false)
      setLoading(false)
    }

    load()
  }, [id, router, supabase])

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    setSaving(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data: currentItem } = await supabase.from('gear').select('owner_id,image_url').eq('id', id).single()
    if (!currentItem || currentItem.owner_id !== user.id) {
      setError('You can only edit your own listing.')
      setSaving(false)
      return
    }

    let image_url = currentItem.image_url || null
    if (imageFile) {
      const ext = imageFile.name.split('.').pop()
      const path = `${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('gear-images').upload(path, imageFile)
      if (!upErr) {
        const { data } = supabase.storage.from('gear-images').getPublicUrl(path)
        image_url = data.publicUrl
      }
    }

    const { error: updErr } = await supabase
      .from('gear')
      .update({
        title: form.title,
        description: withAvailability(form.description, availabilityWindow),
        category: form.category,
        condition: form.condition,
        availability: form.availability,
        price_per_day: form.availability === 'paid' ? parseFloat(form.price_per_day) : null,
        location: form.location || null,
        image_url
      })
      .eq('id', id)
      .eq('owner_id', user.id)

    if (updErr) {
      setError(updErr.message)
      setSaving(false)
      return
    }

    router.push(`/gear/${id}`)
  }

  const togglePause = async () => {
    if (!id) return
    setTogglingPause(true)
    setPauseMessage(null)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const nextAvailable = !isAvailable
    const { error: pauseErr } = await supabase
      .from('gear')
      .update({ is_available: nextAvailable })
      .eq('id', id)
      .eq('owner_id', user.id)

    setTogglingPause(false)
    if (pauseErr) {
      setError(pauseErr.message)
      return
    }

    setIsAvailable(nextAvailable)
    setPauseMessage(nextAvailable ? 'Listing is active again.' : 'Listing paused.')
    setTimeout(() => setPauseMessage(null), 3000)
  }

  if (loading) {
    return <div className="max-w-xl mx-auto px-4 py-12 text-white/50">Loading listing...</div>
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <Link href={`/gear/${id}`} className="text-white/40 hover:text-white text-sm mb-4 inline-block">← Back to listing</Link>
      <h1 className="text-3xl font-bold mb-2">Edit gear listing</h1>
      <p className="text-white/40 mb-8">Update details so other filmmakers see the latest info.</p>

      <form onSubmit={submit} className="space-y-6">
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
          <input required className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea className="input resize-none" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
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
            <label className="label">Price per day (EUR)</label>
            <input type="number" className="input" value={form.price_per_day} onChange={e => setForm({ ...form, price_per_day: e.target.value })} />
          </div>
        )}

        <div>
          <label className="label">Your location</label>
          <input className="input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          style={{
            ...saveButtonStyle,
            background: saving ? '#2E2A26' : '#C24B1E',
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </form>

      <div className="mt-6 border-t border-zinc-800 pt-5 space-y-3">
        <button
          type="button"
          onClick={togglePause}
          disabled={togglingPause}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '3px',
            border: `1px solid ${isAvailable ? '#4A453E' : '#C24B1E'}`,
            color: isAvailable ? '#7A7060' : '#C24B1E',
            background: 'transparent',
            fontFamily: 'monospace',
            fontSize: '10px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            cursor: togglingPause ? 'not-allowed' : 'pointer',
            opacity: togglingPause ? 0.6 : 1,
          }}
        >
          {togglingPause
            ? 'Updating...'
            : isAvailable
              ? '⏸ Pause listing'
              : '▶ Unpause listing'}
        </button>
        <p style={{ fontFamily: 'monospace', color: '#4A453E', fontSize: '10px', margin: 0 }}>
          Paused listings are hidden from the gear grid but not deleted.
        </p>
        {pauseMessage && (
          <p style={{ fontFamily: 'monospace', color: '#C24B1E', fontSize: '10px', margin: 0 }}>
            {pauseMessage}
          </p>
        )}
      </div>

      <DeleteGearButton id={id} />
    </div>
  )
}
