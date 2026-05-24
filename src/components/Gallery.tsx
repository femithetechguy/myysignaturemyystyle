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
  const gallery = config.content?.gallery
  const items: GalleryItem[] = (gallery?.items ?? []).filter(
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
        <div className="text-center mb-8 sm:mb-10">
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary/40 mb-2">Our Work</p>
          <h2 className="text-3xl font-bold sm:text-4xl text-primary mb-3">{gallery?.title}</h2>
          <p className="text-base text-primary/60 max-w-xl mx-auto">{gallery?.description}</p>
        </div>

        {items.length > 0 ? (
          <>
            {/* Mobile: horizontal snap-scroll strip */}
            <div className="sm:hidden relative">
            <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="snap-start flex-none relative rounded-xl overflow-hidden cursor-pointer shadow-md active:scale-95 transition-transform duration-150"
                  style={{ width: '68vw', aspectRatio: '3/4' }}
                  onClick={() => setModalIndex(idx)}
                >
                  <Image
                    src={item.image}
                    alt={item.title ?? 'Gallery photo'}
                    fill
                    sizes="68vw"
                    className="object-cover object-top"
                    unoptimized
                  />
                  {item.title && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pt-8 pb-3 px-3">
                      <p className="text-white font-semibold text-sm drop-shadow">{item.title}</p>
                    </div>
                  )}
                </div>
              ))}
              {/* Trailing spacer so last card isn't flush against edge */}
              <div className="flex-none w-4" />
            </div>
            {/* Right-edge fade hint */}
            <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none" />
            </div>

            {/* Desktop: grid */}
            <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mb-10">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="group relative rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
                  style={{ aspectRatio: '3/4' }}
                  onClick={() => setModalIndex(idx)}
                >
                  <Image
                    src={item.image}
                    alt={item.title ?? 'Gallery photo'}
                    fill
                    sizes="(max-width: 1024px) 33vw, 25vw"
                    className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
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
          /* Empty state */
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
          <div className="text-center mt-8 sm:mt-0">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-white font-semibold text-sm transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
              style={{ background: 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)' }}
            >
              <FiInstagram className="w-4 h-4" />
              See More on Instagram
            </a>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {current && modalIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setModalIndex(null)}
        >
          <div
            className="relative w-full max-w-sm sm:max-w-md rounded-2xl overflow-hidden shadow-2xl bg-primary"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <p className="text-white font-bold text-sm truncate pr-3">{current.title ?? 'Photo'}</p>
              <div className="flex items-center gap-3 flex-shrink-0">
                {items.length > 1 && (
                  <span className="text-white/50 text-xs font-medium">{modalIndex + 1} / {items.length}</span>
                )}
                <button onClick={() => setModalIndex(null)} className="text-white/60 hover:text-white transition-colors p-1 -mr-1">
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Image — fixed height so it always renders */}
            <div className="relative w-full" style={{ height: '65dvh' }}>
              <Image
                src={current.image}
                alt={current.title ?? 'Gallery photo'}
                fill
                sizes="(max-width: 640px) 100vw, 448px"
                className="object-contain"
                unoptimized
                priority
              />

              {/* Nav arrows */}
              {items.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 text-white rounded-full p-2.5 transition-all"
                  >
                    <FiChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/90 text-white rounded-full p-2.5 transition-all"
                  >
                    <FiChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Dot navigation */}
            {items.length > 1 && (
              <div className="px-4 py-3 bg-primary">
                <div className="flex justify-center gap-1.5 flex-wrap">
                  {items.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setModalIndex(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${i === modalIndex ? 'bg-accent scale-125' : 'bg-white/30 hover:bg-white/60'}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
