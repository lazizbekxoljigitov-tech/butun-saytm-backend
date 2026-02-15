import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Friend } from './friendsStore';
import { WatchPartyUser } from './userStore';
import toast from 'react-hot-toast';

export interface Participant extends WatchPartyUser {
  role: 'owner' | 'viewer';
  isMuted: boolean;
  isCameraOn: boolean;
}

export interface Room {
  id: string;
  hostId: string;
  animeId?: string;
  episodeId?: string;
  isPlaying: boolean;
  currentTime: number;
  participants: Participant[];
}

interface RoomsState {
  currentRoom: Room | null;
  isRoomLoading: boolean;

  createRoom: (host: WatchPartyUser) => Promise<string>;
  joinRoom: (roomId: string, user: WatchPartyUser) => Promise<void>;
  leaveRoom: () => void;
  kickParticipant: (userId: string) => void;
  updateRoomState: (updates: Partial<Room>) => void;
  updateAnime: (animeId: string) => void;
  inviteUser: (friend: Friend) => void;
}

// Mock active rooms for demo
const MOCK_ROOMS: Record<string, Partial<Room>> = {
  'ROOM-8821': { animeId: 'naruto', isPlaying: true, currentTime: 120 },
};

const generateRoomId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'ROOM-';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const useRoomsStore = create<RoomsState>()(
  persist(
    (set, get) => ({
      currentRoom: null,
      isRoomLoading: false,

      createRoom: async (host) => {
        set({ isRoomLoading: true });
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const newRoomId = generateRoomId();
        const newRoom: Room = {
          id: newRoomId,
          hostId: host.id,
          isPlaying: false,
          currentTime: 0,
          participants: [{
            ...host,
            role: 'owner',
            isMuted: true,
            isCameraOn: false
          }]
        };

        set({ currentRoom: newRoom, isRoomLoading: false });
        return newRoomId;
      },

      joinRoom: async (roomId, user) => {
         set({ isRoomLoading: true });

         // Simulate API delay
         await new Promise(resolve => setTimeout(resolve, 1500));

         // Validation
         if (!roomId.startsWith('ROOM-')) {
            set({ isRoomLoading: false });
            throw new Error('Invalid Room ID format');
         }

         set(state => ({
            currentRoom: {
              ...(state.currentRoom || {
                 id: roomId,
                 hostId: 'unknown',
                 isPlaying: false,
                 currentTime: 0,
                 participants: []
              }),
              participants: [
                 ...(state.currentRoom?.participants || []),
                 { ...user, role: 'viewer', isMuted: true, isCameraOn: false }
              ]
            },
            isRoomLoading: false
         }));
      },

      leaveRoom: () => {
        set({ currentRoom: null });
        toast.success('Left the room');
      },

      kickParticipant: (userId) => {
        set(state => {
           if (!state.currentRoom) return {};
           return {
              currentRoom: {
                 ...state.currentRoom,
                 participants: state.currentRoom.participants.filter(p => p.id !== userId)
              }
           };
        });
        toast.success('User kicked from room');
      },

      updateRoomState: (updates) => {
         set(state => {
              if (!state.currentRoom) return {};
             return {
                currentRoom: { ...state.currentRoom, ...updates }
             };
          });
       },

       updateAnime: (animeId: string) => {
          set(state => {
             if (!state.currentRoom) return {};
             return {
                currentRoom: { ...state.currentRoom, animeId, isPlaying: false, currentTime: 0 }
             };
          });
          toast.success('Anime updated for room');
       },

      inviteUser: (friend) => {
         // Simulate sending invite
         toast.success(`Invite sent to ${friend.username}`);
      }
    }),
    {
      name: 'watch-party-rooms-storage',
      partialize: (state) => ({ currentRoom: state.currentRoom }), // Only persist current room
    }
  )
);
