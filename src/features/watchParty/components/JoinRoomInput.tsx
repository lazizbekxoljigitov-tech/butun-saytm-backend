import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Play, AlertCircle, CheckCircle } from 'lucide-react';
import { useRoomsStore } from '../store/roomsStore';
import { useWatchPartyUserStore } from '../store/userStore';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export const JoinRoomInput = () => {
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const { joinRoom, isRoomLoading } = useRoomsStore();
  const { user } = useWatchPartyUserStore();
  const navigate = useNavigate();

  const validateRoomId = (value: string) => {
    const upper = value.toUpperCase();
    setRoomId(upper);
    setError(null);

    if (!upper) {
      setIsValid(false);
      return;
    }
    if (!upper.startsWith('ROOM-')) {
      setError('Must start with ROOM-');
      setIsValid(false);
      return;
    }
    if (upper.length < 9) {
      setIsValid(false);
      return;
    }
    setIsValid(true);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId.trim() || !user || !isValid) return;

    try {
      await joinRoom(roomId.trim(), user);
      toast.success('Joined room!');
      navigate(`/party/${roomId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to join room');
      toast.error(err.message || 'Failed to join room');
    }
  };

  return (
    <form onSubmit={handleJoin} className="w-full">
      <div className="relative group">
        <input
          type="text"
          value={roomId}
          onChange={(e) => validateRoomId(e.target.value)}
          placeholder="ROOM-XXXX"
          maxLength={16}
          className={`w-full pl-5 pr-14 py-3.5 bg-white/[0.04] border rounded-2xl text-white placeholder-gray-600 font-mono focus:outline-none focus:ring-2 transition-all duration-200 text-sm ${
            error
              ? 'border-red-500/30 focus:ring-red-500/20'
              : isValid
                ? 'border-green-500/30 focus:ring-green-500/20'
                : 'border-white/[0.06] focus:ring-purple-500/20 focus:border-purple-500/30 hover:border-white/[0.1]'
          }`}
        />

        {/* Validation indicator */}
        {roomId && !isRoomLoading && (
          <div className="absolute right-14 top-1/2 -translate-y-1/2">
            {error ? (
              <AlertCircle size={14} className="text-red-400" />
            ) : isValid ? (
              <CheckCircle size={14} className="text-green-400" />
            ) : null}
          </div>
        )}

        <div className="absolute inset-y-0 right-2 flex items-center">
          <AnimatePresence mode="wait">
            {isRoomLoading ? (
              <motion.div key="loading" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="p-2">
                <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
              </motion.div>
            ) : (
              <motion.button
                key="join"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                type="submit"
                disabled={!isValid}
                className="p-2.5 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl shadow-lg disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200"
              >
                <Play size={16} fill="currentColor" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-red-400 text-xs mt-2 ml-1 font-medium flex items-center gap-1"
          >
            <AlertCircle size={11} /> {error}
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  );
};
