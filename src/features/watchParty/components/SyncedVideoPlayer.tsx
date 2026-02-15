import { useEffect, useState } from 'react';
import { useRoomsStore } from '../store/roomsStore';
import { useWatchPartyUserStore } from '../store/userStore';
import { VideoPlayer } from '../../../components/player/VideoPlayer';
import api from '../../../services/api';
import { Episode } from '../../../types';

export const SyncedVideoPlayer = ({ animeId }: { animeId: string }) => {
  const { currentRoom, updateRoomState } = useRoomsStore();
  const { user } = useWatchPartyUserStore();
  const [episode, setEpisode] = useState<Episode | null>(null);
  
  // Fetch first episode or specific episode for the room
  useEffect(() => {
    const fetchEpisode = async () => {
      try {
        const { data } = await api.get(`/anime/${animeId}`);
        if (data.success && data.data.episodes?.length > 0) {
          setEpisode(data.data.episodes[0]);
        }
      } catch (error) {
        console.error('Failed to fetch anime for sync player:', error);
      }
    };
    if (animeId && animeId !== 'demo') {
      fetchEpisode();
    }
  }, [animeId]);

  if (!episode && animeId !== 'demo') {
    return (
      <div className="w-full aspect-video bg-dark-bg rounded-2xl flex items-center justify-center border border-white/5 animate-pulse">
        <span className="text-gray-500 font-bold uppercase tracking-widest">Loading Media...</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <VideoPlayer
        url={episode?.video_url || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}
        qualities={{
          '720p': episode?.video_url_720p,
          '1080p': episode?.video_url_1080p,
          '4k': episode?.video_url_4k
        }}
        title={`WATCH PARTY • ${episode?.title || 'Shared Stream'}`}
        isSyncing={true}
        externalState={{
          currentTime: currentRoom?.currentTime || 0,
          isPlaying: currentRoom?.isPlaying || false,
          lastUpdate: Date.now()
        }}
        onStateChange={(state) => {
          // Only host or authorized users update room state
          if (currentRoom?.hostId === user?.id) {
            updateRoomState(state);
          }
        }}
      />
      
      {/* Sync Status Overlay */}
      <div className="flex items-center gap-3 mt-4 px-2">
         <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
            <div className={`w-2 h-2 rounded-full ${currentRoom?.isPlaying ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
            <span className="text-[10px] font-black uppercase text-primary">Synced Room</span>
         </div>
         <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            {currentRoom?.participants?.length || 0} Viewers Connected
         </span>
      </div>
    </div>
  );
};
