import { useConfig } from '../hooks/useConfig';

export default function Hero() {
  const config = useConfig();
  const hero = config?.pages?.home?.hero;

  if (!hero) return null;

  return (
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-primary">
      {/* Background Image */}
      {hero.background_image && (
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${hero.background_image})` }}
        />
      )}
      
      {/* Dark overlay for text readability - Enhanced for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/50 z-10"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary/40 z-10"></div>
      
      {/* Content */}
      <div className="relative z-20 text-center max-w-4xl px-4 sm:px-6">
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light mb-2 sm:mb-3 tracking-widest text-white uppercase animate-fade-in-down drop-shadow-lg">
          {hero.heading}
        </h1>
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light tracking-wider mb-8 sm:mb-10 md:mb-12 text-secondary uppercase animate-fade-in-up drop-shadow-md">
          {hero.subheading}
        </h2>
        {hero.cta_button && (
          <a 
            href={hero.cta_link || '#book'} 
            className="inline-block bg-accent hover:bg-transparent text-white hover:text-accent px-10 sm:px-14 md:px-16 py-3 sm:py-4 md:py-5 rounded font-light uppercase tracking-widest text-sm sm:text-base md:text-lg transition-all duration-300 border-2 border-accent animate-fade-in hover:scale-110 hover:shadow-2xl hover:drop-shadow-lg active:scale-95 shadow-lg"
          >
            {hero.cta_button}
          </a>
        )}
      </div>
    </section>
  );
}
