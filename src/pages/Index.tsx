import { useEffect, useState, useCallback } from 'react';
import {
  getTrending, getTrendingPlaylists, getTrendingPodcasts, getTrendingArtists,
} from '@/lib/api';
import SongItem from '@/components/SongItem';
import MusicCard from '@/components/MusicCard';
import { Flame, Disc3, ListMusic, Star, Radio, Sparkles, ChevronRight, Loader2, Music } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface SectionData {
  items: any[];
  page: number;
  hasMore: boolean;
  loading: boolean;
}

// pagination config per section
// albums: NO pagination, artists: page only, playlists: page only, podcasts: page+limit
const sectionConfig = [
  { key: 'albums', title: 'Hot Albums', icon: Disc3, gradient: 'from-violet-500 to-indigo-500', canPaginate: false },
  { key: 'playlists', title: 'Popular Playlists', icon: ListMusic, gradient: 'from-sky-500 to-blue-600', canPaginate: true },
  { key: 'artists', title: 'Top Artists', icon: Star, gradient: 'from-amber-400 to-orange-500', canPaginate: true },
  { key: 'podcasts', title: 'Trending Podcasts', icon: Radio, gradient: 'from-pink-500 to-fuchsia-500', canPaginate: true },
];

const Index = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<Record<string, SectionData>>({});

  // Songs from trending
  const [songs, setSongs] = useState<any[]>([]);
  const [songsPage, setSongsPage] = useState(1);
  const [songsHasMore, setSongsHasMore] = useState(true);
  const [songsLoading, setSongsLoading] = useState(true);
  const [songsLoadingMore, setSongsLoadingMore] = useState(false);

  // Load trending sections + songs
  useEffect(() => {
    setLoading(true);
    setSongsLoading(true);
    getTrending(1, 20).then(res => {
      if (res?.data) {
        // Songs from trending
        const trendingSongs = res.data.songs?.results || [];
        setSongs(trendingSongs);
        setSongsHasMore(res.data.songs?.hasMore ?? trendingSongs.length >= 20);
        setSongsLoading(false);

        const data: Record<string, SectionData> = {};
        for (const { key, canPaginate } of sectionConfig) {
          const sectionData = res.data[key];
          const items = sectionData?.results || [];
          data[key] = {
            items,
            page: sectionData?.page || 1,
            hasMore: canPaginate ? (sectionData?.hasMore ?? items.length >= 20) : false,
            loading: false,
          };
        }
        setSections(data);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const loadMoreSongs = useCallback(async () => {
    if (songsLoadingMore || !songsHasMore) return;
    setSongsLoadingMore(true);
    try {
      const nextPage = songsPage + 1;
      const res = await getTrending(nextPage, 20);
      const newItems = res?.data?.songs?.results || [];
      if (newItems.length === 0) {
        setSongsHasMore(false);
      } else {
        setSongs(prev => [...prev, ...newItems]);
        setSongsPage(nextPage);
        setSongsHasMore(res?.data?.songs?.hasMore ?? newItems.length >= 20);
      }
    } catch {} finally {
      setSongsLoadingMore(false);
    }
  }, [songsPage, songsHasMore, songsLoadingMore]);

  const loadMore = useCallback(async (key: string) => {
    const section = sections[key];
    if (!section || section.loading || !section.hasMore) return;

    setSections(prev => ({ ...prev, [key]: { ...prev[key], loading: true } }));

    try {
      const nextPage = section.page + 1;
      let res: any;
      if (key === 'playlists') {
        res = await getTrendingPlaylists(nextPage);
      } else if (key === 'podcasts') {
        res = await getTrendingPodcasts(nextPage, 30);
      } else if (key === 'artists') {
        res = await getTrendingArtists(nextPage);
      } else {
        // albums don't paginate
        setSections(prev => ({ ...prev, [key]: { ...prev[key], loading: false, hasMore: false } }));
        return;
      }
      const newItems = res?.data?.results || [];
      if (newItems.length === 0) {
        setSections(prev => ({ ...prev, [key]: { ...prev[key], loading: false, hasMore: false } }));
      } else {
        setSections(prev => ({
          ...prev,
          [key]: {
            items: [...prev[key].items, ...newItems],
            page: nextPage,
            hasMore: res?.data?.hasMore ?? newItems.length >= 20,
            loading: false,
          },
        }));
      }
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

      {/* Trending Songs */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-lg">
            <Flame className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-base font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Trending Songs</h2>
        </div>

        {songsLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : songs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No songs found</p>
        ) : (
          <>
            <div className="space-y-2">
              {songs.map((song: any, i: number) => (
                <SongItem key={`${song.id}-${i}`} song={song} songList={songs} songIdx={i} />
              ))}
            </div>
            {songsHasMore ? (
              <button
                onClick={loadMoreSongs}
                disabled={songsLoadingMore}
                className="w-full mt-3 py-2.5 btn-3d-glass rounded-2xl text-sm font-semibold text-primary flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {songsLoadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Load More Songs'}
              </button>
            ) : (
              <p className="text-center text-xs text-muted-foreground/50 py-4 font-medium">— No more results —</p>
            )}
          </>
        )}
      </motion.section>

      {/* Other Sections */}
      {sectionConfig.map(({ key, title, icon: Icon, gradient, canPaginate }, sIdx) => {
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
              <div className="grid gap-4 justify-items-center" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))' }}>
                {section.items.map((item: any) => (
                  <MusicCard key={item.id} item={item} type="artists" />
                ))}
              </div>
            ) : (
              <div className="grid gap-3 justify-items-center" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
                {section.items.map((item: any) => (
                  <MusicCard key={item.id || item._id} item={item} type={key as any} />
                ))}
              </div>
            )}

            {canPaginate && section.hasMore ? (
              <button
                onClick={() => loadMore(key)}
                disabled={section.loading}
                className="w-full mt-3 py-2.5 btn-3d-glass rounded-2xl text-sm font-semibold text-primary flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {section.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : `Load More ${title.split(' ')[1] || ''}`}
              </button>
            ) : canPaginate && section.items.length > 0 && !section.hasMore ? (
              <p className="text-center text-xs text-muted-foreground/50 py-3 font-medium">— No more results —</p>
            ) : null}
          </motion.section>
        );
      })}
    </div>
  );
};

export default Index;
