import { Play, CheckCircle } from 'lucide-react';
import { Episode } from '../../types';
import { Link } from 'react-router-dom';

interface EpisodeListProps {
  animeId: string;
  episodes: Episode[];
  currentEpisodeId?: string;
}

export const EpisodeList = ({ animeId, episodes, currentEpisodeId }: EpisodeListProps) => {
  if (!episodes || episodes.length === 0) {
    return (
      <div className="bg-dark-light/30 border border-dark-border/50 rounded-2xl p-12 text-center">
        <p className="text-gray-500 font-medium">No episodes available yet for this anime.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {episodes.map((episode) => (
        <Link
          key={episode.id}
          to={`/watch/${episode.id}`}
          className={`group flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
            episode.id === currentEpisodeId
              ? 'bg-primary/20 border-primary shadow-lg shadow-primary/10'
              : 'bg-dark-light/40 border-dark-border/50 hover:border-primary/50'
          }`}
        >
          <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-dark-accent">
            <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${
              episode.id === currentEpisodeId ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}>
              <Play className={`fill-white ${episode.id === currentEpisodeId ? 'text-white' : 'text-primary'}`} size={20} />
            </div>
            <div className="absolute bottom-1 right-1 bg-black/60 px-1 rounded text-[10px] font-bold">
               {episode.duration > 0 ? `${episode.duration}m` : 'HD'}
            </div>
          </div>

          <div className="flex-grow">
            <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${
              episode.id === currentEpisodeId ? 'text-primary' : 'text-gray-500'
            }`}>
              Episode {episode.episode_number}
            </p>
            <h4 className="text-sm font-bold text-white line-clamp-1 group-hover:text-primary transition-colors">
              {episode.title || `Episode ${episode.episode_number}`}
            </h4>
          </div>

          {episode.id === currentEpisodeId && (
            <div className="text-primary">
              <CheckCircle size={18} />
            </div>
          )}
        </Link>
      ))}
    </div>
  );
};
