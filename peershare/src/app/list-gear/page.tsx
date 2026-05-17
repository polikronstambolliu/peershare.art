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

const MAX_GEAR_IMAGES = 5

const AI_CONDITION_MAP: Record<string, string> = {
  'New': 'excellent',
  'Like New': 'excellent',
  'Good': 'good',
  'Fair': 'fair',
  'Poor': 'fair',
}

async function filesToBase64(files: File[]): Promise<{ mediaType: string; data: string }[]> {
  return Promise.all(
    files.map(
      file =>
        new Promise<{ mediaType: string; data: string }>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            const result = reader.result as string
            const [, base64] = result.split(',')
            resolve({
              mediaType: file.type || 'image/jpeg',
              data: base64,
            })
          }
          reader.onerror = () => reject(new Error('Failed to read image'))
          reader.readAsDataURL(file)
        })
    )
  )
}

export default function ListGearPage() {
  const router = useRouter()
  const supabase = createClient()
  const [form, setForm] = useState({ title: '', description: '', category: 'Camera', condition: 'good', availability: 'free', price_per_day: '', location: '' })
  const [availabilityWindow, setAvailabilityWindow] = useState({ dateFrom: '', dateTo: '', timeFrom: '', timeTo: '' })
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [analysing, setAnalysing] = useState(false)
  const [analyseSuccess, setAnalyseSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? [])
    if (!picked.length) return
    setAnalyseSuccess(false)
    setImageFiles(prev => {
      const next = [...prev, ...picked].slice(0, MAX_GEAR_IMAGES)
      setPreviews(current => {
        current.forEach(url => URL.revokeObjectURL(url))
        return next.map(file => URL.createObjectURL(file))
      })
      return next
    })
    e.target.value = ''
  }

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
    setAnalyseSuccess(false)
  }

  const analyseGear = async () => {
    if (!imageFiles.length) return
    setAnalysing(true)
    setAnalyseSuccess(false)
    setError('')

    try {
      const images = await filesToBase64(imageFiles)
      const res = await fetch('/api/analyse-gear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Analysis failed.')
        return
      }

      const { title, category, condition, description } = data.analysis ?? {}
      const mappedCondition = AI_CONDITION_MAP[condition] ?? 'good'
      const mappedCategory = CATEGORIES.includes(category) ? category : 'Other'

      setForm(prev => ({
        ...prev,
        title: typeof title === 'string' ? title : prev.title,
        category: mappedCategory,
        condition: mappedCondition,
        description: typeof description === 'string' ? description : prev.description,
      }))
      setAnalyseSuccess(true)
    } catch {
      setError('Analysis failed. Please try again.')
    } finally {
      setAnalysing(false)
    }
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const image_urls: string[] = []
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i]
      const ext = file.name.split('.').pop()
      const path = `${Date.now()}-${i}.${ext}`
      const { error: upErr } = await supabase.storage.from('gear-images').upload(path, file)
      if (!upErr) {
        const { data } = supabase.storage.from('gear-images').getPublicUrl(path)
        image_urls.push(data.publicUrl)
      }
    }
    const image_url = image_urls[0] ?? null

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
      image_urls: image_urls.length ? image_urls : null,
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
          <label className="label">Photos (up to {MAX_GEAR_IMAGES})</label>
          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {previews.map((src, index) => (
                <div key={src} className="relative card aspect-square overflow-hidden">
                  <img src={src} className="w-full h-full object-cover" alt={`Preview ${index + 1}`} />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 w-6 h-6 rounded bg-black/70 text-white text-xs leading-none"
                    aria-label={`Remove photo ${index + 1}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          {imageFiles.length < MAX_GEAR_IMAGES && (
            <label className="block cursor-pointer">
              <div className="card h-32 flex items-center justify-center overflow-hidden hover:border-[#C24B1E]/40 transition-colors border-dashed">
                <div className="text-center text-white/30">
                  <div className="text-3xl mb-2">📷</div>
                  <p className="text-sm">
                    {imageFiles.length === 0 ? 'Click to add photos' : `Add more (${imageFiles.length}/${MAX_GEAR_IMAGES})`}
                  </p>
                </div>
              </div>
              <input type="file" accept="image/*" multiple onChange={handleImages} className="hidden" />
            </label>
          )}
          {imageFiles.length > 0 && (
            <div className="mt-3 space-y-2">
              <button
                type="button"
                onClick={analyseGear}
                disabled={analysing}
                style={{
                  border: '1px solid #E8B800',
                  color: '#E8B800',
                  background: 'transparent',
                  fontFamily: 'monospace',
                  fontSize: '9px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  padding: '8px 16px',
                  borderRadius: '3px',
                  cursor: analysing ? 'not-allowed' : 'pointer',
                  opacity: analysing ? 0.7 : 1,
                }}
              >
                {analysing ? 'Analysing...' : '✦ Analyse gear with AI'}
              </button>
              {analyseSuccess && (
                <p style={{ fontFamily: 'monospace', fontSize: '9px', color: '#1D5C45', margin: 0 }}>
                  ✓ Fields filled — review and edit before sharing
                </p>
              )}
            </div>
          )}
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
