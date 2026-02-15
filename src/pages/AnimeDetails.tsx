import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Anime, Episode } from '../types';
import api from '../services/api';
import { Button } from '../components/ui/Button';
import { EpisodeList } from '../components/anime/EpisodeList';
import { AnimeRow } from '../components/anime/AnimeRow';
import { motion } from 'framer-motion';
import { Star, Play, Bookmark, Share2, Calendar, Clock, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export const AnimeDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [related, setRelated] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      try {
        const [detailRes, relatedRes] = await Promise.all([
          api.get(`/anime/${id}`),
          api.get(`/anime/${id}/related`)
        ]);

        if (detailRes.data.success) {
          setAnime(detailRes.data.data);
          
          // Check if saved
          try {
            const savedRes = await api.get(`/users/saved/check/${id}`);
            setIsSaved(savedRes.data.data.saved);
          } catch { /* Not logged in */ }
        }
        
        if (relatedRes.data.success) {
          setRelated(relatedRes.data.data);
        }
      } catch (error) {
        toast.error('Failed to load anime details');
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
    window.scrollTo(0, 0);
  }, [id, navigate]);

  const handleToggleSave = async () => {
    try {
      const { data } = await api.post('/users/saved/toggle', { anime_id: id });
      setIsSaved(data.data.saved);
      toast.success(data.data.message);
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Please login to save anime to your watchlist');
      } else {
        toast.error('Something went wrong');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 animate-pulse">
        <div className="h-[50vh] bg-dark-accent rounded-3xl mb-12" />
        <div className="h-12 w-1/3 bg-dark-accent rounded mb-6" />
        <div className="h-24 w-full bg-dark-accent rounded mb-12" />
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-20 bg-dark-accent rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!anime) return null;

  const firstEpisode = anime.episodes?.[0];

  return (
    <div className="container mx-auto px-6">
      {/* Banner & Basic Info */}
      <section className="relative h-[60vh] rounded-3xl overflow-hidden mb-12 shadow-2xl">
        <img
          src={anime.banner_url || anime.thumbnail_url}
          alt={anime.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-bg/80 via-transparent to-transparent hidden md:block" />

        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/20 backdrop-blur-md border border-primary/30 rounded-full">
                <Star size={18} className="text-primary fill-primary" />
                <span className="text-sm font-black text-primary">{anime.rating}</span>
              </div>
              {anime.anime_categories?.map(cat => (
                <span key={cat.category_id} className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-gray-300">
                  {cat.categories.name}
                </span>
              ))}
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-primary">
                {anime.status}
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-6 leading-tight">
              {anime.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 mb-8">
              {firstEpisode ? (
                <Link to={`/watch/${firstEpisode.id}`}>
                  <Button size="lg" className="px-8 h-14 rounded-xl group">
                    <Play className="fill-white group-hover:scale-110 transition-transform" />
                    Watch Episode 1
                  </Button>
                </Link>
              ) : (
                <Button size="lg" disabled className="px-8 h-14 rounded-xl">
                  Upcoming
                </Button>
              )}
              <Button 
                variant="secondary" 
                size="lg" 
                aria-label={isSaved ? "Remove anime from watchlist" : "Add anime to watchlist"}
                className={`px-8 h-14 rounded-xl border border-white/10 transition-colors ${isSaved ? 'text-primary' : ''}`}
                onClick={handleToggleSave}
              >
                <Bookmark className={isSaved ? 'fill-primary' : ''} />
                {isSaved ? 'In Watchlist' : 'Add to Watchlist'}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                aria-label="Share this anime"
                className="w-14 h-14 rounded-xl border border-white/10"
              >
                <Share2 size={24} />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          {/* Synopsis */}
          <section>
            <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-6 flex items-center gap-3">
              <span className="w-8 h-1 bg-primary rounded-full" />
              Synopsis
            </h3>
            <p className="text-gray-400 text-lg leading-relaxed bg-dark-light/20 p-8 rounded-2xl border border-dark-border/30">
              {anime.description}
            </p>
          </section>

          {/* Episodes */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                <span className="w-8 h-1 bg-primary rounded-full" />
                Episodes
              </h3>
              <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">
                {anime.episodes?.length || 0} Total Episodes
              </span>
            </div>
            <EpisodeList animeId={anime.id} episodes={anime.episodes || []} />
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-12">
          <section className="bg-dark-light/30 border border-dark-border/50 rounded-2xl p-8">
            <h3 className="text-xl font-black italic uppercase tracking-tighter mb-8">Information</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-dark-border/30">
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar size={18} />
                  <span className="text-sm font-bold uppercase tracking-widest">Released</span>
                </div>
                <span className="font-bold">{new Date(anime.created_at).getFullYear()}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-dark-border/30">
                <div className="flex items-center gap-2 text-gray-500">
                  <Clock size={18} />
                  <span className="text-sm font-bold uppercase tracking-widest">Duration</span>
                </div>
                <span className="font-bold">24m / Ep</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-dark-border/30">
                <div className="flex items-center gap-2 text-gray-500">
                  <Star size={18} />
                  <span className="text-sm font-bold uppercase tracking-widest">Rating</span>
                </div>
                <span className="font-bold text-primary">{anime.rating} / 10</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-gray-500">
                  <ChevronRight size={18} />
                  <span className="text-sm font-bold uppercase tracking-widest">Views</span>
                </div>
                <span className="font-bold">{anime.view_count.toLocaleString()}</span>
              </div>
            </div>
          </section>

          {/* Related Anime on Sidebar for mobile, or separate section below */}
          <section className="hidden lg:block">
            <h3 className="text-xl font-black italic uppercase tracking-tighter mb-8">Related Anime</h3>
            <div className="space-y-4">
              {related.slice(0, 4).map(rel => (
                <Link key={rel.id} to={`/anime/${rel.id}`} className="group flex gap-4 p-2 rounded-xl hover:bg-dark-accent/50 transition-all">
                  <div className="w-16 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={rel.thumbnail_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="py-2">
                    <h4 className="font-bold text-sm line-clamp-2 group-hover:text-primary transition-colors">{rel.title}</h4>
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-primary font-bold">
                        <Star size={12} className="fill-primary" />
                        {rel.rating}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Mobile Related Anime */}
      <section className="lg:hidden mt-12">
        <AnimeRow title="Related Anime" animeList={related} />
      </section>
    </div>
  );
};
