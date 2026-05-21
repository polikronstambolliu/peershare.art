'use client'

export default function ClapperboardStripe({ pageId }: { pageId: string }) {
  const smId = `clapper-sm-${pageId}`
  const lgId = `clapper-lg-${pageId}`

  return (
    <div style={{ width: '100%', lineHeight: 0 }}>
      <svg
        width="100%"
        height="22"
        viewBox="0 0 800 22"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        className="block sm:hidden"
      >
        <defs>
          <pattern id={smId} x="0" y="0" width="44" height="22" patternUnits="userSpaceOnUse">
            <rect width="44" height="22" fill="#111009"/>
            <polygon points="0,0 11,0 22,22 11,22" fill="#3A3530"/>
            <polygon points="22,0 33,0 44,22 33,22" fill="#3A3530"/>
          </pattern>
        </defs>
        <rect width="800" height="22" fill={`url(#${smId})`} opacity="1"/>
      </svg>

      <svg
        width="100%"
        height="36"
        viewBox="0 0 800 36"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        className="hidden sm:block"
      >
        <defs>
          <pattern id={lgId} x="0" y="0" width="72" height="36" patternUnits="userSpaceOnUse">
            <rect width="72" height="36" fill="#111009"/>
            <polygon points="0,0 18,0 36,36 18,36" fill="#3A3530"/>
            <polygon points="36,0 54,0 72,36 54,36" fill="#3A3530"/>
          </pattern>
        </defs>
        <rect width="800" height="36" fill={`url(#${lgId})`} opacity="1"/>
      </svg>
    </div>
  )
}
