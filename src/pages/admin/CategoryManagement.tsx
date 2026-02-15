import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Category } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Plus, Edit, Trash2, X, FolderTree, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/categories');
      setCategories(data.data);
    } catch (error) {
      toast.error('Failed to fetch categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (cat?: Category) => {
    if (cat) {
      setCurrentCategory(cat);
      setCatName(cat.name);
    } else {
      setCurrentCategory(null);
      setCatName('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    
    setIsSaving(true);
    try {
      if (currentCategory) {
        await api.put(`/categories/${currentCategory.id}`, { name: catName });
        toast.success('Category updated successfully');
      } else {
        await api.post('/categories', { name: catName });
        toast.success('Category created successfully');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save category');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this category? This will remove it from all anime.')) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  return (
    <div className="space-y-12">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2">
            Category <span className="text-primary">Management</span>
          </h1>
          <p className="text-gray-500 font-medium">Manage genres and categories for better organization.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="shadow-xl shadow-primary/20">
          <Plus size={20} />
          New Category
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          [1,2,3,4].map(i => <div key={i} className="h-32 bg-dark-accent rounded-3xl animate-pulse" />)
        ) : categories.map(cat => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="p-6 group hover:border-primary/50 transition-all flex flex-col justify-between h-full">
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <FolderTree size={20} />
                 </div>
                 <h3 className="text-lg font-bold truncate">{cat.name}</h3>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-dark-border/30">
                 <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Active</span>
                 <div className="flex items-center gap-2">
                    <button onClick={() => handleOpenModal(cat)} className="p-2 text-gray-500 hover:text-primary transition-colors">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(cat.id)} className="p-2 text-gray-500 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                 </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-dark-bg border border-dark-border w-full max-w-md rounded-3xl shadow-2xl p-8"
            >
              <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-8">
                {currentCategory ? 'Edit' : 'New'} <span className="text-primary">Category</span>
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                 <Input 
                   label="Category Name" 
                   placeholder="e.g. Action, Isekai..." 
                   required
                   autoFocus
                   value={catName}
                   onChange={(e) => setCatName(e.target.value)}
                 />

                 <div className="flex justify-end gap-3 pt-4">
                    <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    <Button type="submit" isLoading={isSaving} className="px-8">
                      {currentCategory ? 'Update' : 'Create'}
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
