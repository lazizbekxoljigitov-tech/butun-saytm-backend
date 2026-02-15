import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Play, RefreshCw, X, Star, LayoutGrid } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';
import { AnimeCard } from '../components/anime/AnimeCard';
import api from '../services/api';
import { Anime } from '../types';

export const RandomAnime = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnimes();
  }, []);

  const fetchAnimes = async () => {
    try {
      const response = await api.get('/anime');
      if (response.data.success) {
        setAnimes(response.data.data.anime);
      }
    } catch (error) {
      console.error('Failed to fetch anime:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const spinWheel = () => {
    if (animes.length === 0 || isSpinning) return;

    setIsSpinning(true);
    setShowModal(false);
    setSelectedAnime(null);

    let counter = 0;
    const totalSpins = 20;

    const spin = () => {
      const randomIndex = Math.floor(Math.random() * animes.length);
      setSelectedAnime(animes[randomIndex]);
      counter++;

      if (counter < totalSpins) {
        const progress = counter / totalSpins;
        const delay = 50 + progress * progress * 400;
        setTimeout(spin, delay);
      } else {
        setTimeout(() => {
          setIsSpinning(false);
          setShowModal(true);
        }, 500);
      }
    };

    spin();
  };

  const handleSpin = () => {
    spinWheel();
  };

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-8 md:pb-12 px-4 md:px-6 container mx-auto">
      <header className="text-center mb-10 md:mb-16">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-6xl font-black italic uppercase tracking-tighter mb-4"
        >
          {t('random.title').split(' ').map((word, i) => 
            i === 1 ? <span key={i} className="text-primary">{word}</span> : <span key={i}> {word} </span>
          )}
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 text-sm md:text-lg max-w-2xl mx-auto px-4"
        >
          {t('random.subtitle')}
        </motion.p>
      </header>

      {/* Main Spinner Area */}
      <div className="relative max-w-4xl mx-auto mb-16 md:mb-20 bg-white/[0.02] rounded-3xl p-6 md:p-8 border border-white/[0.08] backdrop-blur-sm">
        <div className="flex flex-col items-center justify-center min-h-[300px] md:min-h-[400px]">
           <AnimatePresence mode="wait">
            {!selectedAnime ? (
               <motion.div
                key="empty"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="text-center px-4"
               >
                  <Sparkles size={48} className="text-primary mx-auto mb-4 md:mb-6 opacity-50" />
                  <h3 className="text-xl md:text-2xl font-bold text-gray-300">{t('random.ready_to_spin')}</h3>
                  <p className="text-gray-500 mt-2 text-sm md:text-base">{t('random.click_to_find')}</p>
               </motion.div>
            ) : (
              <motion.div
                key={selectedAnime.id}
                initial={{ scale: 0.9, opacity: 0, rotateY: -15 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                className="relative w-full max-w-sm md:max-w-md aspect-[2/3] md:aspect-video rounded-xl overflow-hidden shadow-2xl border-2 border-primary/20"
              >
                 <img 
                   src={selectedAnime.banner_url || selectedAnime.thumbnail_url} 
                   alt={`${selectedAnime.title} preview`}
                   className="w-full h-full object-cover"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex flex-col justify-end p-4 md:p-6">
                    <h2 className="text-xl md:text-3xl font-black italic uppercase text-white mb-2 line-clamp-2">{selectedAnime.title}</h2>
                    <div className="flex items-center gap-2 text-xs md:text-sm text-gray-300">
                      <span className="bg-primary px-2 py-0.5 rounded text-white font-bold">{selectedAnime.rating} ★</span>
                      <span className="uppercase tracking-wider font-medium">{selectedAnime.status}</span>
                    </div>
                 </div>
                 
                 {isSpinning && (
                   <motion.div 
                     className="absolute inset-0 border-4 border-primary rounded-xl"
                     animate={{ opacity: [0, 1, 0] }}
                     transition={{ duration: 1, repeat: Infinity }}
                   />
                 )}
              </motion.div>
            )}
           </AnimatePresence>
        </div>

        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-full px-8 text-center flex justify-center">
          <Button 
            size="lg" 
            onClick={spinWheel} 
            disabled={isLoading || isSpinning || animes.length === 0}
            aria-label={isSpinning ? "Currently spinning" : "Spin to find a random anime"}
            className="relative px-8 md:px-12 py-5 md:py-6 text-lg md:text-xl rounded-2xl shadow-2xl shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
          >
             <RefreshCw size={20} className={isSpinning ? 'animate-spin' : ''} />
             {isSpinning ? t('random.spinning') : t('random.spin_button')}
          </Button>
        </div>
      </div>

      {/* Result Modal */}
      <AnimatePresence>
        {showModal && selectedAnime && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 px-4"
              onClick={() => setShowModal(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="relative bg-dark-bg border border-white/[0.1] rounded-2xl overflow-hidden max-w-xl w-full shadow-2xl shadow-primary/10 pointer-events-auto">
                <button
                  onClick={() => setShowModal(false)}
                  aria-label="Close result"
                  className="absolute top-4 right-4 z-10 bg-black/50 backdrop-blur-md rounded-full p-2 hover:bg-black transition-colors border border-white/10"
                >
                  <X size={20} className="text-white" />
                </button>

                <div className="relative h-48 md:h-64">
                  <img 
                    src={selectedAnime.banner_url || selectedAnime.thumbnail_url}
                    alt={`${selectedAnime.title} banner`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/40 to-transparent" />
                  
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                    className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white px-5 py-1.5 rounded-full font-black text-xs uppercase tracking-wider shadow-lg border border-white/10"
                  >
                    🎲 {t('random.your_pick')}
                  </motion.div>
                </div>

                <div className="p-6 md:p-8">
                  <h2 className="text-2xl md:text-3xl font-black italic uppercase mb-2 text-white leading-tight">{selectedAnime.title}</h2>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-1 bg-primary/20 px-2.5 py-0.5 rounded-full border border-primary/20">
                      <span className="text-primary font-bold text-sm">{selectedAnime.rating}</span>
                      <Star size={12} className="text-primary fill-primary" />
                    </div>
                    <span className="text-gray-400 border border-white/10 px-2.5 py-0.5 rounded-full text-[10px] md:text-xs uppercase font-bold tracking-widest">
                      {selectedAnime.status}
                    </span>
                  </div>

                  <p className="text-gray-400 text-sm md:text-base mb-6 line-clamp-2 md:line-clamp-3 leading-relaxed">
                    {selectedAnime.description || t('random.default_description')}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      onClick={() => navigate(`/anime/${selectedAnime.id}`)}
                      size="lg"
                      aria-label={`Start watching ${selectedAnime.title} now`}
                      className="flex-1 rounded-xl py-4 md:py-6 shadow-xl shadow-primary/10 h-auto"
                    >
                      <Play size={18} className="fill-white" />
                      {t('random.watch_now')}
                    </Button>
                    <Button 
                      onClick={handleSpin}
                      variant="outline"
                      size="lg"
                      aria-label="Spin again for another random anime"
                      className="flex-1 rounded-xl py-4 md:py-6 border border-white/10 hover:bg-white/5 h-auto text-white"
                    >
                      <RefreshCw size={18} />
                      {t('random.spin_again')}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="mt-16 md:mt-20">
        <h2 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase mb-6 md:mb-8 flex items-center gap-3">
          <span className="w-8 h-1 bg-primary rounded-full"></span>
          All Available Animes
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {isLoading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-white/[0.03] border border-white/[0.08] rounded-xl animate-pulse" />
            ))
          ) : (
            animes.map((anime) => (
               <AnimeCard key={anime.id} anime={anime} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
