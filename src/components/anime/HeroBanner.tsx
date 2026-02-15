import { Anime } from '../../types';
import { Play, Info, Star, Calendar } from 'lucide-react';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface HeroBannerProps {
  animeList: Anime[];
}

export const HeroBanner = ({ animeList }: HeroBannerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % animeList.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [animeList.length]);

  if (!animeList.length) return null;

  const current = animeList[currentIndex];

  return (
    <div className="relative w-full h-[65vh] md:h-[85vh] overflow-hidden rounded-none md:rounded-3xl mb-8 md:mb-12 shadow-2xl hero-container bg-dark-accent/10">
      <AnimatePresence mode="wait">
        <motion.div
           key={current.id}
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           transition={{ duration: 1 }}
           className="absolute inset-0"
        >
          {/* Background Image - Optimized for LCP */}
          <img
            src={current.banner_url || current.thumbnail_url}
            alt={`${current.title} banner`}
            className="w-full h-full object-cover"
            width="1920"
            height="1080"
            loading={currentIndex === 0 ? "eager" : "lazy"}
            fetchPriority={currentIndex === 0 ? "high" : "low"}
            decoding="async"
          />

          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-dark-bg via-dark-bg/60 md:via-dark-bg/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent md:hidden" />

          {/* Content */}
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-6 md:px-24 hero-content">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="max-w-2xl"
              >
                <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/20 backdrop-blur-md border border-primary/30 rounded-full">
                    <Star size={14} className="text-primary fill-primary" />
                    <span className="text-xs md:text-sm font-bold text-primary">{current.rating} Rating</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-full">
                    <Calendar size={14} className="text-gray-300" />
                    <span className="text-xs md:text-sm font-medium text-gray-300">
                      {new Date(current.created_at).getFullYear()}
                    </span>
                  </div>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-7xl font-black italic uppercase tracking-tighter leading-[1.1] mb-4 md:mb-6 hero-title">
                  {current.title}
                </h1>

                <p className="text-gray-400 text-sm md:text-lg line-clamp-2 md:line-clamp-3 mb-6 md:mb-10 max-w-xl leading-relaxed">
                  {current.description}
                </p>

                <div className="flex items-center gap-3 md:gap-4">
                  <Link to={`/anime/${current.id}`} aria-label={`Watch ${current.title} now`}>
                    <Button size="lg" className="px-6 md:px-10 h-12 md:h-16 text-base md:text-xl rounded-xl md:rounded-2xl group">
                      <Play className="w-5 h-5 md:w-6 md:h-6 fill-white group-hover:scale-110 transition-transform" />
                      Watch Now
                    </Button>
                  </Link>
                  <Link to={`/anime/${current.id}`} aria-label={`View details for ${current.title}`}>
                    <Button variant="secondary" size="lg" className="px-6 md:px-10 h-12 md:h-16 text-base md:text-xl rounded-xl md:rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10">
                      <Info className="w-5 h-5 md:w-6 md:h-6" />
                      <span className="hidden sm:inline">More Details</span>
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Pagination dots */}
      <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex gap-2 md:gap-3 z-10">
        {animeList.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`transition-all duration-300 rounded-full h-1.5 md:h-2 ${
              index === currentIndex ? 'w-8 md:w-10 bg-primary' : 'w-1.5 md:w-2 bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
