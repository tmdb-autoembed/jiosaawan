import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  searchSongs, searchAlbums, searchArtists, searchPlaylists, searchPodcasts,
  getTrending, getTrendingPlaylists, getTrendingPodcasts,
  extractResults,
} from '@/lib/api';
import SongItem from '@/components/SongItem';
import MusicCard from '@/components/MusicCard';
import { Loader2, Flame, Disc3, Star, ListMusic, Radio } from 'lucide-react';

const fetchFnMap: Record<string, (q: string, l: number, p: number) => Promise<any>> = {
  songs: searchSongs,
  albums: searchAlbums,
  artists: searchArtists,
  playlists: searchPlaylists,
  podcasts: searchPodcasts as any,
};

const sectionMeta: Record<string, { icon: any; label: string; emoji: string }> = {
  songs: { icon: Flame, label: 'Popular Songs', emoji: '🔥' },
  albums: { icon: Disc3, label: 'Trending Albums', emoji: '💿' },
  artists: { icon: Star, label: 'Top Artists', emoji: '⭐' },
  playlists: { icon: ListMusic, label: 'Popular Playlists', emoji: '🎵' },
  podcasts: { icon: Radio, label: 'Trending Podcasts', emoji: '🎙️' },
};

// Which trending endpoints support pagination
// albums: none, artists: none, playlists: page only, podcasts: page+limit
// songs: use /trending endpoint which has songs in it
const trendingCanPaginate: Record<string, boolean> = {
  songs: true,
  albums: false,
  artists: false,
  playlists: true,
  podcasts: true,
};

const TabSearch = ({ type }: { type: string }) => {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isTrending, setIsTrending] = useState(false);

  useEffect(() => {
    setResults([]);
    setPage(1);
    setHasMore(true);
    setLoading(true);

    if (q.trim()) {
      // Search mode
      setIsTrending(false);
      const fn = fetchFnMap[type];
      if (!fn) return;
      fn(q, 20, 1).then(data => {
        const r = extractResults(data);
        setResults(r);
        setHasMore(r.length >= 20);
      }).catch(() => {}).finally(() => setLoading(false));
    } else {
      // Trending mode - use /trending endpoint for initial load
      setIsTrending(true);
      getTrending(1, 30).then(data => {
        let r: any[] = [];
        if (data?.data) {
          if (type === 'songs') {
            // songs come from data.songs or search
            r = data.data.songs?.results || data.data.trending?.results || [];
          } else {
            r = data.data[type]?.results || [];
          }
        }
        setResults(r);
        setHasMore(trendingCanPaginate[type] ? (r.length >= 20) : false);
      }).catch(() => {}).finally(() => setLoading(false));
    }
  }, [type, q]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      if (isTrending) {
        // Only playlists and podcasts support trending pagination
        let res: any;
        if (type === 'playlists') {
          res = await getTrendingPlaylists(nextPage);
        } else if (type === 'podcasts') {
          res = await getTrendingPodcasts(nextPage, 30);
        } else {
          // songs search pagination, albums/artists don't paginate
          setHasMore(false);
          setLoadingMore(false);
          return;
        }
        const r = res?.data?.results || [];
        if (r.length === 0) {
          setHasMore(false);
        } else {
          setResults(prev => [...prev, ...r]);
          setPage(nextPage);
          setHasMore(res?.data?.hasMore ?? r.length >= 20);
        }
      } else {
        const data = await fetchFnMap[type](q, 20, nextPage);
        const r = extractResults(data);
        setResults(prev => [...prev, ...r]);
        setPage(nextPage);
        if (r.length < 20) setHasMore(false);
      }
    } catch {}
    setLoadingMore(false);
  }, [page, hasMore, loadingMore, type, q, isTrending]);

  const meta = sectionMeta[type] || sectionMeta.songs;

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;
  if (!results.length && q) return <div className="text-center py-16 text-muted-foreground">No results for "{q}"</div>;
  if (!results.length) return <div className="text-center py-16 text-muted-foreground">No content available</div>;

  return (
    <div className="p-4 pb-40">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg btn-3d">
          <meta.icon className="w-4 h-4 text-primary-foreground" />
        </div>
        <h2 className="text-sm font-black text-foreground capitalize" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {q ? `${type}: "${q}"` : `${meta.emoji} ${meta.label}`}
        </h2>
        {isTrending && (
          <span className="ml-auto px-2.5 py-1 rounded-xl bg-gradient-warm text-[10px] font-bold text-primary-foreground btn-3d-sm">
            TRENDING
          </span>
        )}
      </div>

      {type === 'songs' ? (
        <div className="space-y-1.5">
          {results.map((song, i) => <SongItem key={`${song.id}-${i}`} song={song} songList={results} songIdx={i} />)}
        </div>
      ) : type === 'artists' ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 justify-items-center">
          {results.map(item => <MusicCard key={item.id} item={item} type="artists" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 justify-items-center">
          {results.map(item => <MusicCard key={item.id || item._id} item={item} type={type as any} />)}
        </div>
      )}

      {hasMore ? (
        <button
          onClick={loadMore}
          disabled={loadingMore}
          className="w-full mt-3 py-2.5 btn-3d-glass rounded-2xl text-sm font-semibold text-primary flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : `Load More`}
        </button>
      ) : results.length > 0 && (
        <p className="text-center text-xs text-muted-foreground/50 py-3 font-medium">— No more results —</p>
      )}
    </div>
  );
};

export default TabSearch;
