export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar_url?: string;
  bio?: string;
  gender?: string;
  country?: string;
  dob?: string;
  created_at: string;
}

export interface UserPreferences {
  user_id: string;
  genres: string[];
  language: string;
  autoplay: boolean;
  quality: string;
  mature_content: boolean;
}

export interface UserPrivacy {
  user_id: string;
  visibility: 'public' | 'friends' | 'private';
  show_status: boolean;
  allow_requests: boolean;
}

export interface UserNotifications {
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  episode_alerts: boolean;
  comment_replies: boolean;
  friend_requests: boolean;
}


export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface Episode {
  id: string;
  anime_id: string;
  title?: string;
  episode_number: number;
  video_url?: string;
  video_url_720p?: string;
  video_url_1080p?: string;
  video_url_4k?: string;
  duration: number;
  created_at: string;
  anime?: Partial<Anime>;
}

export interface Anime {
  id: string;
  title: string;
  description?: string;
  banner_url?: string;
  thumbnail_url?: string;
  rating: number;
  is_trending: boolean;
  is_featured: boolean;
  view_count: number;
  status: 'ongoing' | 'completed';
  created_at: string;
  anime_categories? : {
    category_id: string;
    categories: Category;
  }[];
  episodes?: Episode[];
}

export interface WatchHistory {
  id: string;
  user_id: string;
  anime_id: string;
  episode_id?: string;
  progress: number;
  updated_at: string;
  anime?: Anime;
  episodes?: Episode;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: string[];
  message?: string;
}

export interface PaginatedResponse<T> {
  anime?: T[];
  users?: T[];
  total: number;
  page: number;
  totalPages: number;
}
