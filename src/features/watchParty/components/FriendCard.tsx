import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Radio, UserMinus, AlertTriangle } from 'lucide-react';
import { Friend, useFriendsStore } from '../store/friendsStore';
import toast from 'react-hot-toast';

interface FriendCardProps {
  friend: Friend;
  index: number;
}

export const FriendCard = ({ friend, index }: FriendCardProps) => {
  const { removeFriend, inviteFriend, pendingInvites } = useFriendsStore();
  const isInvited = pendingInvites.includes(friend.id);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  const getStatusColor = (status: Friend['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'watching': return 'bg-blue-500';
      case 'in-room': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: Friend['status']) => {
    switch (status) {
      case 'online': return 'Online';
      case 'watching': return 'Watching Anime';
      case 'in-room': return 'In a Party';
      default: return 'Offline';
    }
  };

  const handleRemove = () => {
    removeFriend(friend.id);
    toast.success(`${friend.username} removed`);
    setShowRemoveConfirm(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04, duration: 0.2 }}
        className="group relative bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] rounded-2xl p-4 transition-all duration-200 hover:bg-white/[0.05] flex items-center gap-4"
      >
        {/* Avatar with Status */}
        <div className="relative shrink-0">
          <div className="w-11 h-11 rounded-xl overflow-hidden bg-dark-bg">
            <img src={friend.avatar} alt={friend.username} className="w-full h-full object-cover" />
          </div>
          <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#0a0a0f] ${getStatusColor(friend.status)} ${
            friend.status === 'online' ? 'animate-pulse' : ''
          }`} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-white text-sm truncate">{friend.username}</h4>
          <p className={`text-xs truncate ${friend.status === 'offline' ? 'text-gray-600' : 'text-gray-400'}`}>
            {getStatusText(friend.status)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => inviteFriend(friend.id)}
            disabled={isInvited || friend.status === 'offline'}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isInvited
                ? 'bg-purple-500/20 text-purple-400'
                : friend.status === 'offline'
                  ? 'text-gray-600 cursor-not-allowed'
                  : 'hover:bg-purple-500/10 text-gray-400 hover:text-purple-400'
            }`}
            title="Invite to Party"
          >
            {isInvited ? <Radio size={16} className="animate-pulse" /> : <Video size={16} />}
          </button>

          <button
            onClick={() => setShowRemoveConfirm(true)}
            className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all duration-200"
            title="Remove Friend"
          >
            <UserMinus size={16} />
          </button>
        </div>
      </motion.div>

      {/* Remove Confirmation Modal */}
      <AnimatePresence>
        {showRemoveConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowRemoveConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#151520] border border-white/[0.08] rounded-2xl p-6 max-w-xs w-full"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <AlertTriangle size={16} className="text-red-400" />
                </div>
                <h3 className="font-bold text-white">Remove Friend</h3>
              </div>
              <p className="text-gray-400 text-sm mb-5">
                Remove <span className="text-white font-semibold">{friend.username}</span> from your friends list?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowRemoveConfirm(false)}
                  className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] rounded-xl text-sm font-medium text-gray-300 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemove}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-xl text-sm font-bold text-white shadow-lg shadow-red-500/20 transition-all duration-200 active:scale-95"
                >
                  Remove
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
