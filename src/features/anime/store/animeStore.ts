import { create } from 'zustand';
import { Anime, Category } from '../../../types';
import api from '../../../services/api';

interface AnimeState {
  trending: Anime[];
  featured: Anime[];
  topRated: Anime[];
  ongoing: Anime[];
  newEpisodes: any[];
  categories: Category[];
  isLoading: boolean;
  fetchHomeData: () => Promise<void>;
  fetchCategories: () => Promise<void>;
}

export const useAnimeStore = create<AnimeState>((set) => ({
  trending: [],
  featured: [],
  topRated: [],
  ongoing: [],
  newEpisodes: [],
  categories: [],
  isLoading: false,

  fetchHomeData: async () => {
    set({ isLoading: true });
    try {
      const [trending, featured, topRated, newEpisodes, ongoing] = await Promise.all([
        api.get('/anime/trending'),
        api.get('/anime/featured'),
        api.get('/anime/top-rated'),
        api.get('/anime/new-episodes'),
        api.get('/anime', { params: { status: 'ongoing', limit: 5 } }),
      ]);

      set({
        trending: trending.data.data,
        featured: featured.data.data,
        topRated: topRated.data.data,
        newEpisodes: newEpisodes.data.data,
        ongoing: ongoing.data.data.anime,
      });
    } catch (error) {
       console.error('Failed to fetch home data', error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const { data } = await api.get('/categories');
      set({ categories: data.data });
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  },
}));
