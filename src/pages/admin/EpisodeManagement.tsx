import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Episode, Anime } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { 
  Plus, 
  Trash2, 
  Play, 
  ChevronLeft, 
  X, 
  Upload, 
  Clock,
  Video
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { supabase } from '../../services/supabase';

export const AdminEpisodes = () => {
  const { animeId } = useParams<{ animeId: string }>();
  const navigate = useNavigate();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();
  
  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    episode_number: '',
    duration: '24'
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoUrl720, setVideoUrl720] = useState('');
  const [videoUrl1080, setVideoUrl1080] = useState('');
  const [videoUrl4k, setVideoUrl4k] = useState('');
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');

  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchData();
  }, [animeId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: animeData } = await api.get(`/anime/${animeId}`);
      setAnime(animeData.data);
      
      const { data: episodesData } = await api.get(`/episodes/anime/${animeId}`);
      setEpisodes(episodesData.data);
    } catch (error) {
      toast.error('Failed to load episodes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadMode === 'file' && !videoFile) return toast.error('Please select a video file');
    if (uploadMode === 'url' && !videoUrl) return toast.error('Please enter a video URL');
    
    setIsSaving(true);
    setUploadProgress(0);

    try {
      let finalVideoUrl = videoUrl;

      // 1. Handle File Upload if in 'file' mode
      if (uploadMode === 'file' && videoFile) {
        const file = videoFile;
        const fileExt = file.name.split('.').pop();
        const fileName = `episodes/${animeId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        // Simulating progress for feedback since standard upload doesn't provide it
        const progressInterval = setInterval(() => {
           setUploadProgress(prev => (prev < 90 ? prev + 5 : prev));
        }, 1000);

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('videos')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true,
          });

        clearInterval(progressInterval);
        if (uploadError) throw uploadError;

        setUploadProgress(100);

        const { data: { publicUrl } } = supabase.storage
          .from('videos')
          .getPublicUrl(fileName);
        
        finalVideoUrl = publicUrl;
      }

      // 2. Prepare JSON Payload for the Backend
      const payload = {
        anime_id: animeId,
        title: formData.title,
        episode_number: Number(formData.episode_number),
        duration: Number(formData.duration),
        video_url: finalVideoUrl,
        video_url_720p: videoUrl720,
        video_url_1080p: videoUrl1080,
        video_url_4k: videoUrl4k
      };

      // 3. Save to Database via Backend
      await api.post('/episodes', payload);

      toast.success('Episode successfully added to library!');
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Operation Failed:', error);
      toast.error(error.message || 'Error occurred during upload or save');
    } finally {
      setIsSaving(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', episode_number: '', duration: '24' });
    setVideoFile(null);
    setVideoUrl('');
    setVideoUrl720('');
    setVideoUrl1080('');
    setVideoUrl4k('');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this episode? This cannot be undone.')) return;
    try {
      await api.delete(`/episodes/${id}`);
      toast.success('Episode deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete episode');
    }
  };

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/anime')} className="p-2 bg-dark-accent hover:bg-dark-border rounded-xl transition-all">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-1">
              {anime?.title || 'Anime'} <span className="text-primary italic">Episodes</span>
            </h1>
            <p className="text-gray-500 font-medium">{episodes.length} Episodes total</p>
          </div>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="shadow-xl shadow-primary/20">
          <Plus size={20} />
          {t('admin.upload_episode')}
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-4">
         {isLoading ? (
           [1,2,3].map(i => <div key={i} className="h-20 bg-dark-accent rounded-2xl animate-pulse" />)
         ) : episodes.length > 0 ? (
           episodes.sort((a,b) => a.episode_number - b.episode_number).map(ep => (
             <div key={ep.id} className="group flex items-center gap-6 p-4 bg-dark-light/40 border border-dark-border/50 rounded-2xl hover:border-primary/30 transition-all">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                   <Play size={24} className="fill-primary" />
                </div>
                <div className="flex-grow">
                   <h4 className="font-bold text-lg">
                     <span className="text-primary mr-2">EP {ep.episode_number}:</span>
                     {ep.title || 'Untitled Episode'}
                   </h4>
                   <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                         <Clock size={12} />
                         {ep.duration} Minutes
                      </span>
                   </div>
                </div>
                <button onClick={() => handleDelete(ep.id)} className="p-3 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                   <Trash2 size={20} />
                </button>
             </div>
           ))
         ) : (
           <div className="py-24 text-center bg-dark-light/20 rounded-3xl border border-dark-border/30">
              <Video size={48} className="mx-auto text-gray-700 mb-4" />
              <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">No episodes uploaded yet</p>
           </div>
         )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-dark-bg border border-dark-border w-full max-w-lg rounded-3xl shadow-2xl p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">
                  Upload <span className="text-primary">Episode</span>
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-500 hover:text-white bg-dark-accent rounded-xl">
                   <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <Input 
                      label="Episode Number" 
                      type="number" 
                      required
                      value={formData.episode_number}
                      onChange={(e) => setFormData({...formData, episode_number: e.target.value})}
                    />
                    <Input 
                      label="Duration (Min)" 
                      type="number" 
                      required
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    />
                 </div>
                 
                 <Input 
                   label={t('admin.episode_title_label') || "Episode Title (Optional)"} 
                   placeholder="e.g. The Beginning"
                   value={formData.title}
                   onChange={(e) => setFormData({...formData, title: e.target.value})}
                 />

                  <div className="flex bg-dark-accent p-1 rounded-xl gap-1">
                     <button 
                       type="button"
                       onClick={() => setUploadMode('file')}
                       className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all ${uploadMode === 'file' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:text-white'}`}
                     >
                       {t('admin.upload_mode_file')}
                     </button>
                     <button 
                       type="button"
                       onClick={() => setUploadMode('url')}
                       className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all ${uploadMode === 'url' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:text-white'}`}
                     >
                       {t('admin.upload_mode_url')}
                     </button>
                  </div>

                  {uploadMode === 'file' ? (
                    <div className="space-y-1.5">
                       <label className="text-sm font-medium text-gray-400 ml-1">Video File</label>
                       <div className="relative group h-32 rounded-2xl border-2 border-dashed border-dark-border bg-dark-accent flex flex-col items-center justify-center overflow-hidden hover:border-primary/50 transition-all">
                           {videoFile ? (
                              <div className="flex flex-col items-center text-primary">
                                 <Video size={32} />
                                 <span className="text-xs font-bold uppercase mt-2 truncate max-w-[200px]">{videoFile.name}</span>
                              </div>
                           ) : (
                              <div className="flex flex-col items-center text-gray-500">
                                 <Upload size={32} />
                                 <span className="text-xs font-bold uppercase mt-2">Select Video</span>
                              </div>
                           )}
                           <input 
                             type="file" 
                             className="absolute inset-0 opacity-0 cursor-pointer" 
                             accept="video/*"
                             onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                           />
                       </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Input 
                        label="Default Video URL (Required)" 
                        placeholder="https://cdn.example.com/video.mp4"
                        required
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                      />
                      <div className="grid grid-cols-1 gap-4 p-4 bg-dark-accent/30 rounded-2xl border border-dark-border/50">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Multi-Quality Links (Optional)</p>
                        <Input 
                          label="720p URL" 
                          placeholder="https://..."
                          value={videoUrl720}
                          onChange={(e) => setVideoUrl720(e.target.value)}
                        />
                        <Input 
                          label="1080p URL" 
                          placeholder="https://..."
                          value={videoUrl1080}
                          onChange={(e) => setVideoUrl1080(e.target.value)}
                        />
                        <Input 
                          label="4K (AI) URL" 
                          placeholder="https://..."
                          value={videoUrl4k}
                          onChange={(e) => setVideoUrl4k(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {isSaving && (
                     <div className="space-y-2 pt-2">
                        <div className="flex justify-between text-xs font-bold uppercase text-gray-500">
                           <span>Uploading...</span>
                           <span>{uploadProgress}%</span>
                        </div>
                        <div className="h-2 bg-dark-accent rounded-full overflow-hidden">
                           <motion.div 
                              className="h-full bg-primary"
                              initial={{ width: 0 }}
                              animate={{ width: `${uploadProgress}%` }}
                           />
                        </div>
                     </div>
                  )}

                 <div className="flex justify-end gap-3 pt-4">
                    <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)} disabled={isSaving}>Cancel</Button>
                    <Button type="submit" isLoading={isSaving} className="px-10 h-14 rounded-xl" disabled={isSaving}>
                       {isSaving ? 'Uploading...' : 'Start Upload'}
                    </Button>
                 </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
