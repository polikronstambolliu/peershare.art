'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function DeleteGearButton({ id }: { id: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const onDelete = async () => {
    const ok = window.confirm('Delete this gear listing? This cannot be undone.')
    if (!ok) return
    setDeleting(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { error: delErr } = await supabase.from('gear').delete().eq('id', id).eq('owner_id', user.id)
    if (delErr) {
      setError(delErr.message)
      setDeleting(false)
      return
    }

    router.push('/gear')
  }

  return (
    <div className="mt-6 border-t border-zinc-800 pt-5">
      <button type="button" onClick={onDelete} disabled={deleting} className="w-full py-3 rounded-xl border border-red-500/50 text-red-300 hover:bg-red-500/10 transition-colors">
        {deleting ? 'Deleting...' : 'Delete listing'}
      </button>
      {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
    </div>
  )
}
