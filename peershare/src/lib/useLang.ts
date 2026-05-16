'use client'
import { useState, useEffect } from 'react'
import type { Lang } from './translations'

export function useLang(): [Lang, (l: Lang) => void] {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    const stored = localStorage.getItem('peershare_lang') as Lang
    if (stored === 'de' || stored === 'en') setLangState(stored)
  }, [])

  const setLang = (l: Lang) => {
    localStorage.setItem('peershare_lang', l)
    setLangState(l)
    window.location.reload()
  }

  return [lang, setLang]
}
