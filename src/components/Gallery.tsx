'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { FiInstagram, FiX, FiChevronLeft, FiChevronRight, FiClock, FiTag } from 'react-icons/fi'
import { getCloudinaryUrl } from '@/lib/config'

interface Service {
  id: string
  name: string
  description: string
  duration: number
  price_min: number
  price_max: number
  category: string
  images: string[]
}

interface GalleryProps {
  services: Service[]
  instagramUrl?: string
}

export default function Gallery({ services, instagramUrl }: GalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [modalIndex, setModalIndex] = useState<number | null>(null)

  // Only services that have at least one image
  const withImages = services.filter(s => s.images.length > 0)

  const categories = ['All', ...Array.from(new Set(withImages.map(s => s.category)))]

  const filtered = selectedCategory === 'All'
    ? withImages
    : withImages.filter(s => s.category === selectedCategory)

  const current = modalIndex !== null ? filtered[modalIndex] : null

  const openModal = (idx: number) => setModalIndex(idx)
  const closeModal = () => setModalIndex(null)

  const prev = useCallback(() => {
    setModalIndex(i => i !== null ? (i - 1 + filtered.length) % filtered.length : null)
  }, [filtered.length])

  const next = useCallback(() => {
    setModalIndex(i => i !== null ? (i + 1) % filtered.length : null)
  }, [filtered.length])

  // Keyboard navigation
  useEffect(() => {
    if (modalIndex === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape') closeModal()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [modalIndex, prev, next])

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = modalIndex !== null ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [modalIndex])

  return (
    <section className="w-full py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">Our Gallery</h2>
          <p className="text-lg text-primary/60 max-w-2xl mx-auto">
            Explore our portfolio of stunning transformations and creative hair designs
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat); setModalIndex(null) }}
              className={`px-5 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
                selectedCategory === cat
                  ? 'bg-accent text-white shadow-md scale-105'
                  : 'bg-secondary/30 text-primary hover:bg-secondary/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mb-12">
          {filtered.map((service, idx) => (
            <div
              key={service.id}
              className="group relative rounded-lg overflow-hidden cursor-pointer shadow hover:shadow-xl transition-all duration-300" style={{ aspectRatio: '4/5' }}
              onClick={() => openModal(idx)}
            >
              <Image
                src={getCloudinaryUrl(service.images[0], 'w_400,h_400,c_fill,q_auto,f_auto')}
                alt={service.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                unoptimized
                onError={(e) => {
                  const slug = service.images[0].split('/').pop()?.replace(/_[a-z0-9]+$/, '') ?? ''
                  ;(e.currentTarget as HTMLImageElement).src = `/assets/images/services/${slug}.jpeg`
                }}
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/55 transition-all duration-300 flex flex-col items-center justify-center p-3">
                <p className="text-white font-bold text-sm text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 leading-tight">
                  {service.name}
                </p>
                <span className="mt-1 text-white/80 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  ${service.price_min}–${service.price_max}
                </span>
              </div>
              {/* Category badge */}
              <div className="absolute top-2 left-2 bg-accent/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {service.category}
              </div>
            </div>
          ))}
        </div>

        {/* Instagram CTA */}
        {instagramUrl && (
          <div className="text-center">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-accent hover:bg-accent/80 text-white font-bold rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
            >
              <FiInstagram className="w-5 h-5" />
              View More on Our IG Page
            </a>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-primary/40 text-lg">No items in this category yet.</div>
        )}
      </div>

      {/* Lightbox Modal */}
      {current && modalIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-3xl bg-primary rounded-xl overflow-hidden shadow-2xl flex flex-col" style={{ maxHeight: '92dvh' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-shrink-0">
              <div>
                <h3 className="text-white font-bold text-lg leading-tight">{current.name}</h3>
                <span className="text-accent text-xs font-semibold">{current.category}</span>
              </div>
              <button
                onClick={closeModal}
                className="text-white/60 hover:text-white transition-colors p-1"
                aria-label="Close"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Image */}
            <div className="relative w-full min-h-0 flex-shrink" style={{ aspectRatio: '4/3' }}>
              <Image
                src={getCloudinaryUrl(current.images[0], 'w_900,h_675,c_fill,q_auto,f_auto')}
                alt={current.name}
                fill
                sizes="(max-width: 768px) 100vw, 900px"
                className="object-cover"
                unoptimized
                priority
              />
              {/* Prev / Next arrows */}
              {filtered.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition-all"
                    aria-label="Previous"
                  >
                    <FiChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition-all"
                    aria-label="Next"
                  >
                    <FiChevronRight className="w-6 h-6" />
                  </button>
                  <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {modalIndex + 1} / {filtered.length}
                  </div>
                </>
              )}
            </div>

            {/* Details */}
            <div className="px-5 py-4 overflow-y-auto flex-shrink-0 bg-primary">
              <p className="text-white/70 text-sm mb-4 leading-relaxed">{current.description}</p>
              <div className="flex items-center gap-5 flex-wrap">
                <div className="flex items-center gap-1.5 text-accent font-bold text-base">
                  <FiTag className="w-4 h-4" />
                  ${current.price_min}–${current.price_max}
                </div>
                <div className="flex items-center gap-1.5 text-white/50 text-sm">
                  <FiClock className="w-4 h-4" />
                  {current.duration} min
                </div>
              </div>
            </div>

            {/* Dot indicators */}
            {filtered.length > 1 && (
              <div className="flex justify-center gap-1.5 pb-4 flex-shrink-0 bg-primary">
                {filtered.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setModalIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      i === modalIndex ? 'bg-accent scale-125' : 'bg-white/30 hover:bg-white/60'
                    }`}
                    aria-label={`Go to ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
