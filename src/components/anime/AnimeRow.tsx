import { Anime } from '../../types';
import { AnimeCard } from './AnimeCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';

interface AnimeRowProps {
  title: string;
  animeList: Anime[];
  isLoading?: boolean;
}

export const AnimeRow = ({ title, animeList, isLoading }: AnimeRowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div className="mb-8 md:mb-12">
        <div className="h-6 md:h-8 w-40 md:w-48 bg-white/[0.03] border border-white/[0.08] rounded-md mb-4 md:mb-6 animate-pulse" />
        <div className="flex gap-3 md:gap-4 overflow-hidden">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-[2/3] w-[140px] md:w-[220px] bg-white/[0.03] border border-white/[0.08] rounded-xl animate-pulse flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  if (!animeList.length) return null;

  return (
    <div className="mb-8 md:mb-12 relative group/row">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase section-title">
          {title.split(' ')[0]} <span className="text-primary">{title.split(' ').slice(1).join(' ')}</span>
        </h2>
        
        <div className="hidden md:flex gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
          <button
            onClick={() => scroll('left')}
            aria-label={`Scroll ${title} left`}
            className="p-2 bg-white/5 border border-white/10 hover:bg-primary transition-all rounded-full"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll('right')}
            aria-label={`Scroll ${title} right`}
            className="p-2 bg-white/5 border border-white/10 hover:bg-primary transition-all rounded-full"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar scroll-smooth p-1 -mx-1"
        >
          {animeList.map((anime) => (
            <div key={anime.id} className="w-[140px] md:w-[220px] flex-shrink-0">
              <AnimeCard anime={anime} />
            </div>
          ))}
        </div>
        
        {/* Mobile Scroll Gradient indicator */}
        <div className="absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-l from-dark-bg/80 to-transparent pointer-events-none md:hidden" />
      </div>
    </div>
  );
};
