import { useState } from 'react';
import { useConfig } from '../hooks/useConfig';

export default function Gallery({ showAll = false, limit = 6 }) {
  const config = useConfig();
  const gallery = config?.gallery;
  
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedImage, setSelectedImage] = useState(null);

  if (!gallery?.items?.length) return null;

  const categories = gallery.categories || ['All'];
  
  const filteredItems = activeCategory === 'All' 
    ? gallery.items 
    : gallery.items.filter(item => item.category === activeCategory);

  const displayItems = showAll ? filteredItems : filteredItems.slice(0, limit);

  return (
    <section id="gallery" className="py-16 sm:py-20 bg-light">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="section-title animate-fade-in-up">{gallery.title}</h2>
          <p className="section-subtitle animate-fade-in-up">{gallery.description}</p>
        </div>

        {/* Category Tabs */}
        {showAll && categories.length > 1 && (
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center mb-12">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-300 text-sm sm:text-base ${
                  activeCategory === cat
                    ? 'bg-secondary text-primary shadow-lg scale-105'
                    : 'bg-white text-primary hover:bg-secondary/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {displayItems.map((item, index) => (
            <div 
              key={item.id} 
              className="group cursor-pointer animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => setSelectedImage(item)}
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = '/images/placeholder.svg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4 sm:p-6">
                  <h3 className="text-lg font-bold text-white">{item.title}</h3>
                  {item.description && (
                    <p className="text-sm text-white/80">{item.description}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {!showAll && gallery.items.length > limit && (
          <div className="text-center mt-12">
            <a href="/gallery" className="btn-accent hover:scale-105 active:scale-95">
              View Full Gallery
            </a>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            <button 
              className="absolute -top-10 right-0 text-white hover:text-secondary text-4xl transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              ×
            </button>
            <img 
              src={selectedImage.image} 
              alt={selectedImage.title}
              className="max-w-full max-h-[80vh] object-contain rounded"
            />
            <div className="text-center mt-4 text-white">
              <h3 className="text-xl font-bold mb-1">{selectedImage.title}</h3>
              {selectedImage.description && (
                <p className="text-white/70">{selectedImage.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
