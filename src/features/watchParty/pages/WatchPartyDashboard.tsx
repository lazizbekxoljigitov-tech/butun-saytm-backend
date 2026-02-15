import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Play, Sparkles, Zap, Tv, UserPlus, Filter } from 'lucide-react';
import { useWatchPartyUserStore } from '../store/userStore';
import { useFriendsStore } from '../store/friendsStore';
import { useRoomsStore } from '../store/roomsStore';
import { useAuthStore } from '../../auth/store/authStore';
import { UserIDCard } from '../components/UserIDCard';
import { AddFriendInput } from '../components/AddFriendInput';
import { FriendCard } from '../components/FriendCard';
import { JoinRoomInput } from '../components/JoinRoomInput';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

type FriendFilter = 'all' | 'online' | 'in-room';

const WatchPartyDashboard = () => {
  const { user: partyUser, initUser } = useWatchPartyUserStore();
  const { user: authUser } = useAuthStore();
  const { friends } = useFriendsStore();
  const { createRoom, isRoomLoading } = useRoomsStore();
  const navigate = useNavigate();
  const [friendFilter, setFriendFilter] = useState<FriendFilter>('all');
  const [createSuccess, setCreateSuccess] = useState(false);

  useEffect(() => {
    initUser(authUser);
  }, [authUser, initUser]);

  const handleCreateRoom = async () => {
    if (!partyUser || isRoomLoading) return;
    try {
      const roomId = await createRoom(partyUser);
      setCreateSuccess(true);
      toast.success('Room created!');
      setTimeout(() => navigate(`/party/${roomId}`), 600);
    } catch (error) {
      toast.error('Failed to create room. Try again.');
    }
  };

  const filteredFriends = friends.filter(f => {
    if (friendFilter === 'online') return f.status === 'online' || f.status === 'watching';
    if (friendFilter === 'in-room') return f.status === 'in-room';
    return true;
  });

  // Skeleton loader
  if (!partyUser) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="h-10 w-64 bg-white/5 rounded-2xl animate-pulse mb-8" />
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="h-56 bg-white/[0.03] rounded-3xl animate-pulse" />
            <div className="h-56 bg-white/[0.03] rounded-3xl animate-pulse" />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="h-48 bg-white/[0.03] rounded-3xl animate-pulse" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white pt-24 pb-12 overflow-x-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/8 blur-[180px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-blue-600/6 blur-[180px] rounded-full" />
        <div className="absolute top-[40%] right-[20%] w-[25%] h-[25%] bg-primary/5 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl">
              <Tv size={20} className="text-purple-400" />
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-purple-400">Watch Together</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            Watch <span className="bg-gradient-to-r from-primary via-purple-400 to-blue-400 bg-clip-text text-transparent">Party</span>
          </h1>
          <p className="text-gray-500 mt-2 max-w-lg">
            Create a room, invite friends, and watch anime together in perfect sync.
          </p>
        </motion.div>

        {/* Main Grid: User Card + Actions */}
        <div className="flex flex-col xl:flex-row gap-8 mb-16">
          {/* User Identity Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full xl:w-[380px] shrink-0"
          >
            <UserIDCard />
          </motion.div>

          {/* Action Cards */}
          <div className="flex-1 grid md:grid-cols-2 gap-6">
            {/* Create Room Card */}
            <motion.button
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              whileHover={{ scale: 1.015, y: -2 }}
              whileTap={{ scale: 0.985 }}
              onClick={handleCreateRoom}
              disabled={isRoomLoading || createSuccess}
              className="relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 text-left hover:border-purple-500/30 transition-all duration-200 group overflow-hidden disabled:pointer-events-none"
            >
              {/* Glow */}
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-purple-500/10 blur-3xl rounded-full group-hover:bg-purple-500/20 transition-all duration-500" />

              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20 group-hover:scale-110 group-hover:shadow-purple-500/40 transition-all duration-300">
                  <AnimatePresence mode="wait">
                    {isRoomLoading ? (
                      <motion.div key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : createSuccess ? (
                      <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-white">
                        <Sparkles size={28} />
                      </motion.div>
                    ) : (
                      <motion.div key="plus" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <Plus size={28} className="text-white" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Create Room</h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Start a new watch party and invite your friends instantly.
                </p>

                {/* Status text */}
                <div className="mt-4">
                  {isRoomLoading && <span className="text-xs text-purple-400 font-medium animate-pulse">Creating room…</span>}
                  {createSuccess && <span className="text-xs text-green-400 font-medium">✓ Room created! Redirecting…</span>}
                </div>
              </div>
            </motion.button>

            {/* Join Room Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 flex flex-col justify-center"
            >
              <div className="w-14 h-14 bg-white/[0.06] border border-white/[0.08] rounded-2xl flex items-center justify-center mb-6">
                <Play size={28} className="text-white ml-1" fill="currentColor" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Join Party</h2>
              <JoinRoomInput />
            </motion.div>
          </div>
        </div>

        {/* Friends Section */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Add Friend */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 h-fit"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <UserPlus size={20} className="text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Add Friends</h2>
            </div>
            <AddFriendInput />
          </motion.div>

          {/* Right: Friends List */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="lg:col-span-2 bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 min-h-[400px]"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                Your Friends
                <span className="bg-white/[0.08] text-gray-300 text-sm px-3 py-1 rounded-full font-medium">
                  {friends.length}
                </span>
              </h2>

              {/* Filter Tabs */}
              <div className="flex bg-white/[0.04] border border-white/[0.06] rounded-xl p-1 gap-1">
                {([
                  { key: 'all', label: 'All' },
                  { key: 'online', label: 'Online' },
                  { key: 'in-room', label: 'In Party' },
                ] as const).map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setFriendFilter(tab.key)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                      friendFilter === tab.key
                        ? 'bg-purple-500/20 text-purple-300 shadow-sm'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {friends.length === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-white/[0.04] border border-white/[0.06] rounded-3xl flex items-center justify-center mb-5">
                  <Users size={36} className="text-gray-600" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No friends yet</h3>
                <p className="text-gray-500 max-w-sm text-sm leading-relaxed">
                  Share your User ID with friends or paste theirs in the "Add Friends" box.
                </p>
              </div>
            ) : filteredFriends.length === 0 ? (
              /* Filtered Empty */
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Filter size={32} className="text-gray-600 mb-4" />
                <p className="text-gray-500 text-sm">No friends match this filter.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {filteredFriends.map((friend, index) => (
                  <FriendCard key={friend.id} friend={friend} index={index} />
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default WatchPartyDashboard;
