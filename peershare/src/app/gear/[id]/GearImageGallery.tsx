'use client'

import { useState } from 'react'

export default function GearImageGallery({ images, title }: { images: string[]; title: string }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const active = images[activeIndex]

  if (!images.length) {
    return (
      <div className="card aspect-square overflow-hidden">
        <div className="w-full h-full flex items-center justify-center text-6xl text-white/10">🎬</div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="card aspect-square overflow-hidden">
        <img src={active} alt={title} className="w-full h-full object-cover" />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((url, index) => (
            <button
              key={url}
              type="button"
              onClick={() => setActiveIndex(index)}
              className="shrink-0 rounded overflow-hidden border transition-colors"
              style={{
                width: '72px',
                height: '72px',
                borderColor: index === activeIndex ? '#C24B1E' : '#2E2A26',
                opacity: index === activeIndex ? 1 : 0.7,
              }}
              aria-label={`View image ${index + 1}`}
              aria-current={index === activeIndex}
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
