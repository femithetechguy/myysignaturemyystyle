import { useState } from 'react';
import { useConfig } from '../hooks/useConfig';

export default function Services({ showAll = false, limit = 4 }) {
  const config = useConfig();
  const services = config?.services;
  const section = config?.pages?.home?.services_section;
  
  const [activeCategory, setActiveCategory] = useState(null);

  if (!services?.items?.length) return null;

  const categories = services.categories || [];
  
  // Set initial category if not set
  if (activeCategory === null && categories.length > 0) {
    setActiveCategory(categories[0]);
  }
  
  const filteredServices = activeCategory 
    ? services.items.filter(s => s.category === activeCategory)
    : services.items;

  const displayServices = showAll ? filteredServices : filteredServices.slice(0, limit);

  return (
    <section id="services" className="py-16 sm:py-20 bg-white">
      <div className="container-custom">
        {section && (
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-primary animate-fade-in-up">
            {section.title}
          </h2>
        )}

        {/* Category Tabs */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-300 text-sm sm:text-base ${
                  activeCategory === cat
                    ? 'bg-accent text-white shadow-lg scale-105'
                    : 'bg-secondary/20 text-primary hover:bg-secondary/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {displayServices.map((service, index) => (
            <div 
              key={service.id} 
              className="card hover:shadow-lg hover:scale-105 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg sm:text-xl font-bold text-primary flex-1">{service.name}</h3>
                <span className="ml-2 px-2 py-1 bg-accent/20 text-accent text-xs font-bold rounded">{service.category}</span>
              </div>
              <p className="text-sm sm:text-base text-gray-600 mb-4">{service.description}</p>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl sm:text-2xl font-bold text-accent">${service.price}</span>
                {service.duration && (
                  <span className="text-xs sm:text-sm text-gray-500">{service.duration} min</span>
                )}
              </div>
              <a 
                href={service.booking_url || '#book'}
                className="block w-full bg-accent hover:bg-accent-light text-white font-bold py-2 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 text-sm sm:text-base text-center"
              >
                Schedule Appointment
              </a>
            </div>
          ))}
        </div>

        {!showAll && section?.cta_button && (
          <div className="text-center mt-12">
            <a href={section.cta_link || '/services'} className="btn-accent hover:scale-105 active:scale-95">
              {section.cta_button}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
