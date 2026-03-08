import { useEffect, useState, useCallback } from 'react';
import {
  getTrending, getTrendingSongs, getTrendingAlbums,
  getTrendingPlaylists, getTrendingArtists, getTrendingPodcasts,
  searchSongs,
} from '@/lib/api';
import SongItem from '@/components/SongItem';
import MusicCard from '@/components/MusicCard';
import { Flame, Disc3, ListMusic, Star, Radio, Sparkles, ChevronRight, ChevronDown, Loader2, Music } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface SectionData {
  items: any[];
  page: number;
  hasMore: boolean;
  loading: boolean;
}

const quickFilters = [
  { label: '🔥 Trending', query: 'trending hindi songs' },
  { label: '🎬 Bollywood', query: 'bollywood hits 2025' },
  { label: '💕 Romantic', query: 'hindi romantic songs' },
  { label: '🎤 Arijit Singh', query: 'arijit singh' },
  { label: '🎵 Punjabi', query: 'punjabi hits' },
  { label: '😢 Sad Songs', query: 'hindi sad songs' },
  { label: '💃 Party', query: 'bollywood party songs' },
  { label: '🕉️ Devotional', query: 'hindi bhajan' },
  { label: '🎧 Lo-Fi', query: 'hindi lofi' },
  { label: '🎶 90s Hits', query: '90s bollywood hits' },
  { label: '🆕 New Releases', query: 'new hindi songs 2025' },
  { label: '🎼 Ghazals', query: 'best ghazals hindi' },
];

const sectionConfig = [
  { key: 'albums', title: 'Hot Albums', icon: Disc3, gradient: 'from-violet-500 to-indigo-500', fetchFn: getTrendingAlbums },
  { key: 'playlists', title: 'Popular Playlists', icon: ListMusic, gradient: 'from-sky-500 to-blue-600', fetchFn: getTrendingPlaylists },
  { key: 'artists', title: 'Top Artists', icon: Star, gradient: 'from-amber-400 to-orange-500', fetchFn: getTrendingArtists },
  { key: 'podcasts', title: 'Trending Podcasts', icon: Radio, gradient: 'from-pink-500 to-fuchsia-500', fetchFn: getTrendingPodcasts },
];

