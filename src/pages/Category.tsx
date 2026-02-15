import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Anime, Category } from '../types';
import { AnimeCard } from '../components/anime/AnimeCard';
import { Filter, Grid, LayoutGrid } from 'lucide-react';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { useTranslation } from 'react-i18next';

export const CategoryPage = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [anime, setAnime] = useState<Anime[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const catRes = await api.get('/categories');
        setCategories(catRes.data.data);
        
        if (id) {
          const res = await api.get(`/anime?category=${id}`);
          setAnime(res.data.data.anime);
          setCurrentCategory(catRes.data.data.find((c: Category) => c.id === id) || null);
        } else {
          // If no ID, show all or default
          const res = await api.get('/anime');
          setAnime(res.data.data.anime);
        }
      } catch (error) {
        console.error('Failed to fetch category data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  return (
    <div className="container mx-auto px-4 md:px-6 pt-24">
      <header className="mb-8 md:mb-12">
        <div className="flex items-center gap-3 md:gap-4 mb-2 md:mb-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/20 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-primary/10 border border-primary/20">
             <LayoutGrid className="text-primary" size={20} />
          </div>
          <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter">
            {t('category.title')}
          </h1>
        </div>
        <p className="text-gray-500 text-sm md:text-lg font-medium">
          {t('category.subtitle')}
        </p>
      </header>

      {/* Category Pills - Optimized for Touch */}
      <div className="flex flex-wrap gap-2 mb-8 md:mb-12 no-scrollbar scroll-smooth">
        <Link
          to="/categories"
          aria-label="Show all categories"
          className={`px-5 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-bold text-xs md:text-sm uppercase tracking-widest transition-all ${
            !id
              ? 'bg-primary text-white shadow-lg shadow-primary/30'
              : 'bg-white/[0.03] text-gray-400 border border-white/[0.08] hover:text-white hover:bg-white/[0.08]'
          }`}
        >
          {t('category.all')}
        </Link>
        {categories.map(cat => (
          <Link
            key={cat.id}
            to={`/category/${cat.id}`}
            aria-label={`Filter by ${cat.name}`}
            className={`px-4 md:px-5 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-bold transition-all border ${
              id === cat.id 
              ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' 
              : 'bg-white/[0.03] border-white/[0.08] text-gray-400 hover:border-primary/50'
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {isLoading ? (
          [1,2,3,4,5,6,7,8,9,10].map(i => (
            <SkeletonCard key={i} />
          ))
        ) : anime.length > 0 ? (
          anime.map(item => (
            <AnimeCard key={item.id} anime={item} />
          ))
        ) : (
          <div className="text-center py-20">
            <Grid size={64} className="mx-auto text-gray-700 mb-4" />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">{t('category.no_anime')}</p>
            <p className="text-gray-600 mt-2">{t('category.try_category')}</p>
          </div>
        )}
      </div>
    </div>
  );
};
