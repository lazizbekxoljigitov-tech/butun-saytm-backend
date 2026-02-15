import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Anime, Category } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Upload, 
  Image as ImageIcon,
  Star,
  Film,
  X,
  PlusCircle,
  Play
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { supabase } from '../../services/supabase';

export const AdminAnime = () => {
  const [anime, setAnime] = useState<Anime[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { t } = useTranslation();
  
  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnime, setEditingAnime] = useState<Anime | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rating: '0',
    status: 'ongoing',
    is_trending: false,
    is_featured: false,
    category_ids: [] as string[]
  });
  
  const [files, setFiles] = useState<{
    mainImage: File | null;
  }>({
    mainImage: null
  });

  useEffect(() => {
    fetchAnime();
    fetchCategories();
  }, []);

  const fetchAnime = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/anime?limit=100');
      setAnime(data.data.anime);
    } catch (error) {
      toast.error(t('common.error_fetching') || 'Failed to fetch anime');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data.data);
    } catch (error) {
      console.error('Failed to fetch categories');
    }
  };

  const handleOpenModal = (item?: Anime) => {
    if (item) {
      setEditingAnime(item);
      setFormData({
        title: item.title,
        description: item.description || '',
        rating: item.rating.toString(),
        status: item.status,
        is_trending: item.is_trending,
        is_featured: item.is_featured,
        category_ids: item.anime_categories?.map(c => c.category_id) || []
      });
    } else {
      setEditingAnime(null);
      setFormData({
        title: '',
        description: '',
        rating: '0',
        status: 'ongoing',
        is_trending: false,
        is_featured: false,
        category_ids: []
      });
    }
    setFiles({ mainImage: null });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this anime? All episodes will be deleted too.')) return;
    
    try {
      await api.delete(`/anime/${id}`);
      toast.success('Anime deleted successfully');
      fetchAnime();
    } catch (error) {
      toast.error('Failed to delete anime');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      let bannerUrl = editingAnime?.banner_url || '';
      let thumbnailUrl = editingAnime?.thumbnail_url || '';

      // 1. Handle Poster/Banner Upload
      if (files.mainImage) {
        const file = files.mainImage;
        const fileExt = file.name.split('.').pop();
        const fileName = `banners/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('banners') 
          .upload(fileName, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('banners')
          .getPublicUrl(fileName);

        bannerUrl = publicUrl;
        thumbnailUrl = publicUrl;
      }

      // 2. Prepare JSON Payload
      const payload = {
        title: formData.title,
        description: formData.description,
        rating: Number(formData.rating),
        status: formData.status,
        is_trending: formData.is_trending,
        is_featured: formData.is_featured,
        category_ids: formData.category_ids,
        banner_url: bannerUrl,
        thumbnail_url: thumbnailUrl
      };

      // 3. Save Meta to DB
      if (editingAnime) {
        await api.put(`/anime/${editingAnime.id}`, payload);
        toast.success('Anime information updated');
      } else {
        await api.post('/anime', payload);
        toast.success('New anime created successfully');
      }
      
      setIsModalOpen(false);
      fetchAnime();
    } catch (error: any) {
      console.error('Anime Operation Failed:', error);
      toast.error(error.message || 'Failed to save anime');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCategoryToggle = (id: string) => {
    setFormData(prev => ({
      ...prev,
      category_ids: prev.category_ids.includes(id)
        ? prev.category_ids.filter(cid => cid !== id)
        : [...prev.category_ids, id]
    }));
  };

  const filteredAnime = anime.filter(item => 
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black uppercase italic tracking-tighter">
                {t('admin.anime_management')}
              </h1>
              <p className="text-gray-500 mt-1">{t('admin.anime_management_desc') || 'Manage your anime catalog'}</p>
            </div>
            <Button onClick={() => handleOpenModal()} className="h-12 px-8 gap-2">
              <Plus size={20} />
              {t('admin.add_anime')}
            </Button>
          </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              placeholder={t('common.search') + "..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-dark-accent border border-dark-border/50 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition-all font-medium"
            />
          </div>
          <Button onClick={() => handleOpenModal()} className="shadow-xl shadow-primary/20 whitespace-nowrap">
            <Plus size={20} />
            Add Anime
          </Button>
        </div>
      </header>

      {/* Anime Table */}
      <Card className="border-dark-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-dark-accent/50 border-b border-dark-border/50">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500">Anime</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500">Rating</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500">Activity</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border/30">
              {isLoading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-8"><div className="h-4 bg-dark-accent rounded w-full" /></td>
                  </tr>
                ))
              ) : filteredAnime.length > 0 ? (
                filteredAnime.map(item => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img src={item.thumbnail_url} className="w-12 h-16 object-cover rounded-lg shadow-lg" />
                        <div>
                          <p className="font-bold text-white mb-1">{item.title}</p>
                          <p className="text-xs text-gray-500 line-clamp-1 max-w-[200px]">{item.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-primary">
                        <Star size={14} className="fill-primary" />
                        <span className="font-bold">{item.rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter ${
                        item.status === 'ongoing' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {item.is_trending && (
                          <span className="text-[10px] font-bold text-primary uppercase">Trending</span>
                        )}
                        {item.is_featured && (
                          <span className="text-[10px] font-bold text-blue-400 uppercase">Featured</span>
                        )}
                        {!item.is_trending && !item.is_featured && (
                          <span className="text-[10px] font-bold text-gray-500 uppercase">Regular</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link title="Manage Episodes" to={`/admin/episodes/${item.id}`} className="p-2 text-gray-400 hover:text-white hover:bg-dark-accent rounded-lg transition-all">
                          <Play size={18} />
                        </Link>
                        <button title="Edit" onClick={() => handleOpenModal(item)} className="p-2 text-blue-400 hover:text-white hover:bg-blue-500/20 rounded-lg transition-all">
                          <Edit size={18} />
                        </button>
                        <button title="Delete" onClick={() => handleDelete(item.id)} className="p-2 text-red-400 hover:text-white hover:bg-red-500/20 rounded-lg transition-all">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <p className="text-gray-500 font-bold uppercase tracking-widest">No anime found matching your search</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal / Form */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-dark-bg border border-dark-border w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-8 md:p-12 no-scrollbar"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter">
                  {editingAnime ? t('common.edit') : t('admin.add_anime')} <span className="text-primary">Anime</span>
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-500 hover:text-white bg-dark-accent rounded-xl">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <Input 
                      label={t('admin.title_label')} 
                      placeholder="e.g. Solo Leveling" 
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                    />
                    
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-400 ml-1">{t('admin.description_label')}</label>
                      <textarea 
                        className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all h-32 resize-none"
                        placeholder="..."
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <Input 
                        label={t('admin.rating_label') + " (0.0 - 10.0)"} 
                        type="number" 
                        step="0.1" 
                        min="0" 
                        max="10"
                        value={formData.rating}
                        onChange={(e) => setFormData({...formData, rating: e.target.value})}
                      />
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-400 ml-1">{t('admin.status_label')}</label>
                        <select 
                          className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                          value={formData.status}
                          onChange={(e) => setFormData({...formData, status: e.target.value})}
                        >
                          <option value="ongoing">{t('common.ongoing') || 'Ongoing'}</option>
                          <option value="completed">{t('common.completed') || 'Completed'}</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-6 pt-2">
                       <label className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            className="w-5 h-5 rounded border-dark-border bg-dark-accent checked:bg-primary transition-all"
                            checked={formData.is_trending}
                            onChange={(e) => setFormData({...formData, is_trending: e.target.checked})}
                          />
                          <span className="text-sm font-bold uppercase tracking-widest group-hover:text-primary transition-colors">Trending</span>
                       </label>
                       <label className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            className="w-5 h-5 rounded border-dark-border bg-dark-accent checked:bg-primary transition-all"
                            checked={formData.is_featured}
                            onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                          />
                          <span className="text-sm font-bold uppercase tracking-widest group-hover:text-primary transition-colors">Featured</span>
                       </label>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Main Anime Image */}
                    <div className="space-y-4">
                       <label className="text-sm font-medium text-gray-400 ml-1">{t('admin.anime_image_label') || "Anime Image (Poster & Banner)"}</label>
                       <div className="relative group aspect-[16/9] rounded-2xl border-2 border-dashed border-dark-border bg-dark-accent flex flex-col items-center justify-center overflow-hidden hover:border-primary/50 transition-all">
                          {(files.mainImage || editingAnime?.thumbnail_url) ? (
                            <img 
                              src={files.mainImage ? URL.createObjectURL(files.mainImage) : editingAnime?.thumbnail_url} 
                              className="absolute inset-0 w-full h-full object-cover" 
                            />
                          ) : (
                            <div className="flex flex-col items-center text-gray-500">
                               <ImageIcon size={40} className="mb-2" />
                               <span className="text-xs font-bold uppercase">{t('common.upload') || 'Upload Image'}</span>
                            </div>
                          )}
                          <input 
                            type="file" 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            accept="image/*"
                            onChange={(e) => setFiles({ mainImage: e.target.files?.[0] || null })}
                          />
                       </div>
                       <p className="text-[10px] text-gray-500 italic px-2">
                         Bu rasm ham asosi (poster), ham dashboard (banner) uchun ishlatiladi.
                       </p>
                    </div>

                    {/* Categories Selection */}
                    <div className="space-y-4">
                       <label className="text-sm font-medium text-gray-400 ml-1">{t('admin.categories_label')}</label>
                       <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto no-scrollbar p-1">
                          {categories.map(cat => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => handleCategoryToggle(cat.id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                formData.category_ids.includes(cat.id)
                                ? 'bg-primary border-primary text-white'
                                : 'bg-dark-accent border-dark-border text-gray-500 hover:border-primary/30'
                              }`}
                            >
                              {cat.name}
                            </button>
                          ))}
                       </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-dark-border/30">
                  <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>{t('common.cancel')}</Button>
                  <Button type="submit" isLoading={isSaving} className="px-12 h-14 rounded-xl text-lg">
                    {editingAnime ? t('admin.updating_button') : t('admin.creating_button')}
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
