'use client'

export default function ClapperboardStripe({ pageId }: { pageId: string }) {
  const smId = `clapper-sm-${pageId}`
  const lgId = `clapper-lg-${pageId}`

  return (
    <div style={{ width: '100%', lineHeight: 0 }}>
      <svg
        width="100%"
        height="20"
        viewBox="0 0 800 20"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        className="block sm:hidden"
      >
        <defs>
          <pattern id={smId} x="0" y="0" width="40" height="20" patternUnits="userSpaceOnUse">
            <rect width="40" height="20" fill="#3A3530"/>
            <polygon points="0,0 20,0 40,20 20,20" fill="#1A1714"/>
          </pattern>
        </defs>
        <rect width="800" height="20" fill={`url(#${smId})`} opacity="1"/>
      </svg>

      <svg
        width="100%"
        height="32"
        viewBox="0 0 800 32"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        className="hidden sm:block"
      >
        <defs>
          <pattern id={lgId} x="0" y="0" width="64" height="32" patternUnits="userSpaceOnUse">
            <rect width="64" height="32" fill="#3A3530"/>
            <polygon points="0,0 32,0 64,32 32,32" fill="#1A1714"/>
          </pattern>
        </defs>
        <rect width="800" height="32" fill={`url(#${lgId})`} opacity="1"/>
      </svg>
    </div>
  )
}
