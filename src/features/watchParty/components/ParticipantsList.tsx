import { motion } from 'framer-motion';
import { Crown, Mic, MicOff, XCircle, Shield } from 'lucide-react';
import { useRoomsStore } from '../store/roomsStore';
import { useWatchPartyUserStore } from '../store/userStore';
import { useState } from 'react';
import toast from 'react-hot-toast';

export const ParticipantsList = () => {
  const { currentRoom, kickParticipant } = useRoomsStore();
  const { user } = useWatchPartyUserStore();
  const [kickConfirmId, setKickConfirmId] = useState<string | null>(null);

  if (!currentRoom) return null;

  const isOwner = currentRoom.hostId === user?.id;

  const handleKick = (userId: string, username: string) => {
    kickParticipant(userId);
    toast.success(`${username} was removed from the room`);
    setKickConfirmId(null);
  };

  return (
    <div className="bg-white/[0.02] backdrop-blur-sm rounded-2xl border border-white/[0.06] flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/[0.06] bg-white/[0.03]">
        <h3 className="font-bold text-white uppercase tracking-wider text-xs flex items-center justify-between">
          Participants
          <span className="bg-white/[0.08] text-gray-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
            {currentRoom.participants.length}
          </span>
        </h3>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {currentRoom.participants.map((participant) => {
          const isMe = participant.id === user?.id;
          const showKickConfirm = kickConfirmId === participant.id;

          return (
            <motion.div
              key={participant.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="group flex items-center justify-between p-2.5 hover:bg-white/[0.04] rounded-xl transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img src={participant.avatar} alt={participant.username} className="w-9 h-9 rounded-full bg-dark-bg" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0a0a0f]" />
                </div>

                <div>
                  <h4 className="font-medium text-white text-sm flex items-center gap-1.5">
                    {participant.username}
                    {participant.role === 'owner' && (
                      <Crown size={11} className="text-yellow-500 fill-yellow-500" />
                    )}
                    {isMe && (
                      <span className="text-[9px] text-gray-500 bg-white/[0.06] px-1.5 py-0.5 rounded font-medium">you</span>
                    )}
                  </h4>
                  <p className="text-[10px] text-gray-600 capitalize">{participant.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <div className={`p-1.5 rounded-lg ${participant.isMuted ? 'text-red-400/60 bg-red-500/5' : 'text-green-400/80 bg-green-500/5'}`}>
                  {participant.isMuted ? <MicOff size={11} /> : <Mic size={11} />}
                </div>

                {/* Host kick with confirmation */}
                {isOwner && !isMe && (
                  <>
                    {showKickConfirm ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleKick(participant.id, participant.username)}
                          className="px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded-lg hover:bg-red-600 transition-all"
                        >
                          Kick
                        </button>
                        <button
                          onClick={() => setKickConfirmId(null)}
                          className="px-2 py-1 bg-white/[0.06] text-gray-400 text-[10px] font-bold rounded-lg hover:bg-white/[0.1] transition-all"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setKickConfirmId(participant.id)}
                        className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded-lg transition-all duration-200"
                        title="Kick User"
                      >
                        <XCircle size={13} />
                      </button>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
