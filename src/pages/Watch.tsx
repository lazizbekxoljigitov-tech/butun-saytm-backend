import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Episode, Anime } from '../types';
import api from '../services/api';
import { VideoPlayer } from '../components/player/VideoPlayer';
import { EpisodeList } from '../components/anime/EpisodeList';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { ChevronLeft, List, Info, Share2, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const Watch = () => {
  const { id } = useParams<{ id: string }>();
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [anime, setAnime] = useState<Anime | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEpisode = async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get(`/episodes/${id}`);
        if (data.success) {
          setEpisode(data.data);
          
          // Fetch full anime info for the episode list
          const animeRes = await api.get(`/anime/${data.data.anime_id}`);
          setAnime(animeRes.data.data);

          // Record view
          api.post('/anime/view', { 
            anime_id: data.data.anime_id, 
            episode_id: id 
          }).catch(console.error);

          // Update watch history if logged in
          api.post('/users/history', {
            anime_id: data.data.anime_id,
            episode_id: id,
            progress: 0
          }).catch(() => {});
        }
      } catch (error) {
        toast.error('Failed to load video player');
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEpisode();
    window.scrollTo(0, 0);
  }, [id, navigate]);

  const handleNextEpisode = () => {
    if (!anime || !episode) return;
    const currentIndex = anime.episodes?.findIndex(e => e.id === episode.id) ?? -1;
    if (currentIndex !== -1 && anime.episodes && currentIndex < anime.episodes.length - 1) {
      navigate(`/watch/${anime.episodes[currentIndex + 1].id}`);
    } else {
      toast.success('You have reached the latest episode!');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6">
        <div className="aspect-video w-full bg-dark-accent rounded-3xl animate-pulse mb-12" />
        <div className="h-10 w-1/2 bg-dark-accent rounded mb-6" />
        <div className="h-40 w-full bg-dark-accent rounded" />
      </div>
    );
  }

  if (!episode || !anime) return null;

  return (
    <div className="container mx-auto px-6">
      {/* Back & Breadcrumbs */}
      <div className="flex items-center gap-4 mb-8">
        <Link 
          to={`/anime/${anime.id}`} 
          aria-label={`Go back to ${anime.title} details`}
          className="p-2 bg-dark-accent hover:bg-dark-border rounded-full transition-colors"
        >
          <ChevronLeft size={24} />
        </Link>
        <div>
          <h2 className="text-xl font-black italic uppercase tracking-tighter">
            {anime.title}
          </h2>
          <p className="text-sm text-primary font-bold uppercase tracking-widest">
            Episode {episode.episode_number}: {episode.title || 'Untitled'}
          </p>
        </div>
      </div>

      {/* Video Player */}
      <section className="mb-12">
        <VideoPlayer 
          url={episode.video_url || ''} 
          qualities={{
            '720p': episode.video_url_720p,
            '1080p': episode.video_url_1080p,
            '4k': episode.video_url_4k
          }}
          title={`${anime.title} - Episode ${episode.episode_number}`}
          onEnded={handleNextEpisode}
        />
      </section>

      {/* Video Info & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* Episode Info */}
          <section className="bg-dark-light/20 border border-dark-border/30 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter">Episode Info</h3>
              <div className="flex gap-4">
                <button 
                  aria-label="Share this episode"
                  className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors"
                >
                  <Share2 size={20} />
                  <span className="text-sm font-bold uppercase">Share</span>
                </button>
                <button 
                  aria-label="Report an issue with this video"
                  className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors"
                >
                  <MessageCircle size={20} />
                  <span className="text-sm font-bold uppercase">Report</span>
                </button>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed">
              You are watching <span className="text-white font-bold">{anime.title}</span> Episode {episode.episode_number}.
              If the video is buffering or not loading, try refreshing the page or checking your connection. 
              Our servers provide high-definition streaming for the best viewing experience.
            </p>
          </section>

          {/* Episode Selection */}
          <section>
             <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                  <List size={22} className="text-primary" />
                </div>
                <h3 className="text-2xl font-black italic uppercase tracking-tighter">Selection</h3>
             </div>
             <EpisodeList animeId={anime.id} episodes={anime.episodes || []} currentEpisodeId={episode.id} />
          </section>
        </div>

        <div className="space-y-12">
          {/* Anime Sidebar Info */}
          <section className="bg-dark-light/30 border border-dark-border/50 rounded-2xl p-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />
            <img src={anime.thumbnail_url} className="w-full aspect-[2/3] object-cover rounded-xl mb-6 shadow-xl" />
            <h4 className="text-lg font-bold mb-4 line-clamp-1">{anime.title}</h4>
            <div className="flex flex-wrap gap-2 mb-6">
              {anime.anime_categories?.slice(0, 3).map(cat => (
                <span key={cat.category_id} className="text-[10px] font-bold uppercase px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-gray-400">
                  {cat.categories.name}
                </span>
              ))}
            </div>
            <Link to={`/anime/${anime.id}`}>
              <Button variant="outline" className="w-full">
                <Info size={18} />
                Anime Details
              </Button>
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
};
