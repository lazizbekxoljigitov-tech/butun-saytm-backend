import { useState, useEffect } from 'react';
import api from '../../services/api';
import { User as UserType } from '../../types';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Search, Shield, User, Trash2, Mail, Calendar, Crown, Ban } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export const AdminUsers = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/admin/users');
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleRole = async (user: UserType) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Change ${user.name}'s role to ${newRole}?`)) return;

    try {
      await api.put(`/admin/users/${user.id}/role`, { role: newRole });
      toast.success('Role updated successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2 text-white">
            {t('userManagement.title').split(' ').map((word, i, arr) => 
              i === arr.length - 1 ? <span key={i} className="text-primary">{word}</span> : <span key={i}>{word} </span>
            )}
          </h1>
          <p className="text-gray-400 font-medium">{t('userManagement.subtitle')}</p>
        </div>
        
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <Input 
            placeholder={t('userManagement.search_placeholder')} 
            className="pl-10 bg-dark-light/50 border-dark-border/50 text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-6 bg-dark-light/50">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">{t('userManagement.total_users')}</p>
          <h3 className="text-3xl font-black italic text-white">{users.length}</h3>
        </Card>
        <Card className="p-6 bg-dark-light/50">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">{t('userManagement.admins')}</p>
          <h3 className="text-3xl font-black italic text-primary">{users.filter(u => u.role === 'admin').length}</h3>
        </Card>
        <Card className="p-6 bg-dark-light/50">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">{t('userManagement.regular_users')}</p>
          <h3 className="text-3xl font-black italic text-white">{users.filter(u => u.role === 'user').length}</h3>
        </Card>
        <Card className="p-6 bg-dark-light/50">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">{t('userManagement.search_results')}</p>
          <h3 className="text-3xl font-black italic text-white">{filteredUsers.length}</h3>
        </Card>
      </div>

      {/* Users Grid */}
      <div>
        <h3 className="text-xl font-black italic uppercase tracking-tighter mb-6 text-white flex items-center gap-3">
          <span className="w-8 h-1 bg-primary rounded-full"></span>
          {t('userManagement.all_users')}
        </h3>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-56 bg-dark-light/30 rounded-2xl animate-pulse border border-dark-border/50" />
            ))}
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-6 group hover:border-primary/50 transition-all flex flex-col justify-between h-full bg-dark-light/50">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-dark-accent/50 border border-dark-border/50 overflow-hidden flex-shrink-0">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} className="w-full h-full object-cover" alt={user.name} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                          <User size={32} />
                        </div>
                      )}
                    </div>
                    
                    <div className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-tighter flex items-center gap-1.5 ${
                      user.role === 'admin' 
                        ? 'bg-primary/20 text-primary border border-primary/30' 
                        : 'bg-gray-800/50 text-gray-400 border border-gray-700/50'
                    }`}>
                      {user.role === 'admin' ? <Crown size={12} className="fill-primary" /> : <Shield size={12} />}
                      {user.role}
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="mb-6 flex-grow">
                    <h3 className="text-xl font-bold truncate mb-2 text-white group-hover:text-primary transition-colors">
                      {user.name}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                      <Mail size={14} />
                      <span className="truncate">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 text-xs">
                      <Calendar size={12} />
                      <span className="uppercase tracking-widest font-bold">
                        {t('userManagement.joined')} {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-dark-border/30 flex gap-2">
                    <Button 
                      onClick={() => handleToggleRole(user)}
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs font-bold uppercase tracking-widest"
                    >
                      {user.role === 'admin' ? t('userManagement.demote') : t('userManagement.promote')}
                    </Button>
                    <Button 
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:bg-red-500/10"
                    >
                      <Ban size={16} />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-dark-light/20 rounded-2xl border border-dark-border/30">
            <Search size={48} className="mx-auto text-gray-700 mb-4" />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">{t('userManagement.no_users')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

