import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Film, 
  Users, 
  FolderTree, 
  PlusCircle, 
  Home, 
  ChevronRight,
  Play
} from 'lucide-react';

export const AdminSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Manage Anime', path: '/admin/anime', icon: Film },
    { name: 'Manage Categories', path: '/admin/categories', icon: FolderTree },
    { name: 'Manage Users', path: '/admin/users', icon: Users },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-dark-bg border-r border-dark-border/50 py-8 px-4 flex flex-col z-50">
      <Link to="/" className="flex items-center gap-2 mb-10 px-4 group">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
          <Play className="text-white fill-white" size={20} />
        </div>
        <span className="text-xl font-black tracking-tighter uppercase italic">
          ANILE<span className="text-primary">GENDA</span>
        </span>
      </Link>

      <div className="flex-grow space-y-2">
        <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Main Menu</p>
        
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
              location.pathname === item.path
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-gray-400 hover:bg-dark-accent hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon size={20} />
              <span className="font-semibold">{item.name}</span>
            </div>
            {location.pathname !== item.path && (
              <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </Link>
        ))}
      </div>

      <div className="mt-auto">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-dark-accent hover:text-white transition-all"
        >
          <Home size={20} />
          <span className="font-semibold">Back to Site</span>
        </Link>
      </div>
    </aside>
  );
};
