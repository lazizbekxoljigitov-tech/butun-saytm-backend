import { Link } from 'react-router-dom';
import { Anime } from '../../types';
import { Star, Play, Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface AnimeCardProps {
  anime: Anime;
}

export const AnimeCard = ({ anime }: AnimeCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="relative group/card aspect-[2/3] rounded-xl overflow-hidden cursor-pointer shadow-xl bg-white/[0.03] border border-white/[0.05]"
    >
      <Link to={`/anime/${anime.id}`} aria-label={`View ${anime.title}`}>
        {/* Thumbnail - CLS & Performance Fix */}
        <img
          src={anime.thumbnail_url || 'https://via.placeholder.com/400x600'}
          alt={`${anime.title} cover`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110"
          loading="lazy"
          decoding="async"
          width="400"
          height="600"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/95 via-dark-bg/40 to-transparent opacity-0 md:group-hover/card:opacity-100 md:opacity-0 touch-opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 md:p-4">
          <h3 className="text-white font-bold text-sm md:text-lg line-clamp-2 mb-1 md:mb-2">{anime.title}</h3>
          
          <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
            <div className="flex items-center gap-1 text-primary">
              <Star size={12} className="fill-primary md:w-3.5 md:h-3.5" />
              <span className="text-[10px] md:text-xs font-bold">{anime.rating}</span>
            </div>
            <span className="text-[8px] md:text-[10px] text-gray-300 border border-white/20 px-1.5 rounded uppercase font-medium">
              {anime.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 md:w-8 md:h-8 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/20">
              <Play size={12} className="text-white fill-white ml-0.5 md:w-4 md:h-4" />
            </div>
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">Watch</span>
          </div>
        </div>

        {/* Badge for Trending */}
        {anime.is_trending && (
          <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-tighter neon-glow">
            Trending
          </div>
        )}

        {/* Rating Badge (Normal State) */}
        {!anime.is_trending && (
           <div className="absolute top-2 left-2 bg-dark-bg/80 backdrop-blur-md border border-dark-border text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
           <Star size={10} className="text-primary fill-primary" />
           {anime.rating}
         </div>
        )}
      </Link>
    </motion.div>
  );
};
