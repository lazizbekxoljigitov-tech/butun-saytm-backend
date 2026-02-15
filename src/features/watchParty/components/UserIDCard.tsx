import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Wifi } from 'lucide-react';
import { useWatchPartyUserStore } from '../store/userStore';
import toast from 'react-hot-toast';

export const UserIDCard = () => {
  const { user } = useWatchPartyUserStore();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!user?.id) return;
    navigator.clipboard.writeText(user.id);
    setCopied(true);
    toast.success('User ID copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] p-6 shadow-2xl h-full"
    >
      {/* Background Glow */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-purple-500/10 blur-[60px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-blue-500/8 blur-[60px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex items-center gap-5">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/[0.08] shadow-lg">
            <img
              src={user.avatar}
              alt={user.username}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#0a0a0f] rounded-full flex items-center justify-center">
            <div className={`w-3 h-3 rounded-full ${user.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-black tracking-tight text-white mb-1.5 truncate">
            {user.username}
          </h3>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[10px] font-mono text-gray-500 tracking-wider truncate max-w-[160px]">
              {user.id}
            </span>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg hover:bg-white/[0.08] text-gray-500 hover:text-white transition-all duration-200"
            >
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Check size={12} className="text-green-400" />
                  </motion.div>
                ) : (
                  <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Copy size={12} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Status Badge */}
        <div className="hidden sm:flex px-3 py-1.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-widest items-center gap-1.5 shrink-0">
          <Wifi size={12} />
          Online
        </div>
      </div>
    </motion.div>
  );
};
