import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Home, Search, TrendingUp, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimeCard } from '../components/anime/AnimeCard';
import api from '../services/api';
import { Anime } from '../types';
import { useTranslation } from 'react-i18next';

export const NotFound = () => {
  const { t } = useTranslation();
  const [trendingAnime, setTrendingAnime] = useState<Anime[]>([]);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const { data } = await api.get('/anime/trending?limit=4');
        setTrendingAnime(data.data);
      } catch (error) {
        console.error('Failed to fetch trending anime');
      }
    };
    fetchTrending();
  }, []);

  return (
    <div className="container mx-auto px-6 min-h-[calc(100vh-160px)] py-12">
      {/* 404 Section */}
      <div className="relative flex flex-col items-center justify-center text-center mb-24 py-20">
        {/* Animated Background Text */}
        <motion.h1 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute text-[200px] md:text-[300px] font-black italic tracking-tighter leading-none text-white/5 select-none"
        >
          404
        </motion.h1>
        
        {/* Content */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative z-10 max-w-2xl"
        >
          {/* Floating Icon */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mb-8"
          >
            <div className="w-24 h-24 bg-primary/20 rounded-3xl mx-auto flex items-center justify-center border border-primary/30">
              <Sparkles size={48} className="text-primary" />
            </div>
          </motion.div>

          <h2 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter mb-6">
            {t('notFound.title')}
          </h2>
          
          <p className="text-gray-400 text-lg mb-8 leading-relaxed">
            {t('notFound.description')}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/">
              <Button size="lg" className="rounded-2xl px-10 py-6 text-lg shadow-xl shadow-primary/20">
                <Home size={20} />
                {t('notFound.return_home')}
              </Button>
            </Link>
            <Link to="/search">
              <Button variant="outline" size="lg" className="rounded-2xl px-10 py-6 text-lg border-2">
                <Search size={20} />
                {t('notFound.search_anime')}
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Recommended Anime */}
      {trendingAnime.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
              <span className="w-8 h-1 bg-primary rounded-full"></span>
              {t('notFound.while_here')}
            </h3>
            <Link to="/trending" className="text-sm font-bold text-gray-500 hover:text-primary transition-colors flex items-center gap-2 group">
              <TrendingUp size={16} className="group-hover:translate-y-[-2px] transition-transform" />
              {t('notFound.view_trending')}
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trendingAnime.map((anime, index) => (
              <motion.div
                key={anime.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
              >
                <AnimeCard anime={anime} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

