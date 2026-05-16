'use client'
import { useLang } from '@/lib/useLang'

export default function LangSwitcher() {
  const [lang, setLang] = useLang()
  return (
    <div className="flex items-center gap-1 border border-zinc-700 rounded-lg overflow-hidden text-xs">
      <button
        onClick={() => setLang('en')}
        className={`px-2.5 py-1.5 transition-colors ${lang === 'en' ? 'bg-yellow-400 text-black font-semibold' : 'text-white/50 hover:text-white'}`}>
        EN
      </button>
      <button
        onClick={() => setLang('de')}
        className={`px-2.5 py-1.5 transition-colors ${lang === 'de' ? 'bg-yellow-400 text-black font-semibold' : 'text-white/50 hover:text-white'}`}>
        DE
      </button>
    </div>
  )
}
