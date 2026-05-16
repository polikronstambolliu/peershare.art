'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const ALL_SKILLS = [
  'Camera Op', 'Camera Assistant', 'Director', 'Sound', 'Boom Op',
  'Gaffer', 'Grip', 'Editor', 'Colorist', 'PA', 'Actor', 'Driver',
  'DIT', 'Photographer', 'VFX', 'Drone Op', 'Writer', 'Producer',
  'Script Supervisor', 'Make-up', 'Art Director', 'Set Designer'
]

export default function EditProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({ full_name: '', bio: '', location: '' })
  const [skills, setSkills] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (profile) {
        setForm({ full_name: profile.full_name || '', bio: profile.bio || '', location: profile.location || '' })
        setSkills(profile.skills || [])
        setUsername(profile.username)
        setAvatarUrl(profile.avatar_url || null)
      }
      setLoading(false)
    }
    load()
  }, [])

  const toggleSkill = (s: string) => setSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let newAvatarUrl = avatarUrl
    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop()
      const path = `avatars/${user.id}.${ext}`
      const { error: upErr } = await supabase.storage.from('gear-images').upload(path, avatarFile, { upsert: true })
      if (!upErr) {
        const { data } = supabase.storage.from('gear-images').getPublicUrl(path)
        newAvatarUrl = data.publicUrl
      }
    }

    await supabase.from('profiles').update({
      full_name: form.full_name,
      bio: form.bio,
      location: form.location,
      skills,
      avatar_url: newAvatarUrl
    }).eq('id', user.id)

    router.push(`/profile/${username}`)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white/40">Loading…</div>

  const displayAvatar = avatarPreview || avatarUrl
  const initial = form.full_name?.[0]?.toUpperCase() || username?.[0]?.toUpperCase() || '?'

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Edit profile</h1>
      <p className="text-white/40 mb-8">Tell the community who you are and what you do.</p>

      <form onSubmit={save} className="space-y-6">
        {/* Avatar upload */}
        <div>
          <label className="label">Profile photo</label>
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => fileRef.current?.click()}
              className="relative w-20 h-20 rounded-full overflow-hidden bg-yellow-400 flex items-center justify-center hover:opacity-80 transition-opacity group">
              {displayAvatar
                ? <img src={displayAvatar} className="w-full h-full object-cover" alt="avatar" />
                : <span className="text-black font-bold text-2xl">{initial}</span>}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-xs font-medium">Change</span>
              </div>
            </button>
            <div>
              <button type="button" onClick={() => fileRef.current?.click()}
                className="btn-secondary text-xs">Upload photo</button>
              <p className="text-xs text-white/30 mt-1">JPG or PNG, max 5MB</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
          </div>
        </div>

        <div>
          <label className="label">Full name</label>
          <input className="input" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
        </div>

        <div>
          <label className="label">Bio</label>
          <textarea className="input resize-none" rows={4}
            placeholder="Who are you? What do you make? What gear do you have?"
            value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
        </div>

        <div>
          <label className="label">Location</label>
          <input className="input" placeholder="City" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
        </div>

        <div>
          <label className="label">Your skills</label>
          <div className="flex flex-wrap gap-2">
            {ALL_SKILLS.map(s => (
              <button type="button" key={s} onClick={() => toggleSkill(s)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                  skills.includes(s)
                    ? 'bg-yellow-400 text-black border-yellow-400 font-medium'
                    : 'border-zinc-700 text-white/50 hover:border-white/30 hover:text-white'
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full py-3 text-base">
          {saving ? 'Saving…' : 'Save profile'}
        </button>
      </form>
    </div>
  )
}
