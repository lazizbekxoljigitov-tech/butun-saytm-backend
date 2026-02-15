import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Friend {
  id: string;
  username: string;
  avatar: string;
  status: 'online' | 'offline' | 'watching' | 'in-room';
  lastSeen?: string;
  roomId?: string;
}

interface FriendsState {
  friends: Friend[];
  pendingInvites: string[];
  
  addFriend: (id: string) => Promise<boolean>;
  removeFriend: (id: string) => void;
  updateFriendStatus: (id: string, status: Friend['status'], roomId?: string) => void;
  inviteFriend: (id: string) => void;
}

// Mock database of users for demo purposes
const MOCK_USERS: Record<string, Partial<Friend>> = {
  'ANIME-ADMIN': { username: 'Admin-San', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin' },
  'ANIME-DEMO1': { username: 'Naruto Fan', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Naruto' },
  'ANIME-DEMO2': { username: 'Mikasa', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mikasa' },
};

export const useFriendsStore = create<FriendsState>()(
  persist(
    (set, get) => ({
      friends: [],
      pendingInvites: [],

      addFriend: async (id) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const state = get();
        if (state.friends.find(f => f.id === id)) {
           throw new Error('User is already your friend');
        }

        // In a real app, this would check the backend. 
        // For now, we simulate finding a user or generate a deterministic one based on ID
        let newFriend: Friend;

        if (MOCK_USERS[id]) {
           newFriend = {
             id,
             ...MOCK_USERS[id] as any,
             status: 'online',
           };
        } else if (id.startsWith('ANIME-') && id.length > 6) {
           // Deterministic generation for any valid ID
           const seed = id.split('-')[1];
           newFriend = {
             id,
             username: `User-${seed}`,
             avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`,
             status: 'offline',
             lastSeen: 'Just now',
           };
        } else {
           throw new Error('User not found. Check the ID and try again.');
        }

        set(state => ({ friends: [...state.friends, newFriend] }));
        return true;
      },

      removeFriend: (id) => {
        set(state => ({ friends: state.friends.filter(f => f.id !== id) }));
      },

      updateFriendStatus: (id, status, roomId) => {
        set(state => ({
          friends: state.friends.map(f => 
            f.id === id ? { ...f, status, roomId } : f
          )
        }));
      },

      inviteFriend: (id) => {
        set(state => ({ pendingInvites: [...state.pendingInvites, id] }));
        // In real app, emit socket event here
        setTimeout(() => {
           set(state => ({ pendingInvites: state.pendingInvites.filter(i => i !== id) }));
           // Simulate accept
        }, 3000);
      }
    }),
    {
      name: 'watch-party-friends-storage',
    }
  )
);
