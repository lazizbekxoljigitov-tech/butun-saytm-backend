import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Share2, Users, MessageSquare, Play, X,
  AlertTriangle, Trash2, LogOut, Crown, Copy, Check
} from 'lucide-react';
import { useAuthStore } from '../../auth/store/authStore';
import { useWatchPartyUserStore } from '../store/userStore';
import { useRoomsStore } from '../store/roomsStore';
import { SyncedVideoPlayer } from '../components/SyncedVideoPlayer';
import { VideoChatGrid } from '../components/VideoChatGrid';
import { ChatPanel } from '../components/ChatPanel';
import { ParticipantsList } from '../components/ParticipantsList';
import { InviteModal } from '../components/InviteModal';
import { AnimeSelectionModal } from '../components/AnimeSelectionModal';
import { Navbar } from '../../../components/layout/Navbar';
import { socket, connectSocket, disconnectSocket, joinRoom as joinSocketRoom } from '../services/socketService';
import { peerService } from '../services/peerService';
import toast from 'react-hot-toast';

const WatchPartyRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuthStore();
  const { user, initUser } = useWatchPartyUserStore();
  const { joinRoom, currentRoom, leaveRoom, isRoomLoading } = useRoomsStore();

  const [activeTab, setActiveTab] = useState<'chat' | 'participants'>('chat');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isAnimeSelectOpen, setIsAnimeSelectOpen] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    initUser(authUser);
  }, [authUser, initUser]);

  useEffect(() => {
    if (user && roomId) {
      const initRoom = async () => {
        try {
          if (!currentRoom) await joinRoom(roomId, user);
          connectSocket();
          joinSocketRoom(roomId, user);
          peerService.initialize(user.id);
          await peerService.getLocalStream();
        } catch (error) {
          console.error(error);
          toast.error('Failed to join room');
          navigate('/party');
        }
      };
      initRoom();
    }
    return () => {
      disconnectSocket();
      peerService.destroy();
    };
  }, [roomId, user, joinRoom, navigate]);

  const handleLeave = () => {
    leaveRoom();
    disconnectSocket();
    peerService.destroy();
    navigate('/party');
  };

  const handleDeleteRoom = () => {
    if (deleteConfirm !== 'DELETE') return;
    socket.emit('room:delete', { roomId: currentRoom?.id });
    leaveRoom();
    disconnectSocket();
    peerService.destroy();
    toast.success('Room deleted');
    navigate('/party');
  };

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(currentRoom?.id || '');
    setCopied(true);
    toast.success('Room ID copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Loading state
  if (!user || isRoomLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm font-medium animate-pulse">Joining room…</p>
        </div>
      </div>
    );
  }

  const isOwner = currentRoom?.participants.find(p => p.id === user.id)?.role === 'owner';

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden flex flex-col">
      <div className="fixed top-0 w-full z-50">
        <Navbar />
      </div>

      <div className="flex-1 flex overflow-hidden pt-20">
        {/* Left: Content Area */}
        <div className="flex-1 flex flex-col min-w-0 p-4 gap-4 overflow-y-auto custom-scrollbar">

          {/* Room Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowLeaveModal(true)}
                className="p-2.5 bg-white/[0.04] hover:bg-red-500/10 border border-white/[0.06] hover:border-red-500/20 rounded-xl transition-all duration-200 text-gray-400 hover:text-red-400 group"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="hidden md:block">
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-lg tracking-tight">
                    Watch <span className="text-purple-400">Party</span>
                  </h1>
                  <span className="text-gray-600">•</span>
                  <button
                    onClick={handleCopyRoomId}
                    className="flex items-center gap-1.5 px-3 py-1 bg-white/[0.04] border border-white/[0.06] rounded-lg hover:bg-white/[0.08] transition-all duration-200 group"
                  >
                    <span className="text-gray-400 font-mono text-xs">{roomId}</span>
                    {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} className="text-gray-500 group-hover:text-gray-300" />}
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[10px] text-gray-500">{currentRoom?.participants?.length || 0} connected</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isOwner && (
                <>
                  <button
                    onClick={() => setIsAnimeSelectOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 rounded-xl transition-all duration-200 font-medium text-sm"
                  >
                    <Play size={14} fill="currentColor" />
                    <span className="hidden sm:inline">Change Anime</span>
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="p-2.5 bg-red-500/5 border border-red-500/10 text-red-400/60 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 rounded-xl transition-all duration-200"
                    title="Delete Room"
                  >
                    <Trash2 size={16} />
                  </button>
                </>
              )}
              <button
                onClick={() => setIsInviteOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 rounded-xl transition-all duration-200 font-medium text-sm"
              >
                <Share2 size={14} />
                <span className="hidden sm:inline">Invite</span>
              </button>

              {/* Mobile sidebar toggle */}
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden p-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl hover:bg-white/[0.08] transition-all duration-200"
              >
                <MessageSquare size={16} className="text-gray-400" />
              </button>
            </div>
          </div>

          {/* Player */}
          <div className="w-full shrink-0">
            <SyncedVideoPlayer animeId={currentRoom?.animeId || 'demo'} />
          </div>

          {/* Voice/Video Grid */}
          <div className="flex-1 min-h-[200px]">
            <VideoChatGrid />
          </div>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:flex w-80 xl:w-96 border-l border-white/[0.06] bg-white/[0.01] flex-col shrink-0">
          {/* Tabs */}
          <div className="flex border-b border-white/[0.06]">
            {([
              { key: 'chat' as const, label: 'Chat', icon: MessageSquare },
              { key: 'participants' as const, label: 'People', icon: Users },
            ]).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 relative ${
                  activeTab === tab.key
                    ? 'text-purple-400 bg-purple-500/5'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <tab.icon size={14} />
                  {tab.label}
                  {tab.key === 'participants' && (
                    <span className="bg-white/[0.08] px-1.5 py-0.5 rounded text-[10px]">{currentRoom?.participants?.length || 0}</span>
                  )}
                </span>
                {activeTab === tab.key && (
                  <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-hidden p-4 relative">
            <AnimatePresence mode="wait">
              {activeTab === 'chat' ? (
                <motion.div key="chat" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} transition={{ duration: 0.15 }} className="h-full">
                  <ChatPanel />
                </motion.div>
              ) : (
                <motion.div key="participants" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} transition={{ duration: 0.15 }} className="h-full">
                  <ParticipantsList />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileSidebarOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                className="fixed right-0 top-0 bottom-0 w-[85%] max-w-[400px] bg-[#0f0f18] border-l border-white/[0.06] z-50 flex flex-col lg:hidden"
              >
                <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
                  <h3 className="font-bold text-white">Chat & People</h3>
                  <button onClick={() => setMobileSidebarOpen(false)} className="p-2 hover:bg-white/[0.06] rounded-xl transition-colors">
                    <X size={18} className="text-gray-400" />
                  </button>
                </div>
                {/* Tabs in mobile */}
                <div className="flex border-b border-white/[0.06]">
                  <button onClick={() => setActiveTab('chat')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${activeTab === 'chat' ? 'text-purple-400 border-b-2 border-purple-500' : 'text-gray-500'}`}>
                    <MessageSquare size={14} className="inline mr-1" /> Chat
                  </button>
                  <button onClick={() => setActiveTab('participants')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${activeTab === 'participants' ? 'text-purple-400 border-b-2 border-purple-500' : 'text-gray-500'}`}>
                    <Users size={14} className="inline mr-1" /> People
                  </button>
                </div>
                <div className="flex-1 overflow-hidden p-4">
                  {activeTab === 'chat' ? <ChatPanel /> : <ParticipantsList />}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <InviteModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />
      <AnimeSelectionModal isOpen={isAnimeSelectOpen} onClose={() => setIsAnimeSelectOpen(false)} />

      {/* Leave Room Modal */}
      <AnimatePresence>
        {showLeaveModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowLeaveModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-[#151520] border border-white/[0.08] rounded-2xl p-6 max-w-sm w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                  <LogOut size={18} className="text-orange-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Leave Room?</h3>
              </div>
              <p className="text-gray-400 text-sm mb-6">You'll be disconnected from the watch party. You can rejoin later with the room ID.</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowLeaveModal(false)} className="px-5 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] rounded-xl text-sm font-medium text-gray-300 transition-all duration-200">
                  Cancel
                </button>
                <button onClick={() => { setShowLeaveModal(false); handleLeave(); }} className="px-5 py-2.5 bg-red-500 hover:bg-red-600 rounded-xl text-sm font-bold text-white shadow-lg shadow-red-500/20 transition-all duration-200 active:scale-95">
                  <LogOut size={14} className="inline mr-1.5" />Leave
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Room Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-[#151520] border border-red-500/20 rounded-2xl p-6 max-w-sm w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <AlertTriangle size={18} className="text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-red-400">Delete Room</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">This will permanently close the room and disconnect all participants. Type <span className="text-red-400 font-mono font-bold">DELETE</span> to confirm.</p>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="Type DELETE"
                className="w-full bg-dark-accent border border-red-500/20 rounded-xl px-4 py-2.5 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/30 font-mono text-sm mb-4"
              />
              <div className="flex justify-end gap-3">
                <button onClick={() => { setShowDeleteModal(false); setDeleteConfirm(''); }} className="px-5 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] rounded-xl text-sm font-medium text-gray-300 transition-all duration-200">
                  Cancel
                </button>
                <button onClick={handleDeleteRoom} disabled={deleteConfirm !== 'DELETE'} className="px-5 py-2.5 bg-red-500 hover:bg-red-600 rounded-xl text-sm font-bold text-white shadow-lg shadow-red-500/20 transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100">
                  <Trash2 size={14} className="inline mr-1.5" />Delete Room
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WatchPartyRoom;
