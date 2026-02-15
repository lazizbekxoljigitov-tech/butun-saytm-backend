import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { Anime, Category } from '../types';
import { AnimeCard } from '../components/anime/AnimeCard';
import { Input } from '../components/ui/Input';
import { Search as SearchIcon, SlidersHorizontal, Grid2X2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { useTranslation } from 'react-i18next';

export const Search = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<Anime[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('cat') || '');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        setCategories(data.data);
      } catch (error) {
        console.error('Failed to fetch categories');
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const searchAnime = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (query) params.append('search', query);
        if (selectedCategory) params.append('category', selectedCategory);
        
        const { data } = await api.get(`/anime?${params.toString()}`);
        setResults(data.data.anime);
      } catch (error) {
        console.error('Search failed');
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      searchAnime();
    }, 500);

    return () => clearTimeout(timer);
  }, [query, selectedCategory]);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setSearchParams(prev => {
      if (val) prev.set('q', val);
      else prev.delete('q');
      return prev;
    });
  };

  const handleCategoryChange = (catId: string) => {
    const newVal = selectedCategory === catId ? '' : catId;
    setSelectedCategory(newVal);
    setSearchParams(prev => {
      if (newVal) prev.set('cat', newVal);
      else prev.delete('cat');
      return prev;
    });
  };

  return (
    <div className="container mx-auto px-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
        <header className="mb-8">
          <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-4">
            {t('search.title')}
          </h1>
          <div className="relative max-w-2xl">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={22} />
            <Input
              type="text"
              value={query}
              onChange={handleQueryChange}
              placeholder={t('search.placeholder')}
              className="pl-12 h-14 bg-dark-accent rounded-xl text-lg border-dark-border"
            />
          </div>
        </header>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1 space-y-10">
          <section>
             <div className="flex items-center gap-3 mb-6">
                <SlidersHorizontal size={20} className="text-primary" />
                <h3 className="text-lg font-black italic uppercase tracking-tighter">{t('search.categories_heading')}</h3>
             </div>
             <div className="flex flex-wrap gap-2">
               <button
                 onClick={() => handleCategoryChange('')}
                 className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                   !selectedCategory
                     ? 'bg-primary text-white'
                     : 'bg-dark-accent text-gray-400 hover:text-white hover:bg-dark-border'
                 }`}
               >
                 {t('search.all_categories')}
               </button>
               {categories.map(cat => (
                 <button
                   key={cat.id}
                   onClick={() => handleCategoryChange(cat.id)}
                   className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                     selectedCategory === cat.id 
                     ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
                     : 'bg-dark-light/50 border-dark-border/50 text-gray-400 hover:border-primary/50 hover:text-white'
                   }`}
                 >
                   {cat.name}
                 </button>
               ))}
             </div>
          </section>

          <section>
             <div className="p-6 bg-primary/10 border border-primary/20 rounded-2xl relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 blur-3xl rounded-full" />
                <h4 className="font-black italic uppercase tracking-tighter mb-2">{t('search.premium_title')}</h4>
                <p className="text-xs text-gray-400 leading-relaxed">{t('search.premium_description')}</p>
             </div>
          </section>
        </aside>

        {/* Results Grid */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-dark-border/30">
             <div className="flex items-center gap-4">
                <Grid2X2 size={20} className="text-gray-500" />
                {query && (
                <p className="text-gray-500 mb-6">
                  {results.length} {t('search.results_found')}
                </p>
              )}
             </div>
          </div>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"
              >
                {[1,2,3,4,5,6,7,8].map(i => (
                  <SkeletonCard key={i} />
                ))}
              </motion.div>
            ) : results.length > 0 ? (
              <motion.div 
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {results.map(anime => (
                  <AnimeCard key={anime.id} anime={anime} />
                ))}
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-24 text-center"
              >
                <div className="w-20 h-20 bg-dark-accent rounded-full flex items-center justify-center mb-6">
                  <SearchIcon size={32} className="text-gray-600" />
                </div>
                <h3 className="text-2xl font-bold mb-2">No Anime Found</h3>
                <p className="text-gray-500 max-w-xs">We couldn't find any anime matching your criteria. Try adjusting your filters.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
