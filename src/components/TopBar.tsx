import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, X, Home, Music, Disc3, Star, ListMusic, User, Radio, Headphones } from 'lucide-react';

const tabs = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'songs', label: 'Songs', icon: Music, path: '/search/songs' },
  { id: 'albums', label: 'Albums', icon: Disc3, path: '/search/albums' },
  { id: 'artists', label: 'Artists', icon: Star, path: '/search/artists' },
  { id: 'playlists', label: 'Playlists', icon: ListMusic, path: '/search/playlists' },
  { id: 'podcasts', label: 'Podcasts', icon: Radio, path: '/search/podcasts' },
  { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
];

const TopBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');

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
    if (p.startsWith('/podcasts')) return 'podcasts';
    if (p.startsWith('/search/songs')) return 'songs';
    if (p.startsWith('/search/albums')) return 'albums';
    if (p.startsWith('/search/artists')) return 'artists';
    if (p.startsWith('/search/playlists')) return 'playlists';
    return '';
  })();

  const handleTabClick = (tab: typeof tabs[0]) => {
    if (tab.id === 'home' || tab.id === 'profile' || tab.id === 'podcasts') {
      navigate(tab.path);
    } else {
      const q = query.trim();
      if (q) {
        navigate(`/search/${tab.id}?q=${encodeURIComponent(q)}`);
      } else {
        navigate(`/search/${tab.id}`);
      }
    }
  };

  return (
    <header className="sticky top-0 z-[100] glass border-b border-border/20 px-4 py-3 space-y-3">
      {/* Logo */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center btn-3d">
            <Headphones className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <span className="text-lg font-bold text-gradient" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>BeatFlow</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center btn-3d-glass rounded-2xl overflow-hidden focus-within:border-primary/40 focus-within:shadow-[0_0_0_2px_hsla(25,100%,60%,0.15)]">
        <Search className="w-4 h-4 text-muted-foreground ml-3.5 flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && doSearch()}
          placeholder="Search songs, artists, albums…"
          className="flex-1 bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none"
        />
        {query && (
          <button onClick={clearSearch} className="px-2.5 text-muted-foreground hover:text-accent transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab)}
            className={`rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all duration-200 ${
              activeTab === tab.id
                ? 'btn-3d-primary text-primary-foreground'
                : 'btn-3d-glass text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
};

export default TopBar;
