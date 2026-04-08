import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, X, Home, Music, Disc3, Star, ListMusic, User, Radio, Headphones, BarChart3 } from 'lucide-react';

const tabs = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'songs', label: 'Songs', icon: Music, path: '/search/songs' },
  { id: 'albums', label: 'Albums', icon: Disc3, path: '/search/albums' },
  { id: 'artists', label: 'Artists', icon: Star, path: '/search/artists' },
  { id: 'playlists', label: 'Playlists', icon: ListMusic, path: '/search/playlists' },
  
  { id: 'radio', label: 'Radio', icon: Radio, path: '/radio' },
  { id: 'podcasts', label: 'Podcasts', icon: Headphones, path: '/podcasts' },
];

const TopBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const scrollUpAccum = useRef(0);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastScrollY.current;
        if (delta > 0 && y > 80) {
          setHidden(true);
          scrollUpAccum.current = 0;
        } else if (delta < 0) {
          scrollUpAccum.current += Math.abs(delta);
          if (scrollUpAccum.current > 400) {
            setHidden(false);
          }
        }
        if (y < 80) { setHidden(false); scrollUpAccum.current = 0; }
        lastScrollY.current = y;
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
    if (p === '/charts') return 'charts';
    if (p === '/radio' || p.startsWith('/radio/')) return 'radio';
    if (p === '/podcasts' || p.startsWith('/podcast/')) return 'podcasts';
    if (p.startsWith('/search/podcasts')) return 'podcasts';
    if (p.startsWith('/search/songs')) return 'songs';
    if (p.startsWith('/search/albums')) return 'albums';
    if (p.startsWith('/search/artists')) return 'artists';
    if (p.startsWith('/search/playlists')) return 'playlists';
    return '';
  })();

  const handleTabClick = (tab: typeof tabs[0]) => {
    const searchTabs = ['songs', 'albums', 'artists', 'playlists'];
    if (searchTabs.includes(tab.id)) {
      const q = query.trim();
      if (q) navigate(`/search/${tab.id}?q=${encodeURIComponent(q)}`);
      else navigate(`/search/${tab.id}`);
    } else {
      navigate(tab.path);
    }
  };

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-[100] border-b border-border/20 px-4 transition-all duration-300 ${
        hidden ? '-translate-y-full' : 'translate-y-0'
      }`}
      style={{ background: 'hsla(250, 20%, 8%, 0.92)' }}
    >
      {/* Logo + Search + Profile in one row */}
      <div className={`transition-all duration-300 overflow-hidden ${hidden ? 'max-h-0 py-0' : 'max-h-16 py-2.5'}`}>
        <div className="flex items-center gap-2 flex-nowrap">
          <div className="flex-shrink-0 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center btn-3d">
              <Headphones className="w-4 h-4 text-primary-foreground" />
            </div>
          </div>
          <div className="flex-1 min-w-0 flex items-center rounded-lg overflow-hidden" style={{ background: 'hsla(250, 18%, 16%, 0.7)' }}>
            <Search className="w-3.5 h-3.5 text-muted-foreground ml-3 flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && doSearch()}
              placeholder="Search…"
              className="flex-1 min-w-0 bg-transparent px-2 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none"
            />
            {query && (
              <button onClick={clearSearch} className="px-2 text-muted-foreground hover:text-accent transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            onClick={() => navigate('/profile')}
            className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              location.pathname === '/profile' ? 'btn-3d-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
            style={location.pathname !== '/profile' ? { background: 'hsla(250, 18%, 16%, 0.7)' } : undefined}
          >
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs - always visible */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 pt-2 scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all duration-200 ${
              activeTab === tab.id
                ? 'btn-3d-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            style={activeTab !== tab.id ? { background: 'hsla(250, 18%, 16%, 0.5)' } : undefined}
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
