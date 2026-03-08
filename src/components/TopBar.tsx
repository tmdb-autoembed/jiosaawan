import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, X, Home, Music, Disc3, Star, ListMusic, User, Mic2, Radio } from 'lucide-react';

const tabs = [
  { id: 'home', label: 'Home', icon: Home, path: '/', gradient: 'from-emerald-400 to-cyan-400' },
  { id: 'songs', label: 'Songs', icon: Music, path: '/search/songs', gradient: 'from-pink-500 to-rose-400' },
  { id: 'albums', label: 'Albums', icon: Disc3, path: '/search/albums', gradient: 'from-violet-500 to-purple-400' },
  { id: 'artists', label: 'Artists', icon: Star, path: '/search/artists', gradient: 'from-amber-400 to-orange-400' },
  { id: 'playlists', label: 'Playlists', icon: ListMusic, path: '/search/playlists', gradient: 'from-blue-500 to-cyan-400' },
  { id: 'podcasts', label: 'Podcasts', icon: Radio, path: '/podcasts', gradient: 'from-fuchsia-500 to-pink-400' },
  { id: 'profile', label: 'Profile', icon: User, path: '/profile', gradient: 'from-teal-400 to-emerald-400' },
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
      const q = query.trim() || 'trending hindi songs';
      navigate(`/search/${tab.id}?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <header className="sticky top-0 z-[100] glass border-b border-border/30 px-4 py-3 space-y-3">
      {/* Logo Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center">
            <Mic2 className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-black text-gradient tracking-tight">SoundWave</span>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center bg-secondary/60 border border-border/40 rounded-2xl overflow-hidden focus-within:border-primary/30 transition-colors">
        <Search className="w-4 h-4 text-muted-foreground ml-3.5 flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && doSearch()}
          placeholder="Search songs, artists, albums, podcasts…"
          className="flex-1 bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
        />
        {query && (
          <button onClick={clearSearch} className="px-2 text-muted-foreground hover:text-accent transition-colors">
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
            className={`rounded-xl px-3 py-1.5 text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
              activeTab === tab.id
                ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg`
                : 'bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary/80'
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
