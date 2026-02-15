import { useEffect } from 'react';
import { useAnimeStore } from '../features/anime/store/animeStore';
import { HeroBanner } from '../components/anime/HeroBanner';
import { AnimeRow } from '../components/anime/AnimeRow';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export const Home = () => {
  const { 
    trending, 
    featured, 
    topRated, 
    ongoing,
    newEpisodes, 
    isLoading, 
    fetchHomeData 
  } = useAnimeStore();
  const { t } = useTranslation();

  useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="container mx-auto px-6">
      {/* Hero Section */}
      <section className="mb-20">
        <HeroBanner animeList={ongoing.length > 0 ? ongoing : (featured.length > 0 ? featured : trending.slice(0, 5))} />
      </section>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-12"
      >
        {/* Trending Section */}
        <motion.section variants={sectionVariants}>
          <AnimeRow title={t('home.sections.trending')} animeList={trending} isLoading={isLoading} />
        </motion.section>

        {/* Top Rated Section */}
        <motion.section variants={sectionVariants}>
          <AnimeRow title={t('home.sections.top_rated')} animeList={topRated} isLoading={isLoading} />
        </motion.section>

        {/* Categories / New Episodes and other sections could go here */}
        <motion.section variants={sectionVariants}>
          <AnimeRow 
            title={t('home.sections.latest')} 
            animeList={newEpisodes.map((ep: any) => ({
              ...ep.anime,
              id: ep.anime_id, // ensure ID is correct for links
              title: `${ep.anime.title} - EP ${ep.episode_number}`
            }))} 
            isLoading={isLoading} 
          />
        </motion.section>
      </motion.div>
    </div>
  );
};
