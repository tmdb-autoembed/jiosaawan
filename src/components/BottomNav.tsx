import { NavLink } from '@/components/NavLink';
import { Home, ListMusic, Heart, User } from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/playlists', icon: ListMusic, label: 'Playlists' },
  { to: '/favorites', icon: Heart, label: 'Favorites' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const BottomNav = () => {
  return (
    <nav className="fixed bottom-[72px] left-0 right-0 z-40 glass border-t border-border">
      <div className="flex justify-around items-center py-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className="flex flex-col items-center gap-1 px-3 py-1 text-muted-foreground transition-colors"
            activeClassName="text-primary"
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
