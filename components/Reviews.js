import { useConfig } from '../hooks/useConfig';

export default function Reviews({ limit }) {
  const config = useConfig();
  const reviews = config?.reviews;

  if (!reviews?.items?.length) return null;

  const displayReviews = limit ? reviews.items.slice(0, limit) : reviews.items;

  return (
    <section id="book" className="py-16 sm:py-20 bg-white">
      <div className="container-custom">
        {/* Booking CTA */}
        {reviews.cta && (
          <div className="mb-12 sm:mb-16 text-center bg-secondary/10 border border-accent/30 rounded-lg p-8 sm:p-10">
            <h3 className="text-2xl sm:text-3xl font-bold text-primary mb-4">{reviews.cta.title}</h3>
            <p className="text-primary/80 mb-6 text-base sm:text-lg">{reviews.cta.subtitle}</p>
            <a 
              href={reviews.cta.link || '#contact'}
              className="btn-accent text-sm sm:text-base hover:scale-105 active:scale-95"
            >
              {reviews.cta.button}
            </a>
          </div>
        )}

        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-primary animate-fade-in-down">
            {reviews.title}
          </h2>
          {reviews.subtitle && (
            <p className="text-base sm:text-lg text-primary/80 animate-fade-in-up">
              {reviews.subtitle}
            </p>
          )}
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {displayReviews.map((review, index) => (
            <div 
              key={review.id}
              className="bg-secondary/10 border border-accent/20 rounded-lg p-6 hover:shadow-lg transition-all duration-300 animate-fade-in-up hover:border-accent"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>

              {/* Review Text */}
              <p className="text-primary/80 mb-4 italic text-sm sm:text-base">
                &quot;{review.text}&quot;
              </p>

              {/* Author */}
              <p className="text-primary font-semibold">- {review.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
