import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  searchSongs, searchAlbums, searchArtists, searchPlaylists, searchPodcasts,
  getTrendingSongs, getTrendingAlbums, getTrendingArtists, getTrendingPlaylists, getTrendingPodcasts,
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

const trendingFnMap: Record<string, (p: number, l: number) => Promise<any>> = {
  songs: getTrendingSongs,
  albums: getTrendingAlbums,
  artists: getTrendingArtists,
  playlists: getTrendingPlaylists,
  podcasts: getTrendingPodcasts,
};

const sectionMeta: Record<string, { icon: any; label: string; emoji: string }> = {
  songs: { icon: Flame, label: 'Popular Songs', emoji: '🔥' },
  albums: { icon: Disc3, label: 'Trending Albums', emoji: '💿' },
  artists: { icon: Star, label: 'Top Artists', emoji: '⭐' },
  playlists: { icon: ListMusic, label: 'Popular Playlists', emoji: '🎵' },
  podcasts: { icon: Radio, label: 'Trending Podcasts', emoji: '🎙️' },
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
  const sentinelRef = useRef<HTMLDivElement>(null);

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
      // Trending/popular mode
      setIsTrending(true);
      const trendFn = trendingFnMap[type];
      if (!trendFn) { setLoading(false); return; }
      trendFn(1, 30).then(data => {
        const r = data?.data?.results || [];
        setResults(r);
        setHasMore(data?.data?.hasMore ?? r.length >= 30);
      }).catch(() => {}).finally(() => setLoading(false));
    }
  }, [type, q]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      if (isTrending) {
        const trendFn = trendingFnMap[type];
        if (trendFn) {
          const data = await trendFn(nextPage, 30);
          const r = data?.data?.results || [];
          setResults(prev => [...prev, ...r]);
          setPage(nextPage);
          setHasMore(data?.data?.hasMore ?? r.length >= 30);
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

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { rootMargin: '250px' }
    );
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [hasMore, loadMore]);

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
        <div className="flex flex-wrap gap-3">
          {results.map(item => <MusicCard key={item.id} item={item} type="artists" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {results.map(item => <MusicCard key={item.id || item._id} item={item} type={type as any} />)}
        </div>
      )}
      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center py-4">
          {loadingMore && <Loader2 className="w-5 h-5 text-primary animate-spin" />}
        </div>
      )}
    </div>
  );
};

export default TabSearch;
