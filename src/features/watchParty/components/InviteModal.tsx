import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, UserPlus, Check, Copy, Link } from 'lucide-react';
import { useFriendsStore } from '../store/friendsStore';
import { useRoomsStore } from '../store/roomsStore';
import toast from 'react-hot-toast';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InviteModal = ({ isOpen, onClose }: InviteModalProps) => {
  const { friends } = useFriendsStore();
  const { inviteUser, currentRoom } = useRoomsStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [invitedIds, setInvitedIds] = useState<string[]>([]);
  const [linkCopied, setLinkCopied] = useState(false);

  const filteredFriends = friends.filter(f =>
    f.username.toLowerCase().includes(searchTerm.toLowerCase()) &&
    f.status !== 'offline'
  );

  const handleInvite = (friend: typeof friends[0]) => {
    inviteUser(friend);
    setInvitedIds(prev => [...prev, friend.id]);
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/party/${currentRoom?.id || ''}`;
    navigator.clipboard.writeText(link);
    setLinkCopied(true);
    toast.success('Invite link copied!');
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
            className="relative w-full max-w-lg bg-[#131320] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.02]">
              <h2 className="text-lg font-bold text-white">Invite Friends</h2>
              <button onClick={onClose} className="p-2 hover:bg-white/[0.06] rounded-xl text-gray-500 hover:text-white transition-all duration-200">
                <X size={18} />
              </button>
            </div>

            {/* Copy Link */}
            <div className="px-5 pt-4">
              <button
                onClick={handleCopyLink}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
                  linkCopied
                    ? 'bg-green-500/10 border-green-500/20 text-green-400'
                    : 'bg-white/[0.04] border-white/[0.06] text-gray-300 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                {linkCopied ? <Check size={16} /> : <Link size={16} />}
                {linkCopied ? 'Copied!' : 'Copy Invite Link'}
              </button>
            </div>

            {/* Search */}
            <div className="p-5 border-b border-white/[0.06]">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                <input
                  type="text"
                  placeholder="Search online friends…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/[0.04] text-white rounded-xl pl-10 pr-4 py-2.5 border border-white/[0.06] focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/30 text-sm transition-all"
                />
              </div>
            </div>

            {/* List */}
            <div className="max-h-[350px] overflow-y-auto p-2 custom-scrollbar">
              {filteredFriends.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-14 h-14 bg-white/[0.04] rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <UserPlus size={24} className="text-gray-600" />
                  </div>
                  <p className="text-gray-500 text-sm">
                    {searchTerm ? 'No friends found' : 'No online friends to invite'}
                  </p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {filteredFriends.map(friend => {
                    const isInvited = invitedIds.includes(friend.id);
                    return (
                      <div key={friend.id} className="flex items-center justify-between p-3 hover:bg-white/[0.04] rounded-xl transition-all duration-200">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img src={friend.avatar} alt={friend.username} className="w-9 h-9 rounded-full bg-dark-bg" />
                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#131320]" />
                          </div>
                          <div>
                            <h4 className="font-medium text-white text-sm">{friend.username}</h4>
                            <p className="text-[10px] text-green-400">Online</p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleInvite(friend)}
                          disabled={isInvited}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                            isInvited
                              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                              : 'bg-purple-500 hover:bg-purple-400 text-white shadow-lg shadow-purple-500/20 active:scale-95'
                          }`}
                        >
                          {isInvited ? (
                            <><Check size={12} /> Sent</>
                          ) : (
                            <><UserPlus size={12} /> Invite</>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
