import { createServerSupabase } from '@/lib/supabase-server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ContactButton from '@/app/gear/[id]/ContactButton'

export default async function HelpRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerSupabase()
  const { data: req } = await supabase.from('help_requests').select('*, profiles(id, username, full_name, bio, karma, location)').eq('id', id).single()
  if (!req) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  const author = req.profiles as any

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/help-board" className="text-white/40 hover:text-white text-sm mb-6 inline-block">← Help Board</Link>

      <div className="card p-6 mb-6">
        <div className="flex items-start gap-3 mb-4">
          <span className={`badge ${req.is_paid ? 'badge-yellow' : 'badge-green'}`}>{req.is_paid ? 'Paid' : 'Volunteer'}</span>
          <span className="badge badge-gray">{req.type}</span>
          {!req.is_open && <span className="badge bg-red-900/40 text-red-400">Closed</span>}
        </div>

        <h1 className="text-3xl font-bold mb-4">{req.title}</h1>
        <p className="text-white/70 leading-relaxed mb-6">{req.description}</p>

        <div className="flex flex-wrap gap-4 text-sm text-white/40 border-t border-zinc-800 pt-4">
          {req.location && <span>📍 {req.location}</span>}
          {req.date_from && <span>📅 {req.date_from}{req.date_to && req.date_to !== req.date_from ? ` → ${req.date_to}` : ''}</span>}
        </div>

        {req.skills_needed?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {req.skills_needed.map((s: string) => <span key={s} className="badge badge-blue">{s}</span>)}
          </div>
        )}
      </div>

      {/* Author card */}
      <div className="card p-5 mb-6">
        <p className="text-xs text-white/40 mb-3">Posted by</p>
        <Link href={`/profile/${author?.username}`} className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center text-black font-bold text-lg">
            {author?.full_name?.[0]?.toUpperCase() || author?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold">{author?.full_name || author?.username}</p>
            <p className="text-xs text-yellow-400">⭐ {author?.karma ?? 0} karma</p>
            {author?.location && <p className="text-xs text-white/40">📍 {author.location}</p>}
          </div>
        </Link>
      </div>

      {user && user.id !== author?.id && req.is_open && (
        <ContactButton ownerId={author?.id} ownerName={author?.full_name || author?.username} gearId={req.id} gearTitle={req.title} />
      )}
      {!user && <Link href="/login" className="btn-primary w-full text-center block">Log in to offer help</Link>}
    </div>
  )
}
