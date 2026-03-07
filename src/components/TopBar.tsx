import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, X, Menu, Home, Music, Disc3, Star, ListMusic, User } from 'lucide-react';

const tabs = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'songs', label: 'Songs', icon: Music, path: '/search/songs' },
  { id: 'albums', label: 'Albums', icon: Disc3, path: '/search/albums' },
  { id: 'artists', label: 'Artists', icon: Star, path: '/search/artists' },
  { id: 'playlists', label: 'Playlists', icon: ListMusic, path: '/search/playlists' },
  { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
];

const TopBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const doSearch = () => {
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const clearSearch = () => {
    setQuery('');
    navigate('/');
  };

  const activeTab = (() => {
    const p = location.pathname;
    if (p === '/') return 'home';
    if (p === '/profile') return 'profile';
    if (p.startsWith('/search/songs')) return 'songs';
    if (p.startsWith('/search/albums')) return 'albums';
    if (p.startsWith('/search/artists')) return 'artists';
    if (p.startsWith('/search/playlists')) return 'playlists';
    return '';
  })();

  const handleTabClick = (tab: typeof tabs[0]) => {
    setMenuOpen(false);
    if (tab.id === 'home' || tab.id === 'profile') {
      navigate(tab.path);
    } else {
      const q = query.trim() || 'arijit singh hindi';
      navigate(`/search/${tab.id}?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <header className="sticky top-0 z-[100] glass border-b border-border/20 px-4 py-2.5 space-y-2">
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary font-extrabold text-lg">
          <Music className="w-5 h-5 animate-bounce" style={{ animationDuration: '2s' }} />
          <span>Elite Music</span>
        </div>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-muted-foreground hover:text-foreground p-1"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center nm-surface nm-inset rounded-full overflow-hidden">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && doSearch()}
          placeholder="Search songs, artists, albums…"
          className="flex-1 bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
        />
        {query && (
          <button onClick={clearSearch} className="px-2 text-muted-foreground hover:text-primary">
            <X className="w-4 h-4" />
          </button>
        )}
        <button onClick={doSearch} className="px-3 text-muted-foreground hover:text-primary">
          <Search className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className={`flex gap-2 overflow-x-auto pb-0.5 ${menuOpen ? 'flex-wrap' : 'hidden md:flex'}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab)}
            className={`nm-surface nm-flat rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
              activeTab === tab.id ? 'nm-inset text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="w-3 h-3" />
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
};

export default TopBar;
