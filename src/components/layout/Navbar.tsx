import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/authStore';
import { Search, User, LogOut, Menu, X, Play, LayoutDashboard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { t } = useTranslation();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync HTML lang with i18n
  useEffect(() => {
    document.documentElement.lang = location.pathname.includes('/uz') ? 'uz' : 'en'; // example logic
  }, [location.pathname]);

  const navLinks = [
    { name: t('common.home'), path: '/' },
    { name: t('common.trending'), path: '/trending' },
    { name: t('common.random'), path: '/random' },
    { name: "Watch Party", path: '/party' },
    { name: t('common.categories'), path: '/categories' },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (!isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out ${
        isScrolled || isMobileMenuOpen 
          ? 'bg-[#0a0a0b]/80 backdrop-blur-xl border-b border-white/[0.08] py-3 shadow-2xl shadow-black/40' 
          : 'bg-[#0a0a0b]/50 backdrop-blur-md border-b border-white/[0.05] py-5'
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group" aria-label="Go to Homepage">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-primary/20">
            <Play className="text-white fill-white" size={20} />
          </div>
          <span className="text-xl md:text-2xl font-black tracking-tighter uppercase italic">
            ANILE<span className="text-primary">GEON</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              aria-label={`Go to ${link.name}`}
              className={`nav-link text-sm font-bold uppercase tracking-widest ${location.pathname === link.path ? 'nav-link-active' : ''}`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link to="/search" className="p-2 text-gray-400 hover:text-white transition-colors" aria-label="Search Anime">
            <Search size={22} />
          </Link>

          <LanguageSwitcher />

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                aria-label="User Profile Menu"
                className="flex items-center gap-2 p-1 pl-3 rounded-full bg-white/[0.03] border border-white/[0.08] hover:border-primary/50 transition-all"
              >
                <span className="text-xs font-bold uppercase tracking-wider">{user?.name}</span>
                <div className="w-8 h-8 rounded-full bg-primary overflow-hidden border border-white/10">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <User size={16} />
                    </div>
                  )}
                </div>
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-56 bg-dark-surface/95 backdrop-blur-xl border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden py-2"
                  >
                    {user?.role === 'admin' && (
                       <Link
                       to="/admin"
                       onClick={() => setIsProfileOpen(false)}
                       className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                     >
                       <LayoutDashboard size={18} />
                       <span>Admin Dashboard</span>
                     </Link>
                    )}
                    <Link
                      to="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                    >
                      <User size={18} />
                      <span>Profile Settings</span>
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsProfileOpen(false);
                      }}
                      aria-label="Logout"
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="font-bold uppercase tracking-widest text-xs">Login</Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="font-bold uppercase tracking-widest text-xs">Get Started</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button 
          className="md:hidden p-2 text-white bg-white/[0.05] rounded-xl border border-white/[0.08]" 
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 top-[65px] h-[calc(100vh-65px)] bg-dark-bg/95 backdrop-blur-2xl z-[49] overflow-y-auto"
          >
            <div className="flex flex-col h-full px-8 py-10">
              <div className="space-y-6">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                  >
                    <Link
                      to={link.path}
                      onClick={toggleMobileMenu}
                      className={`text-3xl font-black italic uppercase tracking-tighter block ${
                        location.pathname === link.path ? 'text-primary' : 'text-gray-300'
                      }`}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: 0.1 + navLinks.length * 0.05 }}
                >
                  <Link to="/search" onClick={toggleMobileMenu} className="text-3xl font-black italic uppercase tracking-tighter text-gray-300 block">Search</Link>
                </motion.div>
              </div>

              <div className="mt-auto py-10 border-t border-white/[0.08]">
                {isAuthenticated ? (
                  <div className="space-y-6">
                    <Link to="/profile" onClick={toggleMobileMenu} className="flex items-center gap-4 text-xl font-bold text-gray-300">
                      <User className="text-primary" /> Profile Settings
                    </Link>
                    {user?.role === 'admin' && (
                      <Link to="/admin" onClick={toggleMobileMenu} className="flex items-center gap-4 text-xl font-bold text-gray-300">
                        <LayoutDashboard className="text-primary" /> Admin Panel
                      </Link>
                    )}
                    <button onClick={() => { logout(); toggleMobileMenu(); }} 
                      aria-label="Logout from account"
                      className="flex items-center gap-4 text-xl font-bold text-red-500">
                      <LogOut /> Logout Account
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    <Link to="/login" onClick={toggleMobileMenu}>
                      <Button variant="outline" className="w-full py-6 text-lg rounded-2xl">Login</Button>
                    </Link>
                    <Link to="/register" onClick={toggleMobileMenu}>
                      <Button className="w-full py-6 text-lg rounded-2xl">Create Account</Button>
                    </Link>
                  </div>
                )}
                
                <div className="mt-8 flex justify-center">
                  <LanguageSwitcher />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