const Index = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<Record<string, SectionData>>({});
  const [songsExpanded, setSongsExpanded] = useState(false);

  // Popular songs state
  const [activeFilter, setActiveFilter] = useState(quickFilters[0]);
  const [songs, setSongs] = useState<any[]>([]);
  const [songsPage, setSongsPage] = useState(1);
  const [songsHasMore, setSongsHasMore] = useState(true);
  const [songsLoading, setSongsLoading] = useState(true);
  const [songsLoadingMore, setSongsLoadingMore] = useState(false);

  // Load trending sections
  useEffect(() => {
    setLoading(true);
    getTrending(1, 20).then(res => {
      if (res?.data) {
        const data: Record<string, SectionData> = {};
        for (const { key } of sectionConfig) {
          const sectionData = res.data[key];
          const items = sectionData?.results || [];
          data[key] = {
            items,
            page: sectionData?.page || 1,
            hasMore: sectionData?.hasMore ?? items.length >= 20,
            loading: false,
          };
        }
        setSections(data);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // Load songs when filter changes
  useEffect(() => {
    setSongsLoading(true);
    setSongs([]);
    setSongsPage(1);
    setSongsExpanded(false);
    searchSongs(activeFilter.query, 20, 1).then(res => {
      const results = res?.data?.results || [];
      setSongs(results);
      setSongsHasMore((res?.data?.total || 0) > results.length);
    }).catch(() => {}).finally(() => setSongsLoading(false));
  }, [activeFilter]);

  const loadMoreSongs = useCallback(async () => {
    if (songsLoadingMore || !songsHasMore) return;
    setSongsLoadingMore(true);
    try {
      const nextPage = songsPage + 1;
      const res = await searchSongs(activeFilter.query, 20, nextPage);
      const newItems = res?.data?.results || [];
      setSongs(prev => [...prev, ...newItems]);
      setSongsPage(nextPage);
      setSongsHasMore(newItems.length >= 20);
    } catch {} finally {
      setSongsLoadingMore(false);
    }
  }, [songsPage, songsHasMore, songsLoadingMore, activeFilter]);

  const loadMore = useCallback(async (key: string) => {
    const section = sections[key];
    if (!section || section.loading || !section.hasMore) return;

    setSections(prev => ({ ...prev, [key]: { ...prev[key], loading: true } }));

    const config = sectionConfig.find(s => s.key === key);
    if (!config) return;

    try {
      const nextPage = section.page + 1;
      const res = await config.fetchFn(nextPage, 20);
      const newItems = res?.data?.results || [];
      setSections(prev => ({
        ...prev,
        [key]: {
          items: [...prev[key].items, ...newItems],
          page: nextPage,
          hasMore: res?.data?.hasMore ?? newItems.length >= 20,
          loading: false,
        },
      }));
    } catch {
      setSections(prev => ({ ...prev, [key]: { ...prev[key], loading: false } }));
    }
  }, [sections]);

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

      {/* Popular Songs with Quick Filters */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-lg">
            <Flame className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-base font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Popular Songs</h2>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 flex-wrap mb-4">
          {quickFilters.map((f) => (
            <button
              key={f.query}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap ${
                activeFilter.query === f.query
                  ? 'btn-3d-primary text-primary-foreground'
                  : 'btn-3d-glass text-muted-foreground hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Songs List */}
        {songsLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : songs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No songs found</p>
        ) : (
          <>
            <div className="space-y-2">
              {(songsExpanded ? songs : songs.slice(0, 6)).map((song: any, i: number) => (
                <SongItem key={`${song.id}-${i}`} song={song} songList={songs} songIdx={i} />
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              {songs.length > 6 && (
                <button
                  onClick={() => setSongsExpanded(p => !p)}
                  className="flex-1 py-2.5 card-surface rounded-2xl text-sm font-semibold text-primary flex items-center justify-center gap-1.5 hover:bg-primary/5 transition-colors"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${songsExpanded ? 'rotate-180' : ''}`} />
                  {songsExpanded ? 'Show Less' : `Show All (${songs.length})`}
                </button>
              )}
              {songsHasMore && (
                <button
                  onClick={loadMoreSongs}
                  disabled={songsLoadingMore}
                  className="flex-1 py-2.5 btn-3d-primary rounded-2xl text-sm font-bold text-primary-foreground flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {songsLoadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Load More'}
                </button>
              )}
            </div>
          </>
        )}
      </motion.section>

      {/* Other Sections */}
      {sectionConfig.map(({ key, title, icon: Icon, gradient }, sIdx) => {
        const section = sections[key];
        if (!section || !section.items.length) return null;

        return (
          <motion.section
            key={key}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + sIdx * 0.06 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-base font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{title}</h2>
              </div>
              {key === 'podcasts' && (
                <button onClick={() => navigate('/podcasts')} className="text-xs text-primary font-semibold flex items-center gap-0.5 hover:underline">
                  See All <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {key === 'artists' ? (
              <>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                  {section.items.map((item: any) => (
                    <MusicCard key={item.id} item={item} type="artists" />
                  ))}
                </div>
                {section.hasMore && (
                  <button
                    onClick={() => loadMore(key)}
                    disabled={section.loading}
                    className="w-full mt-2 py-2.5 card-surface rounded-2xl text-sm font-semibold text-primary flex items-center justify-center gap-1.5 hover:bg-primary/5 transition-colors disabled:opacity-50"
                  >
                    {section.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Load More Artists'}
                  </button>
                )}
              </>
            ) : (
              <>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
                  {section.items.map((item: any) => (
                    <MusicCard key={item.id || item._id} item={item} type={key as any} />
                  ))}
                </div>
                {section.hasMore && (
                  <button
                    onClick={() => loadMore(key)}
                    disabled={section.loading}
                    className="w-full mt-2 py-2.5 card-surface rounded-2xl text-sm font-semibold text-primary flex items-center justify-center gap-1.5 hover:bg-primary/5 transition-colors disabled:opacity-50"
                  >
                    {section.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : `Load More ${title.split(' ')[1] || ''}`}
                  </button>
                )}
              </>
            )}
          </motion.section>
        );
      })}
    </div>
  );
};

export default Index;
