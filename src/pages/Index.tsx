import { useEffect, useState } from 'react';
import { getHomeFeed, getImg, decodeHtml } from '@/lib/api';
import SongItem from '@/components/SongItem';
import MusicCard from '@/components/MusicCard';
import { Flame, Disc3, ListMusic, Star, Radio, Sparkles, Music, BarChart3, Headphones, MapPin, ChevronRight, TrendingUp, Zap, Globe, Podcast } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePlayer } from '@/contexts/PlayerContext';

const Index = () => {
  const navigate = useNavigate();
  const { loadAndPlay } = usePlayer();
  const [loading, setLoading] = useState(true);
  const [homeData, setHomeData] = useState<any>(null);

  useEffect(() => {
    setLoading(true);
    getHomeFeed().then(res => {
      if (res?.data) setHomeData(res.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center animate-pulse">
          <Music className="w-8 h-8 text-primary-foreground" />
        </div>
        <p className="text-sm text-muted-foreground animate-pulse font-medium">Discovering music…</p>
      </div>
    );
  }

  if (!homeData) return <p className="text-center text-muted-foreground py-10">Failed to load</p>;

  // Extract ALL modules from home data
  const trending = homeData.trending || homeData.new_trending || {};
  const trendingSongs = trending.songs || [];
  const trendingAlbums = trending.albums || [];
  const charts = homeData.charts || [];
  const newAlbums = homeData.new_albums || homeData.albums || [];
  const topPlaylists = homeData.top_playlists || homeData.playlists || [];
  const radio = homeData.radio || [];
  const artistRecos = homeData.artist_recos || [];
  const cityMod = homeData.city_mod || [];
  const topShows = homeData.top_shows || [];
  const tagMixes = homeData.tag_mixes || [];
  const brandNew = homeData.brand_new || [];
  const topArtists = homeData.top_artists || [];
  const modules = homeData.modules || {};

  // Promos (various sections)
  const promos = homeData.promos || {};
  const promoKeys = Object.keys(promos);
  
  // Build promo sections dynamically with proper names
  const promoSections = promoKeys.map(key => {
    const items = getItems(promos[key]);
    if (!items.length) return null;
    // Try to get title from module info or first item
    let title = '';
    if (modules[key]?.title) {
      title = decodeHtml(modules[key].title);
    } else {
      // Try to build a nice title from the key
      const cleanKey = key.replace(/promo:vx:data:/g, '').replace(/_/g, ' ').replace(/\d+/g, '').trim();
      title = cleanKey ? cleanKey.charAt(0).toUpperCase() + cleanKey.slice(1) : 'Playlists';
    }
    return { key, title, items, renderType: 'playlists' as const };
  }).filter(Boolean);

  function getItems(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (data?.results) return data.results;
    if (data?.data) return Array.isArray(data.data) ? data.data : data.data?.results || [];
    return [];
  }

  const iconMap: Record<string, any> = {
    songs: Flame, charts: BarChart3, newAlbums: Disc3, playlists: ListMusic,
    trendingAlbums: TrendingUp, radio: Radio, artistRecos: Star,
    cityMod: MapPin, topShows: Headphones, tagMixes: Zap, brandNew: Sparkles,
    topArtists: Globe,
  };

  const gradientMap: Record<string, string> = {
    songs: 'from-orange-500 to-rose-500',
    charts: 'from-emerald-500 to-teal-500',
    newAlbums: 'from-violet-500 to-indigo-500',
    playlists: 'from-sky-500 to-blue-600',
    trendingAlbums: 'from-pink-500 to-rose-500',
    radio: 'from-amber-400 to-orange-500',
    artistRecos: 'from-purple-500 to-pink-500',
    cityMod: 'from-cyan-500 to-blue-500',
    topShows: 'from-indigo-500 to-violet-500',
    tagMixes: 'from-yellow-500 to-amber-500',
    brandNew: 'from-green-500 to-emerald-500',
    topArtists: 'from-fuchsia-500 to-purple-500',
  };

  const sections = [
    { key: 'songs', title: 'Trending Songs', items: getItems(trendingSongs), renderType: 'songs', seeAll: '/search/songs' },
    { key: 'charts', title: 'Top Charts', items: getItems(charts), renderType: 'playlists', seeAll: '/charts' },
    { key: 'newAlbums', title: 'New Releases', items: getItems(newAlbums), renderType: 'albums', seeAll: '/search/albums' },
    { key: 'playlists', title: 'Editorial Picks', items: getItems(topPlaylists), renderType: 'playlists', seeAll: '/search/playlists' },
    { key: 'trendingAlbums', title: 'Trending Albums', items: getItems(trendingAlbums), renderType: 'albums', seeAll: '/search/albums' },
    { key: 'radio', title: 'Radio Stations', items: getItems(radio), renderType: 'radio', seeAll: '/radio' },
    { key: 'artistRecos', title: 'Recommended Artists', items: getItems(artistRecos), renderType: 'artists', seeAll: '/search/artists' },
    { key: 'cityMod', title: "What's Hot Near You", items: getItems(cityMod), renderType: 'mixed', seeAll: null },
    { key: 'tagMixes', title: 'Tag Mixes', items: getItems(tagMixes), renderType: 'playlists', seeAll: '/moods' },
    { key: 'brandNew', title: 'Brand New', items: getItems(brandNew), renderType: 'albums', seeAll: '/search/albums' },
    { key: 'topArtists', title: 'Top Artists', items: getItems(topArtists), renderType: 'artists', seeAll: '/search/artists' },
    { key: 'topShows', title: 'Top Shows', items: getItems(topShows), renderType: 'podcasts', seeAll: '/podcasts' },
  ].filter(s => s.items.length > 0);

  const handleItemClick = (item: any, renderType: string) => {
    const type = item.type || renderType;
    if (type === 'song') loadAndPlay(item);
    else if (type === 'album') navigate(`/album/${item.id}`);
    else if (type === 'playlist') navigate(`/playlist/${item.id}`);
    else if (type === 'artist') navigate(`/artist/${item.id}`);
    else if (type === 'show' || type === 'podcast') navigate(`/podcast/${item.id}`);
    else if (type === 'channel') navigate(`/channel/${item.id}`);
    else if (type === 'radio_station') navigate(`/radio/${item.id}`);
    else if (renderType === 'albums') navigate(`/album/${item.id}`);
    else if (renderType === 'playlists') navigate(`/playlist/${item.id}`);
    else if (renderType === 'artists') navigate(`/artist/${item.id}`);
    else if (renderType === 'podcasts') navigate(`/podcast/${item.id}`);
    else if (renderType === 'radio') navigate(`/radio/${item.id}`);
    else if (renderType === 'channels') navigate(`/channel/${item.id}`);
  };

  const renderSection = (key: string, title: string, items: any[], renderType: string, seeAll: string | null, sIdx: number) => {
    const Icon = iconMap[key] || Music;
    const gradient = gradientMap[key] || 'from-primary to-accent';

    return (
      <motion.section
        key={key}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 + sIdx * 0.03 }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-base font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{title}</h2>
          </div>
          {seeAll && (
            <button onClick={() => navigate(seeAll)} className="text-xs text-primary font-semibold flex items-center gap-0.5 hover:underline">
              Show More <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {renderType === 'songs' ? (
          <div className="space-y-2">
            {items.slice(0, 20).map((song: any, i: number) => (
              <SongItem key={`${song.id}-${i}`} song={song} songList={items} songIdx={i} />
            ))}
          </div>
        ) : renderType === 'artists' ? (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
            {items.map((item: any) => (
              <MusicCard key={item.id} item={item} type="artists" />
            ))}
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {items.map((item: any) => {
              const type = item.type;
              let cardType: 'albums' | 'playlists' | 'podcasts' | 'songs' | 'artists' | 'radio' | 'channels' = 'playlists';
              if (type === 'album') cardType = 'albums';
              else if (type === 'artist') cardType = 'artists';
              else if (type === 'show' || type === 'podcast') cardType = 'podcasts';
              else if (type === 'song') cardType = 'songs';
              else if (renderType === 'albums') cardType = 'albums';
              else if (renderType === 'podcasts') cardType = 'podcasts';
              else if (renderType === 'radio') cardType = 'radio';

              return (
                <div key={item.id || item._id || Math.random()} className="flex-shrink-0" onClick={() => handleItemClick(item, renderType)}>
                  <MusicCard item={item} type={cardType} />
                </div>
              );
            })}
          </div>
        )}
      </motion.section>
    );
  };

  return (
    <div className="p-4 pb-40 space-y-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl overflow-hidden relative p-6"
        style={{ background: 'linear-gradient(135deg, hsla(25, 60%, 15%, 0.6), hsla(340, 50%, 12%, 0.5), hsla(250, 30%, 10%, 0.6))' }}
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Discover</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            What's <span className="text-primary">Trending</span> Today
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Curated from millions of listeners</p>
        </div>
      </motion.div>

      {/* All main sections */}
      {sections.map((s, i) => renderSection(s.key, s.title, s.items, s.renderType, s.seeAll, i))}

      {/* Dynamic promo sections */}
      {promoSections.map((s: any, i: number) => {
        if (!s) return null;
        return renderSection(s.key, s.title, s.items, s.renderType, null, sections.length + i);
      })}
    </div>
  );
};

export default Index;
