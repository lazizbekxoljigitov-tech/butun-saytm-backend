import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Play, Loader2, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { socket } from '../services/socketService';
import { useRoomsStore } from '../store/roomsStore';
import api from '../../../services/api';
import { Anime } from '../../../types';

interface AnimeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AnimeSelectionModal = ({ isOpen, onClose }: AnimeSelectionModalProps) => {
  const { t } = useTranslation();
  const { updateAnime, currentRoom } = useRoomsStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmAnime, setConfirmAnime] = useState<Anime | null>(null);

  useEffect(() => {
    const fetchAnime = async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get('/anime', { params: { search: query } });
        if (data.success) {
          setResults(Array.isArray(data.data) ? data.data : (data.data.anime || []));
        }
      } catch (error) {
        console.error('Failed to fetch anime:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      const timeoutId = setTimeout(fetchAnime, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [query, isOpen]);

  const handleConfirmSelect = () => {
    if (!confirmAnime) return;
    updateAnime(confirmAnime.id);
    if (currentRoom) {
      socket.emit('room:update_anime', { roomId: currentRoom.id, animeId: confirmAnime.id });
    }
    setConfirmAnime(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-2xl bg-[#131320] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
          >
            {/* Header */}
            <div className="p-5 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.02]">
              <h2 className="text-lg font-bold text-white">Select Anime</h2>
              <button onClick={onClose} className="p-2 hover:bg-white/[0.06] rounded-xl transition-all text-gray-500 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {/* Search */}
            <div className="p-5 border-b border-white/[0.06]">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for anime…"
                  className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl py-2.5 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-purple-500/30 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
              </div>
            </div>

            {/* Results Grid */}
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="aspect-[3/4] bg-white/[0.04] rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : results.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {results.map((anime) => (
                    <motion.button
                      key={anime.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setConfirmAnime(anime)}
                      className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-dark-bg cursor-pointer text-left border border-white/[0.04] hover:border-white/[0.12] transition-all duration-200"
                    >
                      <img src={anime.thumbnail_url} alt={anime.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                        <h3 className="font-bold text-white text-sm line-clamp-2 mb-1.5">{anime.title}</h3>
                        <div className="flex items-center gap-1.5 text-purple-400 text-xs font-bold uppercase tracking-wider">
                          <Play size={10} fill="currentColor" /> Select
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-14 h-14 bg-white/[0.04] rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Search size={24} className="text-gray-600" />
                  </div>
                  <p className="text-gray-500 text-sm">
                    {query ? `No anime found for "${query}"` : 'Search for an anime to watch'}
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Confirmation Modal */}
          <AnimatePresence>
            {confirmAnime && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 p-4"
                onClick={() => setConfirmAnime(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-[#151520] border border-white/[0.08] rounded-2xl p-6 max-w-sm w-full"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                      <AlertTriangle size={16} className="text-orange-400" />
                    </div>
                    <h3 className="font-bold text-white">Change Anime?</h3>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">
                    Switch to <span className="text-white font-semibold">{confirmAnime.title}</span>?
                  </p>
                  <p className="text-gray-500 text-xs mb-5">This will reset playback for everyone in the room.</p>
                  <div className="flex justify-end gap-3">
                    <button onClick={() => setConfirmAnime(null)} className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] rounded-xl text-sm font-medium text-gray-300 transition-all duration-200">
                      Cancel
                    </button>
                    <button onClick={handleConfirmSelect} className="px-4 py-2 bg-purple-500 hover:bg-purple-400 rounded-xl text-sm font-bold text-white shadow-lg shadow-purple-500/20 transition-all duration-200 active:scale-95">
                      <Play size={12} fill="currentColor" className="inline mr-1" />
                      Confirm
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
};
