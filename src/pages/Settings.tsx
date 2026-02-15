import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../features/auth/store/authStore';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { UserPreferences, UserPrivacy, UserNotifications } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Shield, Film, History, Eye, Bell, AlertTriangle,
  Camera, Save, X, Download, Trash2, Lock, Globe, ArrowLeft,
  ChevronRight, Check
} from 'lucide-react';

type SettingsTab = 'account' | 'security' | 'preferences' | 'history' | 'privacy' | 'notifications' | 'danger';

const TABS: { id: SettingsTab; label: string; icon: any; color?: string }[] = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'preferences', label: 'Anime Preferences', icon: Film },
  { id: 'history', label: 'Watch History', icon: History },
  { id: 'privacy', label: 'Privacy', icon: Eye },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'danger', label: 'Danger Zone', icon: AlertTriangle, color: 'text-red-400' },
];

const GENRES = ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mecha', 'Music', 'Mystery', 'Psychological', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller'];
const COUNTRIES = ['Japan', 'South Korea', 'Uzbekistan', 'USA', 'China', 'Germany', 'France', 'Russia', 'Turkey', 'India', 'Other'];

// ── Toggle Component ──
const Toggle = ({ enabled, onChange, label }: { enabled: boolean; onChange: (v: boolean) => void; label: string }) => (
  <div className="flex items-center justify-between py-3">
    <span className="text-sm text-gray-300">{label}</span>
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-12 h-6 rounded-full transition-all duration-300 ${enabled ? 'bg-purple-500 shadow-lg shadow-purple-500/30' : 'bg-dark-accent'}`}
    >
      <motion.div
        animate={{ x: enabled ? 24 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
      />
    </button>
  </div>
);

// ── Section Card ──
const SectionCard = ({ title, children, icon: Icon, danger }: { title: string; children: React.ReactNode; icon?: any; danger?: boolean }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`rounded-2xl border backdrop-blur-md p-6 mb-6 ${danger ? 'bg-red-500/5 border-red-500/20' : 'bg-white/[0.02] border-white/[0.06]'}`}
  >
    <div className="flex items-center gap-3 mb-6">
      {Icon && <Icon size={20} className={danger ? 'text-red-400' : 'text-purple-400'} />}
      <h3 className={`font-bold text-lg ${danger ? 'text-red-400' : 'text-white'}`}>{title}</h3>
    </div>
    {children}
  </motion.div>
);

export const Settings = () => {
  const { user, updateUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // ── Account State ──
  const [profile, setProfile] = useState({ name: '', bio: '', gender: '', country: '', dob: '' });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // ── Security State ──
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });

  // ── Preferences State ──
  const [preferences, setPreferences] = useState<UserPreferences>({
    user_id: '', genres: [], language: 'sub', autoplay: true, quality: '720p', mature_content: false
  });

  // ── Privacy State ──
  const [privacy, setPrivacy] = useState<UserPrivacy>({
    user_id: '', visibility: 'public', show_status: true, allow_requests: true
  });

  // ── Notifications State ──
  const [notifications, setNotifications] = useState<UserNotifications>({
    user_id: '', email_notifications: true, push_notifications: true, episode_alerts: true, comment_replies: true, friend_requests: true
  });

  // ── Danger Zone ──
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ── Loading & Saving ──
  const [saving, setSaving] = useState(false);

  // ── Initialize ──
  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        bio: user.bio || '',
        gender: user.gender || '',
        country: user.country || '',
        dob: user.dob || '',
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [prefsRes, privRes, notifsRes] = await Promise.all([
          api.get('/settings/preferences'),
          api.get('/settings/privacy'),
          api.get('/settings/notifications'),
        ]);
        if (prefsRes.data.success) setPreferences(prefsRes.data.data);
        if (privRes.data.success) setPrivacy(privRes.data.data);
        if (notifsRes.data.success) setNotifications(notifsRes.data.data);
      } catch (err) { /* defaults in state */ }
    };
    fetchSettings();
  }, []);

  // ── Save Handlers ──
  const saveProfile = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/settings/profile', profile);
      if (data.success) {
        updateUser(data.data);
        toast.success('Profile updated!');
      }
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const { data } = await api.put('/auth/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (data.success) { updateUser(data.data); toast.success('Avatar updated!'); }
    } catch { toast.error('Avatar upload failed'); }
  };

  const changePassword = async () => {
    if (passwords.new !== passwords.confirm) { toast.error('Passwords do not match'); return; }
    if (passwords.new.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setSaving(true);
    try {
      await api.put('/auth/change-password', { oldPassword: passwords.old, newPassword: passwords.new });
      toast.success('Password changed!');
      setPasswords({ old: '', new: '', confirm: '' });
    } catch { toast.error('Failed to change password'); }
    finally { setSaving(false); }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/settings/preferences', preferences);
      if (data.success) toast.success('Preferences saved!');
    } catch { toast.error('Failed to save preferences'); }
    finally { setSaving(false); }
  };

  const savePrivacy = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/settings/privacy', privacy);
      if (data.success) toast.success('Privacy settings saved!');
    } catch { toast.error('Failed to save privacy settings'); }
    finally { setSaving(false); }
  };

  const saveNotifications = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/settings/notifications', notifications);
      if (data.success) toast.success('Notification settings saved!');
    } catch { toast.error('Failed to save notification settings'); }
    finally { setSaving(false); }
  };

  const clearHistory = async () => {
    try {
      await api.delete('/settings/watch-history');
      toast.success('Watch history cleared!');
    } catch { toast.error('Failed to clear history'); }
  };

  const downloadHistory = async () => {
    try {
      const res = await api.get('/settings/watch-history/export', { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([JSON.stringify(res.data, null, 2)]));
      const a = document.createElement('a');
      a.href = url; a.download = 'watch_history.json'; a.click();
      toast.success('History downloaded!');
    } catch { toast.error('Download failed'); }
  };

  const deleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') { toast.error('Type DELETE to confirm'); return; }
    try {
      await api.post('/settings/delete-account', { confirmation: 'DELETE' });
      toast.success('Account scheduled for deletion');
      logout();
      navigate('/login');
    } catch { toast.error('Failed to delete account'); }
  };

  const downloadAccountData = async () => {
    try {
      const res = await api.get('/settings/export-data');
      const url = URL.createObjectURL(new Blob([JSON.stringify(res.data, null, 2)]));
      const a = document.createElement('a');
      a.href = url; a.download = 'account_data.json'; a.click();
      toast.success('Account data downloaded!');
    } catch { toast.error('Download failed'); }
  };

  // ── Completion calculation ──
  const completion = (() => {
    let total = 0;
    if (user?.name) total += 20;
    if (user?.avatar_url) total += 20;
    if (user?.bio) total += 20;
    if (user?.country) total += 20;
    if (user?.dob) total += 20;
    return total;
  })();

  // ── Render Tabs ──
  const renderContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <div className="space-y-6">
            {/* Profile Completion */}
            <SectionCard title="Profile Completion" icon={User}>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Completion</span>
                  <span className="text-purple-400 font-bold">{completion}%</span>
                </div>
                <div className="w-full h-2 bg-dark-accent rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completion}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                  />
                </div>
              </div>
            </SectionCard>

            {/* Avatar */}
            <SectionCard title="Profile Picture" icon={Camera}>
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-2xl bg-dark-accent overflow-hidden border-2 border-purple-500/20">
                    {(avatarPreview || user?.avatar_url) ? (
                      <img src={avatarPreview || user?.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600"><User size={40} /></div>
                    )}
                  </div>
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl cursor-pointer"
                  >
                    <Camera className="text-white" size={20} />
                  </button>
                  <input ref={avatarInputRef} type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                </div>
                <div>
                  <p className="text-white font-semibold">{user?.name}</p>
                  <p className="text-gray-500 text-sm">{user?.email}</p>
                  <button onClick={() => avatarInputRef.current?.click()} className="mt-2 text-xs text-purple-400 hover:text-purple-300 transition">Change Avatar</button>
                </div>
              </div>
            </SectionCard>

            {/* Account Info */}
            <SectionCard title="Account Information" icon={User}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Display Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                <div className="w-full space-y-1.5">
                  <label className="text-sm font-medium text-gray-400 ml-1">Gender</label>
                  <select
                    value={profile.gender}
                    onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                    className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <Input label="Date of Birth" type="date" value={profile.dob} onChange={(e) => setProfile({ ...profile, dob: e.target.value })} />
                <div className="w-full space-y-1.5">
                  <label className="text-sm font-medium text-gray-400 ml-1">Country</label>
                  <select
                    value={profile.country}
                    onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                    className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  >
                    <option value="">Select Country</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-400 ml-1">Bio</label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => { if (e.target.value.length <= 250) setProfile({ ...profile, bio: e.target.value }); }}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  className="w-full mt-1.5 bg-dark-accent border border-dark-border rounded-lg px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none transition-all"
                />
                <p className="text-right text-xs text-gray-500 mt-1">{profile.bio.length}/250</p>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="ghost" onClick={() => { if (user) setProfile({ name: user.name, bio: user.bio || '', gender: user.gender || '', country: user.country || '', dob: user.dob || '' }); }}>
                  <X size={16} /> Cancel
                </Button>
                <Button onClick={saveProfile} isLoading={saving} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-500/20">
                  <Save size={16} /> Save Changes
                </Button>
              </div>
            </SectionCard>
          </div>
        );

      case 'security':
        return (
          <SectionCard title="Change Password" icon={Lock}>
            <div className="space-y-4 max-w-md">
              <Input label="Current Password" type="password" value={passwords.old} onChange={(e) => setPasswords({ ...passwords, old: e.target.value })} />
              <Input label="New Password" type="password" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} />
              <Input label="Confirm New Password" type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                error={passwords.confirm && passwords.new !== passwords.confirm ? 'Passwords do not match' : undefined}
              />
              <Button onClick={changePassword} isLoading={saving} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 mt-4">
                <Lock size={16} /> Update Password
              </Button>
            </div>
          </SectionCard>
        );

      case 'preferences':
        return (
          <div className="space-y-6">
            <SectionCard title="Favorite Genres" icon={Film}>
              <div className="flex flex-wrap gap-2">
                {GENRES.map(genre => {
                  const selected = preferences.genres.includes(genre);
                  return (
                    <button
                      key={genre}
                      onClick={() => {
                        setPreferences(p => ({
                          ...p,
                          genres: selected ? p.genres.filter(g => g !== genre) : [...p.genres, genre]
                        }));
                      }}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                        selected
                          ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-lg shadow-purple-500/10'
                          : 'bg-dark-accent border-dark-border text-gray-400 hover:border-purple-500/30'
                      }`}
                    >
                      {selected && <Check size={12} className="inline mr-1" />}
                      {genre}
                    </button>
                  );
                })}
              </div>
            </SectionCard>

            <SectionCard title="Playback Settings" icon={Film}>
              <div className="space-y-4 max-w-md">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-400">Preferred Language</label>
                  <div className="flex gap-3">
                    {['sub', 'dub'].map(lang => (
                      <button
                        key={lang}
                        onClick={() => setPreferences(p => ({ ...p, language: lang }))}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all border ${
                          preferences.language === lang
                            ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                            : 'bg-dark-accent border-dark-border text-gray-400'
                        }`}
                      >
                        {lang === 'sub' ? '🇯🇵 Subbed' : '🇬🇧 Dubbed'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-400">Default Quality</label>
                  <div className="flex gap-2">
                    {['480p', '720p', '1080p'].map(q => (
                      <button
                        key={q}
                        onClick={() => setPreferences(p => ({ ...p, quality: q }))}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all border ${
                          preferences.quality === q
                            ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                            : 'bg-dark-accent border-dark-border text-gray-400'
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                <Toggle label="Autoplay Next Episode" enabled={preferences.autoplay} onChange={(v) => setPreferences(p => ({ ...p, autoplay: v }))} />
                <Toggle label="Show Mature Content" enabled={preferences.mature_content} onChange={(v) => setPreferences(p => ({ ...p, mature_content: v }))} />
              </div>

              <div className="flex justify-end mt-6">
                <Button onClick={savePreferences} isLoading={saving} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500">
                  <Save size={16} /> Save Preferences
                </Button>
              </div>
            </SectionCard>
          </div>
        );

      case 'history':
        return (
          <SectionCard title="Watch History" icon={History}>
            <div className="space-y-6">
              <p className="text-gray-400 text-sm">Manage your watch history data. Clearing history cannot be undone.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="secondary" onClick={downloadHistory} className="border border-dark-border">
                  <Download size={16} /> Download History (JSON)
                </Button>
                <Button variant="danger" onClick={clearHistory}>
                  <Trash2 size={16} /> Clear All History
                </Button>
              </div>
            </div>
          </SectionCard>
        );

      case 'privacy':
        return (
          <SectionCard title="Privacy Settings" icon={Eye}>
            <div className="space-y-6 max-w-md">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-400">Profile Visibility</label>
                <div className="flex gap-2">
                  {(['public', 'friends', 'private'] as const).map(vis => (
                    <button
                      key={vis}
                      onClick={() => setPrivacy(p => ({ ...p, visibility: vis }))}
                      className={`flex-1 py-3 rounded-xl text-sm font-bold capitalize transition-all border ${
                        privacy.visibility === vis
                          ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                          : 'bg-dark-accent border-dark-border text-gray-400'
                      }`}
                    >
                      {vis === 'public' && <Globe size={14} className="inline mr-1" />}
                      {vis === 'private' && <Lock size={14} className="inline mr-1" />}
                      {vis}
                    </button>
                  ))}
                </div>
              </div>

              <Toggle label="Show Online Status" enabled={privacy.show_status} onChange={(v) => setPrivacy(p => ({ ...p, show_status: v }))} />
              <Toggle label="Allow Friend Requests" enabled={privacy.allow_requests} onChange={(v) => setPrivacy(p => ({ ...p, allow_requests: v }))} />

              <div className="flex justify-end mt-4">
                <Button onClick={savePrivacy} isLoading={saving} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500">
                  <Save size={16} /> Save Privacy Settings
                </Button>
              </div>
            </div>
          </SectionCard>
        );

      case 'notifications':
        return (
          <SectionCard title="Notification Preferences" icon={Bell}>
            <div className="space-y-1 max-w-md">
              <Toggle label="Email Notifications" enabled={notifications.email_notifications} onChange={(v) => setNotifications(n => ({ ...n, email_notifications: v }))} />
              <Toggle label="Push Notifications" enabled={notifications.push_notifications} onChange={(v) => setNotifications(n => ({ ...n, push_notifications: v }))} />
              <div className="border-t border-dark-border my-4" />
              <Toggle label="New Episode Alerts" enabled={notifications.episode_alerts} onChange={(v) => setNotifications(n => ({ ...n, episode_alerts: v }))} />
              <Toggle label="Comment Replies" enabled={notifications.comment_replies} onChange={(v) => setNotifications(n => ({ ...n, comment_replies: v }))} />
              <Toggle label="Friend Requests" enabled={notifications.friend_requests} onChange={(v) => setNotifications(n => ({ ...n, friend_requests: v }))} />
            </div>
            <div className="flex justify-end mt-6">
              <Button onClick={saveNotifications} isLoading={saving} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500">
                <Save size={16} /> Save Notifications
              </Button>
            </div>
          </SectionCard>
        );

      case 'danger':
        return (
          <div className="space-y-6">
            <SectionCard title="Export Your Data" icon={Download}>
              <p className="text-gray-400 text-sm mb-4">Download all your account data including profile, preferences, watch history, and saved anime.</p>
              <Button variant="secondary" onClick={downloadAccountData} className="border border-dark-border">
                <Download size={16} /> Download Account Data
              </Button>
            </SectionCard>

            <SectionCard title="Delete Account" icon={AlertTriangle} danger>
              <p className="text-gray-400 text-sm mb-4">
                Once you delete your account, you have <span className="text-red-400 font-bold">30 days</span> to recover it. After that, all data is permanently erased.
              </p>
              <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
                <Trash2 size={16} /> Delete My Account
              </Button>
            </SectionCard>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-10 md:mb-12">
        <button onClick={() => navigate('/profile')} className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
          <ArrowLeft size={20} className="text-gray-400" />
        </button>
        <div>
          <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-white">Settings</h1>
          <p className="text-gray-500 text-xs md:text-sm font-bold uppercase tracking-widest">Manage your account and preferences</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 md:gap-12">
        {/* Sidebar / Mobile Tabs */}
        <aside className="w-full lg:w-72 flex-shrink-0">
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 scrollbar-hide lg:sticky lg:top-24">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-5 py-3.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                    activeTab === tab.id
                      ? tab.color
                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                        : 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                      : 'text-gray-500 bg-white/5 border-white/5 hover:bg-white/10 hover:text-gray-300'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                  {activeTab === tab.id && <ChevronRight size={16} className="ml-auto hidden lg:block opacity-50" />}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-dark-light/10 md:bg-transparent rounded-3xl p-1 md:p-0">
                {renderContent()}
              </div>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-light border border-red-500/20 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="text-red-400" size={20} />
                </div>
                <h3 className="text-lg font-bold text-red-400">Delete Account</h3>
              </div>
              <p className="text-gray-400 text-sm mb-6">
                This action is irreversible after 30 days. Type <span className="text-red-400 font-mono font-bold">DELETE</span> to confirm.
              </p>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="Type DELETE here"
                className="w-full bg-dark-accent border border-red-500/20 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 font-mono mb-4"
              />
              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={() => { setShowDeleteModal(false); setDeleteConfirm(''); }}>Cancel</Button>
                <Button variant="danger" onClick={() => { deleteAccount(); setShowDeleteModal(false); }} disabled={deleteConfirm !== 'DELETE'}>
                  <Trash2 size={16} /> Delete Forever
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
