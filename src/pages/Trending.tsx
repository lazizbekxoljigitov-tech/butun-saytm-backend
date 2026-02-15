import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AnimeCard } from '../components/anime/AnimeCard';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';
import api from '../services/api';
import { Anime } from '../types';
import { Play, TrendingUp, Star } from 'lucide-react';

export const Trending = () => {
  const { t } = useTranslation();
  const [trendingAnimes, setTrendingAnimes] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    try {
      const response = await api.get('/anime/trending');
      if (response.data.success) {
        setTrendingAnimes(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch trending:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const featuredAnime = trendingAnimes[0];
  const otherAnimes = trendingAnimes.slice(1);

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 container mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-4">
          {t('trending.title')}
        </h1>
        <p className="text-gray-500 text-lg font-medium">
          {t('trending.subtitle')}
        </p>
      </motion.div>

      {/* Featured Hero Section */}
      {isLoading ? (
        <div className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden bg-dark-light/30 border border-dark-border/50 mb-12 animate-pulse">
          <div className="w-full h-full bg-gradient-to-br from-dark-light/50 via-dark-light/30 to-dark-light/50" />
        </div>
      ) : featuredAnime ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden mb-12 group shadow-2xl"
        >
          {/* Background Image */}
          <img 
            src={featuredAnime.banner_url || featuredAnime.thumbnail_url}
            alt={featuredAnime.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
          
          {/* Trending Badge */}
          <div className="absolute top-6 left-6 bg-primary/90 backdrop-blur-sm text-white px-6 py-3 rounded-2xl font-black text-lg uppercase tracking-widest shadow-xl border-2 border-white/20">
            {t('trending.top_trending')}
          </div>
          
          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black italic uppercase text-white mb-4 drop-shadow-lg">
                {featuredAnime.title}
              </h2>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1 bg-primary/90 px-3 py-1 rounded-full">
                  <Star size={16} className="text-white fill-white" />
                  <span className="text-white font-bold">{featuredAnime.rating}</span>
                </div>
                <span className="text-gray-300 border border-gray-600 px-3 py-1 rounded-full text-sm uppercase backdrop-blur-sm bg-black/30">
                  {featuredAnime.status}
                </span>
              </div>

              <p className="text-gray-200 max-w-2xl mb-6 line-clamp-2 md:line-clamp-3">
                {featuredAnime.description || t('trending.default_description')}
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link to={`/anime/${featuredAnime.id}`}>
                  <Button size="lg" className="gap-2 px-8 py-6 text-lg font-bold shadow-lg">
                    <Play size={20} fill="currentColor" /> Watch Now
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>
      ) : null}

      {/* Other Trending Animes Grid */}
      <div>
        <h2 className="text-2xl font-black italic tracking-tighter uppercase mb-8 flex items-center gap-3">
          <span className="w-8 h-1 bg-primary rounded-full"></span>
          More Trending
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {otherAnimes.map((anime, index) => (
               <motion.div
                 key={anime.id}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: index * 0.05 }}
               >
                  <AnimeCard anime={anime} />
               </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

