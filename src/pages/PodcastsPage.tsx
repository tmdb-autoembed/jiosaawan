import { useEffect, useState, useCallback } from 'react';
import { getTrendingPodcasts, searchPodcasts, getImg } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { Radio, Search, Loader2, Headphones } from 'lucide-react';
import { motion } from 'framer-motion';

const PodcastsPage = () => {
  const navigate = useNavigate();
  const [podcasts, setPodcasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setLoading(true);
    getTrendingPodcasts()
      .then(res => {
        const items = res?.data?.results || [];
        setPodcasts(items);
        setHasMore(res?.data?.hasMore ?? items.length >= 10);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setPage(1);
    try {
      const res = await searchPodcasts(query.trim(), 1, 20);
      const data = res?.data;
      if (data) {
        const items = data.episodes || data.results || (Array.isArray(data) ? data : [data]);
        if (items.length) {
          setPodcasts(items);
          setHasMore(items.length >= 20);
        }
      }
    } catch {}
    setSearching(false);
  };

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const next = page + 1;
      if (query.trim()) {
        const res = await searchPodcasts(query.trim(), next, 20);
        const items = res?.data?.results || res?.data?.episodes || [];
        if (items.length === 0) setHasMore(false);
        else { setPodcasts(prev => [...prev, ...items]); setPage(next); setHasMore(items.length >= 20); }
      } else {
        setHasMore(false);
      }
    } catch {} finally { setLoadingMore(false); }
  }, [page, hasMore, loadingMore, query]);

  return (
    <div className="p-4 pb-40">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-fuchsia-500 to-pink-400 flex items-center justify-center">
          <Headphones className="w-4 h-4 text-white" />
        </div>
        <h1 className="text-lg font-black text-foreground">Podcasts</h1>
      </div>

      <div className="flex items-center bg-secondary/60 border border-border/40 rounded-2xl overflow-hidden mb-6 focus-within:border-primary/30 transition-colors">
        <Search className="w-4 h-4 text-muted-foreground ml-3.5 flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="Search podcasts…"
          className="flex-1 bg-transparent px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
        />
        {searching && <Loader2 className="w-4 h-4 text-primary animate-spin mr-3" />}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : podcasts.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
          <Radio className="w-12 h-12 opacity-50" />
          <p className="text-sm">No podcasts found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {podcasts.map((pod: any, i: number) => {
            const imgUrl = getImg(pod.image || pod.squareImage, '150x150');
            return (
              <motion.button
                key={pod.id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => navigate(`/podcast/${pod.id}`)}
                className="card-surface rounded-2xl overflow-hidden text-left group transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/10"
              >
                <div className="aspect-square overflow-hidden relative">
                  {imgUrl ? (
                    <img src={imgUrl} alt={pod.name || ''} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center">
                      <Radio className="w-8 h-8 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-400 text-[9px] font-bold text-white">
                    PODCAST
                  </div>
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-bold text-foreground truncate">{pod.name || 'Untitled'}</p>
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                    {pod.totalEpisodes ? `${pod.totalEpisodes} episodes` : pod.language || ''}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      {hasMore && (
        <button onClick={loadMore} disabled={loadingMore} className="w-full mt-4 py-2.5 card-surface rounded-2xl text-sm font-semibold text-primary flex items-center justify-center gap-1.5 disabled:opacity-50">
          {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Load More'}
        </button>
      )}
    </div>
  );
};

export default PodcastsPage;
