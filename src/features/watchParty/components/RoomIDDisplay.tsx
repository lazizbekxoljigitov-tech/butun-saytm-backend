import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Share2, Users } from 'lucide-react';
import { useRoomsStore } from '../store/roomsStore';
import toast from 'react-hot-toast';

export const RoomIDDisplay = () => {
  const { currentRoom } = useRoomsStore();
  const [copied, setCopied] = useState(false);

  if (!currentRoom) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentRoom.id);
    setCopied(true);
    toast.success('Room ID copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-dark-light/50 border border-white/5 rounded-2xl p-4 flex items-center justify-between gap-4"
    >
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/20 rounded-xl text-primary">
          <Users size={20} />
        </div>
        <div>
           <p className="text-xs text-gray-400 font-mono tracking-wider">ROOM ID</p>
           <h3 className="text-xl font-black text-white tracking-tight">{currentRoom.id}</h3>
        </div>
      </div>

      <div className="flex items-center gap-2">
         <button 
           onClick={handleCopy}
           className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors relative"
         >
            <AnimatePresence mode='wait'>
               {copied ? (
                  <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                     <Check size={20} className="text-green-500" />
                  </motion.div>
               ) : (
                  <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                     <Copy size={20} />
                  </motion.div>
               )}
            </AnimatePresence>
         </button>
         
         <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
            <Share2 size={20} />
         </button>
      </div>
    </motion.div>
  );
};
