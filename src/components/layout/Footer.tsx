import { Play, Github, Twitter, Instagram, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-[#050505] border-t border-dark-border/30 pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Play className="text-white fill-white" size={20} />
              </div>
              <span className="text-xl font-black tracking-tighter uppercase italic">
                ANILE<span className="text-primary">GEON</span>
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              {t('footer.description')}
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="https://twitter.com/anilegeon" 
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Anilegeon on Twitter"
                className="p-2 bg-dark-accent rounded-lg text-gray-400 hover:text-primary transition-all"
              >
                <Twitter size={18} />
              </a>
              <a 
                href="https://instagram.com/anilegeon" 
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Anilegeon on Instagram"
                className="p-2 bg-dark-accent rounded-lg text-gray-400 hover:text-primary transition-all"
              >
                <Instagram size={18} />
              </a>
              <a 
                href="https://github.com/anilegeon" 
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Check Anilegeon Github"
                className="p-2 bg-dark-accent rounded-lg text-gray-400 hover:text-primary transition-all"
              >
                <Github size={18} />
              </a>
              <a 
                href="https://youtube.com/@anilegeon" 
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Subscribe to Anilegeon Youtube"
                className="p-2 bg-dark-accent rounded-lg text-gray-400 hover:text-primary transition-all"
              >
                <Youtube size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-6">{t('footer.navigation')}</h4>
            <ul className="flex flex-col gap-4">
              <li><Link to="/" className="text-gray-400 hover:text-white transition-colors" aria-label="Go to Home">{t('common.home')}</Link></li>
              <li><Link to="/trending" className="text-gray-400 hover:text-white transition-colors" aria-label="View Trending Anime">{t('common.trending')}</Link></li>
              <li><Link to="/categories" className="text-gray-400 hover:text-white transition-colors" aria-label="Browse Anime Categories">{t('common.categories')}</Link></li>
              <li><Link to="/search" className="text-gray-400 hover:text-white transition-colors" aria-label="Search Anime Library">{t('common.search')}</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-bold mb-6">{t('footer.account')}</h4>
            <ul className="flex flex-col gap-4">
              <li><Link to="/profile" className="text-gray-400 hover:text-white transition-colors" aria-label="Go to My Profile">{t('common.profile')}</Link></li>
              <li><Link to="/saved" className="text-gray-400 hover:text-white transition-colors" aria-label="View My Watchlist">{t('common.watchlist')}</Link></li>
              <li><Link to="/history" className="text-gray-400 hover:text-white transition-colors" aria-label="View My Watch History">{t('common.history')}</Link></li>
              <li><Link to="/settings" className="text-gray-400 hover:text-white transition-colors" aria-label="Edit Account Settings">{t('common.settings')}</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-bold mb-6">{t('footer.legal')}</h4>
            <ul className="flex flex-col gap-4">
              <li><Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/dmca" className="text-gray-400 hover:text-white transition-colors">DMCA</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-dark-border/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} ANILEGEON. {t('footer.rights')}
          </p>
          <div className="flex items-center gap-6">
            <span className="text-gray-400 text-xs">{t('footer.community')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
