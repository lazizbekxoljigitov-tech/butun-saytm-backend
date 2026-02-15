import { useState, useEffect } from 'react';
import { useAuthStore } from '../features/auth/store/authStore';
import { useNavigate, Navigate } from 'react-router-dom';
import api from '../services/api';
import { WatchHistory, Anime } from '../types';
import { AnimeCard } from '../components/anime/AnimeCard';
import { Button } from '../components/ui/Button';
import { Camera, User, History, Bookmark, LogOut, Settings } from 'lucide-react';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';

export const Profile = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated, logout, updateUser } = useAuthStore();
  const [history, setHistory] = useState<WatchHistory[]>([]);
  const [saved, setSaved] = useState<{ anime: Anime }[]>([]);
  const [activeTab, setActiveTab] = useState<'history' | 'watchlist'>('history');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [historyRes, savedRes] = await Promise.all([
          api.get('/users/history'),
          api.get('/users/saved')
        ]);
        setHistory(historyRes.data.data);
        setSaved(savedRes.data.data);
      } catch (error) {
        console.error('Failed to fetch profile data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const { data } = await api.put('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (data.success) {
        updateUser(data.data);
        toast.success('Avatar updated successfully!');
      }
    } catch (error) {
      toast.error('Failed to update avatar');
    }
  };

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="container mx-auto px-6">
      <header className="mb-12">
        <div className="relative h-48 md:h-64 w-full rounded-2xl md:rounded-3xl overflow-hidden mb-[-60px] md:mb-[-80px] shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-dark-surface to-dark-bg" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/60 to-transparent" />
        </div>

        <div className="relative px-4 md:px-8 flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
          <div className="relative group">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl md:rounded-3xl bg-dark-accent border-4 border-dark-bg overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-105">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-700 bg-dark-light">
                  <User size={64} className="md:w-16 md:h-16 w-12 h-12" />
                </div>
              )}
            </div>
            <label className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer rounded-2xl md:rounded-3xl">
              <Camera className="text-white" size={28} />
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
            </label>
          </div>

          <div className="flex-grow pb-2">
            <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter mb-1 text-white leading-tight">{user?.name}</h1>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest rounded-md border border-primary/30">
                {user?.role === 'admin' ? 'SYSTEM ADMIN' : 'ELITE MEMBER'}
              </span>
              <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                {t('profile.account')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3 pb-2 w-full md:w-auto">
            <Button variant="secondary" className="flex-1 md:flex-none bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10" onClick={() => navigate('/settings')}>
              <Settings size={18} />
              <span className="hidden md:inline">{t('profile.settings')}</span>
            </Button>
            <Button onClick={logout} variant="danger" className="flex-1 md:flex-none bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20">
              <LogOut size={18} />
              <span className="hidden md:inline">{t('profile.logout')}</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 md:gap-12 mt-16 md:mt-20">
        <aside className="lg:col-span-1 lg:border-r border-dark-border/30 lg:pr-8">
           <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 scrollbar-hide">
              <button 
                onClick={() => setActiveTab('history')}
                className={`flex-1 lg:flex-none flex items-center gap-3 md:gap-4 px-5 md:px-6 py-3 md:py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] md:text-xs transition-all whitespace-nowrap ${
                  activeTab === 'history' ? 'bg-primary text-white shadow-lg shadow-primary/30 border border-primary' : 'text-gray-500 bg-white/5 border border-white/5 hover:bg-dark-accent'
                }`}
              >
                <History size={16} className="md:w-[18px] md:h-[18px]" />
                {t('profile.watch_history')}
              </button>
              <button 
                onClick={() => setActiveTab('watchlist')}
                className={`flex-1 lg:flex-none flex items-center gap-3 md:gap-4 px-5 md:px-6 py-3 md:py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] md:text-xs transition-all whitespace-nowrap ${
                  activeTab === 'watchlist' ? 'bg-primary text-white shadow-lg shadow-primary/30 border border-primary' : 'text-gray-500 bg-white/5 border border-white/5 hover:bg-dark-accent'
                }`}
              >
                <Bookmark size={16} className="md:w-[18px] md:h-[18px]" />
                {t('profile.my_watchlist')}
              </button>
           </div>
        </aside>

        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {activeTab === 'history' ? (
              <motion.div
                key="history"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-3">
                  <span className="w-8 h-1 bg-primary rounded-full" />
                  {t('profile.continue_watching')}
                </h3>
                {isLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {[1,2,3].map(i => <SkeletonCard key={i} />)}
                  </div>
                ) : history.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {history.map(item => (
                      <div key={item.id} className="relative group">
                         <AnimeCard anime={item.anime!} />
                         <div className="absolute bottom-2 left-2 right-2 h-1 bg-gray-800 rounded-full overflow-hidden">
                           <div className="bg-primary h-full" style={{ width: `${item.progress}%` }} />
                         </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center bg-dark-light/20 rounded-3xl border border-dark-border/30">
                    <History size={48} className="mx-auto text-gray-700 mb-4" />
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">{t('profile.no_history')}</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="watchlist"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                 <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-3">
                  <span className="w-8 h-1 bg-primary rounded-full" />
                  {t('profile.saved_for_later')}
                </h3>
                {isLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {[1,2,3].map(i => <SkeletonCard key={i} />)}
                  </div>
                ) : saved.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {saved.map(item => (
                      <AnimeCard key={item.anime.id} anime={item.anime} />
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center bg-dark-light/20 rounded-3xl border border-dark-border/30">
                    <Bookmark size={48} className="mx-auto text-gray-700 mb-4" />
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">{t('profile.no_watchlist')}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
