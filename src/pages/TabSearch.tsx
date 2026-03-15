import { useEffect, useState, useCallback } from 'react';
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

const trendingFnMap: Record<string, (page?: number) => Promise<any>> = {
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

function extractTrendingResults(data: any): any[] {
  if (!data?.data) return [];
  const d = data.data;
  if (Array.isArray(d)) return d;
  if (d.results) return d.results;
  if (d.songs) return Array.isArray(d.songs) ? d.songs : (d.songs.results || []);
  return Object.values(d).flat().filter((x: any) => x && typeof x === 'object');
}

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
      setIsTrending(false);
      const fn = fetchFnMap[type];
      if (!fn) return;
      fn(q, 20, 1).then(data => {
        const r = extractResults(data);
        setResults(r);
        setHasMore(r.length >= 20);
      }).catch(() => {}).finally(() => setLoading(false));
    } else {
      setIsTrending(true);
      const trendingFn = trendingFnMap[type];
      if (!trendingFn) { setLoading(false); return; }
      trendingFn(1).then(data => {
        const r = extractTrendingResults(data);
        setResults(r);
        setHasMore(r.length >= 10);
      }).catch(() => {}).finally(() => setLoading(false));
    }
  }, [type, q]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      if (isTrending) {
        const trendingFn = trendingFnMap[type];
        if (!trendingFn) { setHasMore(false); setLoadingMore(false); return; }
        const data = await trendingFn(nextPage);
        const r = extractTrendingResults(data);
        if (r.length === 0) { setHasMore(false); }
        else {
          setResults(prev => [...prev, ...r]);
          setPage(nextPage);
          setHasMore(r.length >= 10);
        }
      } else {
        const fn = fetchFnMap[type];
        if (!fn) { setHasMore(false); setLoadingMore(false); return; }
        const data = await fn(q, 20, nextPage);
        const r = extractResults(data);
        if (r.length === 0) { setHasMore(false); }
        else {
          setResults(prev => [...prev, ...r]);
          setPage(nextPage);
          setHasMore(r.length >= 20);
        }
      }
    } catch {} finally { setLoadingMore(false); }
  }, [page, hasMore, loadingMore, isTrending, type, q]);

  const meta = sectionMeta[type] || sectionMeta.songs;
  const Icon = meta.icon;
  const heading = q
    ? `${meta.emoji} "${q}" — ${meta.label}`
    : `${meta.emoji} ${meta.label}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!results.length) {
    return <p className="text-center text-muted-foreground py-10">No results found</p>;
  }

  return (
    <div className="p-4 pb-40 space-y-4">
      <div className="flex items-center gap-2.5 mb-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Icon className="w-4 h-4 text-white" />
        </div>
        <h2 className="text-base font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{heading}</h2>
      </div>

      {type === 'songs' ? (
        <div className="space-y-2">
          {results.map((song: any, i: number) => (
            <SongItem key={`${song.id}-${i}`} song={song} songList={results} songIdx={i} />
          ))}
        </div>
      ) : type === 'artists' ? (
        <div className="grid gap-4 justify-items-center" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))' }}>
          {results.map((item: any) => (
            <MusicCard key={item.id} item={item} type="artists" />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 justify-items-center" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
          {results.map((item: any) => (
            <MusicCard key={item.id || item._id} item={item} type={type as any} />
          ))}
        </div>
      )}

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loadingMore}
          className="w-full mt-3 py-2.5 rounded-2xl text-sm font-semibold text-primary flex items-center justify-center gap-1.5 disabled:opacity-50 bg-secondary/20 hover:bg-secondary/30 transition-all"
        >
          {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Load More'}
        </button>
      )}
    </div>
  );
};

export default TabSearch;
