'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const CATEGORIES = ['Camera', 'Lens', 'Lighting', 'Audio', 'Support', 'Monitor', 'Other']
const CONDITIONS = [{ v: 'excellent', l: 'Excellent — like new' }, { v: 'good', l: 'Good — minor signs of use' }, { v: 'fair', l: 'Fair — visible wear, fully functional' }]

export default function SellGearPage() {
  const router = useRouter()
  const supabase = createClient()
  const [form, setForm] = useState({ title: '', description: '', category: 'Camera', condition: 'good', price: '', location: '' })
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
      const path = `market-${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('gear-images').upload(path, imageFile)
      if (!upErr) {
        const { data } = supabase.storage.from('gear-images').getPublicUrl(path)
        image_url = data.publicUrl
      }
    }

    const { error: err } = await supabase.from('gear_market').insert({
      seller_id: user.id,
      title: form.title,
      description: form.description || null,
      category: form.category,
      condition: form.condition,
      price: parseFloat(form.price),
      location: form.location || null,
      image_url,
    })

    if (err) { setError(err.message); setSaving(false); return }
    router.push('/market')
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Sell your gear</h1>
      <p className="text-white/40 mb-8">Sell to someone in the community — people who will actually appreciate it.</p>

      <form onSubmit={submit} className="space-y-6">
        <div>
          <label className="label">Photo</label>
          <label className="block cursor-pointer">
            <div className={`card h-44 flex items-center justify-center overflow-hidden hover:border-yellow-400/40 transition-colors ${preview ? '' : 'border-dashed'}`}>
              {preview ? <img src={preview} className="w-full h-full object-cover" alt="preview" /> : <div className="text-center text-white/30"><div className="text-3xl mb-2">📷</div><p className="text-sm">Click to add a photo</p></div>}
            </div>
            <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
          </label>
        </div>

        <div>
          <label className="label">What are you selling? *</label>
          <input required className="input" placeholder="e.g. Sony a7III with 28-70mm kit lens" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea className="input resize-none" rows={3} placeholder="What's included, any issues, reason for selling…" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Price (€) *</label>
            <input required type="number" className="input" placeholder="e.g. 800" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
          </div>
        </div>

        <div>
          <label className="label">Condition</label>
          <select className="input" value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })}>
            {CONDITIONS.map(c => <option key={c.v} value={c.v}>{c.l}</option>)}
          </select>
        </div>

        <div>
          <label className="label">Your location</label>
          <input className="input" placeholder="City" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button type="submit" disabled={saving} className="btn-primary w-full py-3 text-base">{saving ? 'Listing…' : 'List for sale'}</button>
      </form>
    </div>
  )
}
