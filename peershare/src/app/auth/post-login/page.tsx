'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const SESSION_TIMEOUT_MS = 7000
const FALLBACK_REDIRECT_MS = 9000

export default function PostLoginPage() {
  const router = useRouter()
  const [message, setMessage] = useState('Finishing login...')

  useEffect(() => {
    let cancelled = false

    const resolveSession = async () => {
      const supabase = createClient()
      const fallbackTimer = setTimeout(() => {
        if (cancelled) return
        setMessage('Still working... redirecting now.')
        router.replace('/?login=fallback')
      }, FALLBACK_REDIRECT_MS)

      try {
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Session check timed out')), SESSION_TIMEOUT_MS)
        )

        const { data, error } = await Promise.race([sessionPromise, timeoutPromise])
        if (cancelled) return

        if (error) {
          console.error('Post-login session error:', error.message)
          setMessage('Session error. Sending you back...')
          router.replace('/login?error=session')
          return
        }

        if (!data.session) {
          setMessage('No session found. Sending you back...')
          router.replace('/login?error=no-session')
          return
        }

        router.replace('/?login=ok')
      } catch (err) {
        if (cancelled) return
        console.error('Post-login timeout/error:', err)
        setMessage('Login took too long. Redirecting...')
        router.replace('/?login=timeout')
      } finally {
        clearTimeout(fallbackTimer)
      }
    }

    resolveSession()
    return () => {
      cancelled = true
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-xl font-semibold mb-2">Signing you in</h1>
        <p className="text-white/50 text-sm">{message}</p>
      </div>
    </div>
  )
}
