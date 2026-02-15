import { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card } from '../../components/ui/Card';
import { 
  Users, 
  Film, 
  Play, 
  Eye, 
  TrendingUp, 
  Clock, 
  PlusCircle, 
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAnime: 0,
    totalViews: 0,
    totalEpisodes: 0
  });
  const [latestAnime, setLatestAnime] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, animeRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/anime?limit=5')
        ]);
        setStats(statsRes.data.data);
        setLatestAnime(animeRes.data.data.anime);
      } catch (error) {
        console.error('Failed to fetch stats');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Total Anime', value: stats.totalAnime, icon: Film, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Total Episodes', value: stats.totalEpisodes, icon: Play, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Total Views', value: stats.totalViews, icon: Eye, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="space-y-12">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2">
            Admin <span className="text-primary">Dashboard</span>
          </h1>
          <p className="text-gray-500 font-medium">Overview of your streaming platform's performance.</p>
        </div>
        <Link to="/admin/anime?action=add">
          <button className="btn-primary py-3 rounded-xl shadow-xl shadow-primary/20">
            <PlusCircle size={20} />
            Add New Anime
          </button>
        </Link>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="p-6 border-dark-border/50">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-black italic tracking-tighter">
                    {isLoading ? '...' : stat.value.toLocaleString()}
                  </h3>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Latest Activity */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
              <span className="w-8 h-1 bg-primary rounded-full" />
              Recent Additions
            </h3>
            <Link to="/admin/anime" className="text-sm font-bold text-gray-500 hover:text-primary transition-colors flex items-center gap-1 group">
              View All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              [1,2,3].map(i => <div key={i} className="h-24 bg-dark-accent rounded-2xl animate-pulse" />)
            ) : latestAnime.map(anime => (
              <div key={anime.id} className="group flex items-center gap-6 p-4 bg-dark-light/40 border border-dark-border/50 rounded-2xl hover:border-primary/30 transition-all">
                <img src={anime.thumbnail_url} className="w-16 h-20 object-cover rounded-xl shadow-lg" />
                <div className="flex-grow">
                  <h4 className="font-bold text-lg group-hover:text-primary transition-colors">{anime.title}</h4>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{anime.status}</span>
                    <span className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-1">
                       <Clock size={12} />
                       {new Date(anime.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                   <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Views</p>
                   <p className="font-black italic text-xl">{anime.view_count.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-1">
           <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-3">
              <span className="w-8 h-1 bg-primary rounded-full" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 gap-4">
               <Link to="/admin/categories" className="p-6 bg-dark-accent border border-dark-border/50 rounded-2xl hover:bg-dark-border transition-all flex items-center gap-4 group">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-all">
                    <TrendingUp className="text-primary" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold">Manage Categories</h4>
                    <p className="text-xs text-gray-500">Add or edit genres</p>
                  </div>
               </Link>
               <Link to="/admin/users" className="p-6 bg-dark-accent border border-dark-border/50 rounded-2xl hover:bg-dark-border transition-all flex items-center gap-4 group">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-all">
                    <Users className="text-primary" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold">Manage Users</h4>
                    <p className="text-xs text-gray-500">Handle user accounts</p>
                  </div>
               </Link>
               <div className="p-8 bg-gradient-to-br from-primary to-primary-hover rounded-3xl relative overflow-hidden group cursor-pointer shadow-xl shadow-primary/20">
                  <div className="relative z-10">
                    <h4 className="text-xl font-bold mb-2">View Analytics</h4>
                    <p className="text-sm text-white/70 mb-6">Detailed insights into your platform's growth and engagement.</p>
                    <button className="bg-black/20 hover:bg-black/40 px-6 py-2 rounded-xl text-sm font-bold transition-all">Launch Insights</button>
                  </div>
                  <TrendingUp className="absolute bottom-[-20px] right-[-20px] text-white/10 w-40 h-40 group-hover:scale-110 transition-transform" />
               </div>
            </div>
        </div>
      </div>
    </div>
  );
};
