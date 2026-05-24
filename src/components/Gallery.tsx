'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { FiInstagram, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { getAppConfig } from '@/lib/config'

interface GalleryItem {
  id: string
  title?: string
  image: string
  description?: string
}

interface GalleryProps {
  instagramUrl?: string
}

export default function Gallery({ instagramUrl }: GalleryProps) {
  const config = getAppConfig()
  const items: GalleryItem[] = (config.content.gallery.items ?? []).filter(
    (item: GalleryItem) => item.image && !item.image.startsWith('/assets/images/portfolio')
  )

  const [modalIndex, setModalIndex] = useState<number | null>(null)
  const current = modalIndex !== null ? items[modalIndex] : null

  const prev = useCallback(() => {
    setModalIndex(i => i !== null ? (i - 1 + items.length) % items.length : null)
  }, [items.length])

  const next = useCallback(() => {
    setModalIndex(i => i !== null ? (i + 1) % items.length : null)
  }, [items.length])

  useEffect(() => {
    if (modalIndex === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape') setModalIndex(null)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [modalIndex, prev, next])

  useEffect(() => {
    document.body.style.overflow = modalIndex !== null ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [modalIndex])

  return (
    <section className="w-full py-10 sm:py-14 bg-white">
      <div className="container-custom">

        {/* Section Header */}
        <div className="text-center mb-10">
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary/40 mb-2">Our Work</p>
          <h2 className="text-3xl font-bold sm:text-4xl text-primary mb-3">{config.content.gallery.title}</h2>
          <p className="text-base text-primary/60 max-w-xl mx-auto">{config.content.gallery.description}</p>
        </div>

        {items.length > 0 ? (
          <>
            {/* Photo Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mb-10">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="group relative rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
                  style={{ aspectRatio: '4/5' }}
                  onClick={() => setModalIndex(idx)}
                >
                  <Image
                    src={item.image}
                    alt={item.title ?? 'Gallery photo'}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-end p-3">
                    {item.title && (
                      <p className="text-white font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg">
                        {item.title}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Empty state — photos coming soon */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
              <FiInstagram className="w-7 h-7 text-accent" />
            </div>
            <p className="text-lg font-bold text-primary mb-1">Photos coming soon</p>
            <p className="text-sm text-primary/50 mb-6 max-w-xs">We're building our portfolio. In the meantime, follow us on Instagram to see our latest work.</p>
          </div>
        )}

        {/* Instagram CTA */}
        {instagramUrl && (
          <div className="text-center">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-accent text-accent font-semibold text-sm hover:bg-accent hover:text-white transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <FiInstagram className="w-4 h-4" />
              See more on Instagram
            </a>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {current && modalIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setModalIndex(null)}
        >
          <div
            className="relative w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl flex flex-col bg-primary"
            style={{ maxHeight: '92dvh' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 flex-shrink-0">
              <p className="text-white font-bold text-base">{current.title ?? 'Photo'}</p>
              <button onClick={() => setModalIndex(null)} className="text-white/60 hover:text-white transition-colors p-1">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Image */}
            <div className="relative w-full flex-1 min-h-0" style={{ aspectRatio: '4/3' }}>
              <Image
                src={current.image}
                alt={current.title ?? 'Gallery photo'}
                fill
                sizes="(max-width: 768px) 100vw, 672px"
                className="object-cover"
                unoptimized
                priority
              />
              {items.length > 1 && (
                <>
                  <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition-all">
                    <FiChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition-all">
                    <FiChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {modalIndex + 1} / {items.length}
                  </div>
                </>
              )}
            </div>

            {/* Description + dots */}
            {(current.description || items.length > 1) && (
              <div className="px-5 py-3 flex-shrink-0 bg-primary space-y-3">
                {current.description && <p className="text-white/60 text-sm">{current.description}</p>}
                {items.length > 1 && (
                  <div className="flex justify-center gap-1.5">
                    {items.map((_, i) => (
                      <button key={i} onClick={() => setModalIndex(i)}
                        className={`w-2 h-2 rounded-full transition-all duration-200 ${i === modalIndex ? 'bg-accent scale-125' : 'bg-white/30 hover:bg-white/60'}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
