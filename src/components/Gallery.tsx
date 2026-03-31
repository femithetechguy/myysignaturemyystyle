'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { FiInstagram } from 'react-icons/fi'

// Extend Window type for Instagram embed
declare global {
  interface Window {
    instgrm?: {
      Embeds?: {
        process: () => void
      }
    }
  }
}

interface GalleryItem {
  id: string
  title: string
  category: string
  image: string
  description: string
}

interface GalleryItemDisplay extends GalleryItem {
  postUrl?: string
}

interface GalleryProps {
  items: GalleryItem[]
  instagramUrl?: string
  posts?: Array<{ id: string; image: string; postUrl: string }>
}

export default function Gallery({ items, instagramUrl, posts = [] }: GalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedPost, setSelectedPost] = useState<{ id: string; image: string; postUrl: string } | null>(null)

  // Process Instagram embeds when modal opens
  useEffect(() => {
    if (selectedPost && window.instgrm?.Embeds?.process) {
      window.instgrm.Embeds.process()
    }
  }, [selectedPost])

  // Get unique categories from items
  const categories = ['All', ...Array.from(new Set(items.map(item => item.category)))]

  // Filter items based on selected category
  const filteredItems = selectedCategory === 'All' 
    ? items 
    : items.filter(item => item.category === selectedCategory)

  // Limit display to 6 items
  const displayItems = filteredItems.slice(0, 6)
  
  // Use posts if available, otherwise convert items to post format with optional fields
  const galleryItems: GalleryItemDisplay[] = posts.length > 0 
    ? posts.map(post => ({ ...post, title: '', category: '', description: '' }))
    : displayItems

  return (
    <section className="w-full py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#2a2420] mb-4">
            Our Gallery
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our portfolio of stunning transformations and creative hair designs
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {items.length > 0 && categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-[#a89880] text-white shadow-lg scale-105'
                  : 'bg-gray-200 text-[#2a2420] hover:bg-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10 mb-12">
          {galleryItems.map(item => (
            <div
              key={item.id}
              className="group rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
              onClick={() => setSelectedPost({ id: item.id, image: item.image, postUrl: item.postUrl || '' })}
            >
              {/* Image Container */}
              <div className="relative w-full aspect-[9/16] bg-gray-200 overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.id}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    // Fallback if image doesn't load
                    const imgElement = e.currentTarget
                    imgElement.style.display = 'none'
                  }}
                />
                {/* Overlay with Play Button for Instagram Posts */}
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
                {posts.length > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white rounded-full p-4 opacity-80 group-hover:opacity-100 transition-opacity">
                      <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Content - Only show for non-post items */}
              {posts.length === 0 && item.title && (
                <div className="p-6 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-[#2a2420]">
                      {item.title}
                    </h3>
                    {item.category && (
                      <span className="text-sm font-semibold text-[#a89880] bg-amber-50 px-3 py-1 rounded-full">
                        {item.category}
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-gray-600 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* View More on Instagram */}
        {posts.length > 0 && instagramUrl && (
          <div className="text-center">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#a89880] hover:bg-[#9a8870] text-white font-bold rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
            >
              <FiInstagram className="w-6 h-6" />
              View More on Our IG Page
            </a>
          </div>
        )}

        {/* Empty State */}
        {galleryItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">
              No gallery items found
            </p>
          </div>
        )}
      </div>

      {/* Instagram Post Modal */}
      {selectedPost && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPost(null)}
        >
          <div 
            className="bg-black rounded-lg shadow-2xl w-full max-w-sm h-[90vh] overflow-hidden flex flex-col animate-fade-in-down"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#2a2420] text-white p-4 flex justify-between items-center border-b border-[#a89880]">
              <h2 className="text-xl font-bold">Instagram Post</h2>
              <button
                onClick={() => setSelectedPost(null)}
                className="text-white/70 hover:text-white transition-colors text-3xl font-bold leading-none"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 relative flex items-center justify-center bg-black overflow-y-auto">
              {/* Instagram Embed */}
              {selectedPost.postUrl && (
                <blockquote
                  className="instagram-media"
                  data-instgrm-permalink={selectedPost.postUrl}
                  data-instgrm-version="14"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
