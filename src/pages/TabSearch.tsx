import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchSongs, searchAlbums, searchArtists, searchPlaylists, extractResults } from '@/lib/api';
import SongItem from '@/components/SongItem';
import MusicCard from '@/components/MusicCard';
import { Loader2 } from 'lucide-react';

const fetchFnMap: Record<string, (q: string, l: number, p: number) => Promise<any>> = {
  songs: searchSongs,
  albums: searchAlbums,
  artists: searchArtists,
  playlists: searchPlaylists,
};

const TabSearch = ({ type }: { type: string }) => {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setResults([]);
    setPage(1);
    setHasMore(true);
    if (!q.trim()) { setLoading(false); return; }
    setLoading(true);
    const fn = fetchFnMap[type];
    if (!fn) return;
    fn(q, 20, 1).then(data => {
      const r = extractResults(data);
      setResults(r);
      setHasMore(r.length >= 20);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [type, q]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const data = await fetchFnMap[type](q, 20, nextPage);
      const r = extractResults(data);
      setResults(prev => [...prev, ...r]);
      setPage(nextPage);
      if (r.length < 20) setHasMore(false);
    } catch {}
    setLoadingMore(false);
  }, [page, hasMore, loadingMore, type, q]);

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { rootMargin: '250px' }
    );
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [hasMore, loadMore]);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;
  if (!results.length) return <div className="text-center py-16 text-muted-foreground">No results</div>;

  return (
    <div className="p-4 pb-40">
      <h2 className="text-sm font-black text-foreground mb-3 capitalize">{type}: "{q}"</h2>
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
