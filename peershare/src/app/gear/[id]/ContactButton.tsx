'use client'
import { useState } from 'react'
import CoffeeBanner from '@/components/CoffeeBanner'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ContactButton({ ownerId, ownerName, gearId, gearTitle }: {
  ownerId: string, ownerName: string, gearId: number, gearTitle: string
}) {
  const [open, setOpen] = useState(false)
  const [msg, setMsg] = useState(`Hi! I'd love to borrow your "${gearTitle}". Is it available?`)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const send = async () => {
    setSending(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    await supabase.from('messages').insert({ sender_id: user.id, receiver_id: ownerId, gear_id: gearId, content: msg })
    setSent(true)
    setSending(false)
  }

  if (sent) return (
    <div className="space-y-4">
      <div className="bg-green-900/30 border border-green-800 rounded-xl p-4 text-green-400 text-sm text-center">
        Message sent to {ownerName}! ✓
      </div>
      <CoffeeBanner />
    </div>
  )

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary w-full">Contact {ownerName}</button>
      {open && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-bold mb-4">Send a message</h3>
            <textarea
              value={msg}
              onChange={e => setMsg(e.target.value)}
              rows={4}
              className="input resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setOpen(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={send} disabled={sending} className="btn-primary flex-1">{sending ? 'Sending…' : 'Send'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
