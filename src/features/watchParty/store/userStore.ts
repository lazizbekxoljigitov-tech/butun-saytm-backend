import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WatchPartyUser {
  id: string; // ANIME-XXXXX
  username: string;
  avatar: string;
  isOnline: boolean;
  currentRoomId?: string;
}

interface UserState {
  user: WatchPartyUser | null;
  initUser: (authData?: any) => void;
  updateStatus: (isOnline: boolean) => void;
  setRoom: (roomId?: string) => void;
}

const generateUserId = () => {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `ANIME-${randomNum}`;
};

const getRandomAvatar = () => {
  const avatars = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Mark',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Saitama',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Naruto',
  ];
  return avatars[Math.floor(Math.random() * avatars.length)];
};

export const useWatchPartyUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,

      initUser: (authData) => {
        const state = get();
        if (state.user) {
          // If authData provided and different, update
          if (authData && (state.user.username !== authData.name || state.user.avatar !== authData.avatar_url)) {
             set({
              user: {
                ...state.user,
                username: authData.name || state.user.username,
                avatar: authData.avatar_url || state.user.avatar,
              }
             })
          }
          return;
        }

        // New user generation from auth or fallback
        set({
          user: {
            id: authData?.id || generateUserId(),
            username: authData?.name || `Guest-${Math.floor(Math.random() * 1000)}`,
            avatar: authData?.avatar_url || getRandomAvatar(),
            isOnline: true,
          },
        });
      },

      updateStatus: (isOnline) => {
        const { user } = get();
        if (user) set({ user: { ...user, isOnline } });
      },

      setRoom: (roomId) => {
        const { user } = get();
        if (user) set({ user: { ...user, currentRoomId: roomId } });
      },
    }),
    {
      name: 'watch-party-user-storage',
    }
  )
);
