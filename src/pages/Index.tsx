import { useEffect, useState } from 'react';
import { getTrending, getTrendingSongs, searchSongs } from '@/lib/api';
import SongItem from '@/components/SongItem';
import MusicCard from '@/components/MusicCard';
import { Flame, TrendingUp, Disc3, ListMusic, Star, Radio, Sparkles, Loader2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface TrendingData {
  songs: any[];
  albums: any[];
  playlists: any[];
  artists: any[];
  podcasts: any[];
}

const sectionConfig = [
  { key: 'songs', title: 'Trending Songs', icon: Flame, gradient: 'from-rose-500 to-orange-400', emoji: '🔥' },
  { key: 'albums', title: 'Hot Albums', icon: Disc3, gradient: 'from-violet-500 to-purple-400', emoji: '💿' },
  { key: 'playlists', title: 'Top Playlists', icon: ListMusic, gradient: 'from-blue-500 to-cyan-400', emoji: '📋' },
  { key: 'artists', title: 'Popular Artists', icon: Star, gradient: 'from-amber-400 to-yellow-300', emoji: '⭐' },
  { key: 'podcasts', title: 'Trending Podcasts', icon: Radio, gradient: 'from-fuchsia-500 to-pink-400', emoji: '🎙️' },
];

const Index = () => {
  const navigate = useNavigate();
  const [trending, setTrending] = useState<TrendingData | null>(null);
  const [featuredSongs, setFeaturedSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getTrending(1, 20).catch(() => null),
      searchSongs('bollywood hits 2024', 10).catch(() => null),
    ]).then(([trendRes, featRes]) => {
      if (trendRes?.data) {
        setTrending({
          songs: trendRes.data.songs?.results || [],
          albums: trendRes.data.albums?.results || [],
          playlists: trendRes.data.playlists?.results || [],
          artists: trendRes.data.artists?.results || [],
          podcasts: trendRes.data.podcasts?.results || [],
        });
      }
      if (featRes?.data?.results) {
        setFeaturedSongs(featRes.data.results);
      }
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center animate-play-pulse">
          <Sparkles className="w-8 h-8 text-primary-foreground" />
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">Loading music…</p>
      </div>
    );
  }

  const toggleExpand = (key: string) => setExpanded(p => ({ ...p, [key]: !p[key] }));

  return (
    <div className="p-4 pb-40 space-y-6">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, hsla(160, 80%, 30%, 0.5), hsla(200, 80%, 25%, 0.5), hsla(340, 60%, 25%, 0.4))' }}
      >
        <div className="p-6 relative z-10">
          <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">🎵 Welcome to</p>
          <h1 className="text-2xl font-black text-gradient mb-2">SoundWave</h1>
          <p className="text-sm text-muted-foreground">Trending music, synced lyrics, podcasts & more</p>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/20 to-transparent rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-accent/15 to-transparent rounded-full blur-2xl" />
      </motion.div>

      {/* Featured Songs */}
      {featuredSongs.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-400 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            </div>
            <h2 className="text-sm font-black text-foreground">Bollywood Hits</h2>
          </div>
          <div className="space-y-1.5">
            {featuredSongs.slice(0, 5).map((song, i) => (
              <SongItem key={song.id} song={song} songList={featuredSongs} songIdx={i} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Trending Sections */}
      {trending && sectionConfig.map(({ key, title, icon: Icon, gradient, emoji }, sIdx) => {
        const items = trending[key as keyof TrendingData] || [];
        if (!items.length) return null;
        const isExpanded = expanded[key];

        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + sIdx * 0.05 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-r ${gradient} flex items-center justify-center`}>
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
                <h2 className="text-sm font-black text-foreground">{title}</h2>
              </div>
              {key === 'podcasts' && (
                <button onClick={() => navigate('/podcasts')} className="text-xs text-primary font-bold flex items-center gap-0.5">
                  See All <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>

            {key === 'songs' ? (
              <>
                <div className="space-y-1.5">
                  {(isExpanded ? items : items.slice(0, 5)).map((song: any, i: number) => (
                    <SongItem key={song.id} song={song} songList={items} songIdx={i} />
                  ))}
                </div>
                {items.length > 5 && (
                  <button
                    onClick={() => toggleExpand(key)}
                    className="w-full mt-2 py-2.5 card-surface rounded-2xl text-primary text-xs font-bold transition-all hover:bg-primary/5"
                  >
                    {isExpanded ? 'Show Less' : `Show More (${items.length - 5})`}
                  </button>
                )}
              </>
            ) : key === 'artists' ? (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {items.slice(0, 12).map((item: any) => (
                  <MusicCard key={item.id} item={item} type="artists" />
                ))}
              </div>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
                {items.slice(0, 12).map((item: any) => (
                  <MusicCard key={item.id || item._id} item={item} type={key as any} />
                ))}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default Index;
