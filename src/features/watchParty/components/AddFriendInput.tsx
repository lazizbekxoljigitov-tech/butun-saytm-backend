import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Search, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { useFriendsStore } from '../store/friendsStore';
import toast from 'react-hot-toast';
import api from '../../../services/api';

export const AddFriendInput = () => {
  const [id, setId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [foundUser, setFoundUser] = useState<{ id: string; name: string; avatar_url: string } | null>(null);
  const { addFriend } = useFriendsStore();

  useEffect(() => {
    const lookupUser = async () => {
      if (id.length > 20) {
        setIsLoading(true);
        setError(null);
        try {
          const { data } = await api.get(`/user/search-id/${id}`);
          if (data.success) {
            setFoundUser(data.data);
          }
        } catch {
          setFoundUser(null);
        } finally {
          setIsLoading(false);
        }
      } else {
        setFoundUser(null);
      }
    };

    const timer = setTimeout(lookupUser, 500);
    return () => clearTimeout(timer);
  }, [id]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim()) return;

    setIsAdding(true);
    setError(null);

    try {
      await addFriend(id.trim());
      setSuccess(true);
      toast.success('Friend added!');
      setTimeout(() => {
        setId('');
        setFoundUser(null);
        setSuccess(false);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to add friend');
      toast.error(err.message || 'Failed to add friend');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleAdd} className="relative space-y-3">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className={`w-4 h-4 transition-colors duration-200 ${error ? 'text-red-400' : 'text-gray-600 group-focus-within:text-purple-400'}`} />
          </div>

          <input
            type="text"
            value={id}
            onChange={(e) => {
              setId(e.target.value);
              setError(null);
              setSuccess(false);
            }}
            placeholder="Paste User ID here"
            className={`w-full pl-11 pr-12 py-3.5 bg-white/[0.04] border rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 transition-all duration-200 text-sm ${
              error
                ? 'border-red-500/30 focus:ring-red-500/20'
                : success
                  ? 'border-green-500/30 focus:ring-green-500/20'
                  : 'border-white/[0.06] focus:border-purple-500/30 focus:ring-purple-500/20 hover:border-white/[0.1]'
            }`}
          />

          <div className="absolute inset-y-0 right-3 flex items-center">
            {isLoading && <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {success && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3 text-green-400"
            >
              <Sparkles size={18} />
              <span className="text-sm font-medium">Friend added successfully!</span>
            </motion.div>
          )}

          {foundUser && !success && (
            <motion.div
              key="found"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-4 bg-white/[0.04] border border-white/[0.08] rounded-2xl flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <img
                  src={foundUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${foundUser.name}`}
                  alt={foundUser.name}
                  className="w-10 h-10 rounded-full border border-white/[0.08]"
                />
                <div>
                  <p className="font-bold text-white text-sm">{foundUser.name}</p>
                  <p className="text-[10px] text-gray-500 font-mono truncate max-w-[120px]">{foundUser.id}</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isAdding}
                className="flex items-center gap-1.5 px-4 py-2 bg-purple-500 hover:bg-purple-400 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-500/20 transition-all duration-200 active:scale-95 disabled:opacity-50"
              >
                {isAdding ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <UserPlus size={12} />
                )}
                Add Friend
              </button>
            </motion.div>
          )}

          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-xs font-medium"
            >
              <AlertCircle size={14} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
};
