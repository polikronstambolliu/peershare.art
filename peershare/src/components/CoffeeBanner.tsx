'use client'
export default function CoffeeBanner({ compact = false }: { compact?: boolean }) {
  const kofiUrl = 'https://ko-fi.com/peershare'

  if (compact) return (
    <a href={kofiUrl} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-2 text-xs text-white/40 hover:text-yellow-400 transition-colors">
      <span>☕</span>
      <span>Buy us a coffee</span>
    </a>
  )

  return (
    <div className="border border-yellow-400/20 bg-yellow-400/5 rounded-2xl p-6 text-center">
      <div className="text-3xl mb-3">☕</div>
      <h3 className="font-bold text-lg mb-2 text-white">
        You just saved a rental house fee.
      </h3>
      <p className="text-white/50 text-sm mb-5 max-w-sm mx-auto">
        PeerShare is free, community-run, and has no investors or ads.
        If it helped you, a coffee keeps the lights on.
      </p>
      <a href={kofiUrl} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-yellow-400 text-black font-semibold px-6 py-3 rounded-xl hover:bg-yellow-300 transition-colors text-sm">
        <span>☕</span>
        <span>Sure, I'll buy a coffee</span>
      </a>
      <p className="text-white/20 text-xs mt-3">No pressure. Ever.</p>
    </div>
  )
}
