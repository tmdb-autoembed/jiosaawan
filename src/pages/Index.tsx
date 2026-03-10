import { useEffect, useState } from 'react';
import { getHomeFeed, getImg, decodeHtml } from '@/lib/api';
import SongItem from '@/components/SongItem';
import MusicCard from '@/components/MusicCard';
import { Flame, Disc3, ListMusic, Star, Radio, Sparkles, Music, BarChart3, Headphones, MapPin, Heart, Loader2, ChevronRight } from 'lucide-react';
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
        <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center animate-play-pulse">
          <Music className="w-8 h-8 text-primary-foreground" />
        </div>
        <p className="text-sm text-muted-foreground animate-pulse font-medium">Discovering music…</p>
      </div>
    );
  }

  if (!homeData) return <p className="text-center text-muted-foreground py-10">Failed to load</p>;

  // Extract modules from home data
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
  
  // Promos (various sections)
  const promos = homeData.promos || {};
  const freshHits = promos['promo:vx:data:68'] || [];
  const genresMoods = promos['promo:vx:data:76'] || [];
  const bestOf90s = promos['promo:vx:data:185'] || [];
  const trendingPodcasts = promos['promo:vx:data:107'] || [];

  // Flatten all items if they have results nested
  const getItems = (data: any): any[] => {
    if (Array.isArray(data)) return data;
    if (data?.results) return data.results;
    if (data?.data) return Array.isArray(data.data) ? data.data : data.data.results || [];
    return [];
  };

  const sections = [
    { key: 'songs', title: 'Trending Songs', icon: Flame, gradient: 'from-orange-500 to-rose-500', items: getItems(trendingSongs), renderType: 'songs' },
    { key: 'charts', title: 'Top Charts', icon: BarChart3, gradient: 'from-emerald-500 to-teal-500', items: getItems(charts), renderType: 'playlists', seeAll: '/charts' },
    { key: 'newAlbums', title: 'New Releases', icon: Disc3, gradient: 'from-violet-500 to-indigo-500', items: getItems(newAlbums), renderType: 'albums' },
    { key: 'playlists', title: 'Editorial Picks', icon: ListMusic, gradient: 'from-sky-500 to-blue-600', items: getItems(topPlaylists), renderType: 'playlists' },
    { key: 'trendingAlbums', title: 'Trending Albums', icon: Disc3, gradient: 'from-pink-500 to-rose-500', items: getItems(trendingAlbums), renderType: 'albums' },
    { key: 'radio', title: 'Radio Stations', icon: Radio, gradient: 'from-amber-400 to-orange-500', items: getItems(radio), renderType: 'radio', seeAll: '/radio' },
    { key: 'artistRecos', title: 'Recommended Artists', icon: Star, gradient: 'from-purple-500 to-pink-500', items: getItems(artistRecos), renderType: 'artists' },
    { key: 'cityMod', title: "What's Hot Near You", icon: MapPin, gradient: 'from-cyan-500 to-blue-500', items: getItems(cityMod), renderType: 'mixed' },
    { key: 'freshHits', title: 'Fresh Hits', icon: Sparkles, gradient: 'from-green-500 to-emerald-500', items: getItems(freshHits), renderType: 'playlists' },
    { key: 'genresMoods', title: 'Top Genres & Moods', icon: Heart, gradient: 'from-rose-500 to-pink-500', items: getItems(genresMoods), renderType: 'channels', seeAll: '/moods' },
    { key: 'trendingPodcasts', title: 'Trending Podcasts', icon: Headphones, gradient: 'from-fuchsia-500 to-purple-500', items: getItems(trendingPodcasts), renderType: 'podcasts', seeAll: '/podcasts' },
    { key: 'bestOf90s', title: 'Best Of 90s', icon: Music, gradient: 'from-yellow-500 to-amber-500', items: getItems(bestOf90s), renderType: 'playlists' },
    { key: 'topShows', title: 'Top Shows', icon: Headphones, gradient: 'from-indigo-500 to-violet-500', items: getItems(topShows), renderType: 'podcasts' },
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
            <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Discover</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            What's <span className="text-gradient">Trending</span> Today
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Curated from millions of listeners</p>
        </div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/15 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-3xl" />
      </motion.div>

      {/* Render all sections dynamically */}
      {sections.map(({ key, title, icon: Icon, gradient, items, renderType, seeAll }, sIdx) => (
        <motion.section
          key={key}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + sIdx * 0.04 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-base font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{title}</h2>
            </div>
            {seeAll && (
              <button onClick={() => navigate(seeAll)} className="text-xs text-primary font-semibold flex items-center gap-0.5 hover:underline">
                See All <ChevronRight className="w-3.5 h-3.5" />
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
                let cardType: 'albums' | 'playlists' | 'podcasts' | 'songs' | 'artists' = 'playlists';
                if (type === 'album') cardType = 'albums';
                else if (type === 'artist') cardType = 'artists';
                else if (type === 'show' || type === 'podcast') cardType = 'podcasts';
                else if (type === 'song') cardType = 'songs';
                else if (renderType === 'albums') cardType = 'albums';
                else if (renderType === 'podcasts') cardType = 'podcasts';

                return (
                  <div key={item.id || item._id} className="flex-shrink-0" onClick={() => handleItemClick(item, renderType)}>
                    <MusicCard item={item} type={cardType} />
                  </div>
                );
              })}
            </div>
          )}
        </motion.section>
      ))}
    </div>
  );
};

export default Index;
