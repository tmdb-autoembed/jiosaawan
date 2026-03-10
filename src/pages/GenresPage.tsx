import { useEffect, useState, useCallback } from 'react';
import { getGenres, getImg, decodeHtml } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { Layers, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const GenresPage = () => {
  const navigate = useNavigate();
  const [genres, setGenres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setLoading(true);
    getGenres(1, 30).then(res => {
      const items = res?.data?.results || [];
      setGenres(items);
      setHasMore(res?.data?.hasMore ?? items.length >= 30);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const next = page + 1;
      const res = await getGenres(next, 30);
      const items = res?.data?.results || [];
      if (items.length === 0) setHasMore(false);
      else { setGenres(prev => [...prev, ...items]); setPage(next); setHasMore(res?.data?.hasMore ?? items.length >= 30); }
    } catch {} finally { setLoadingMore(false); }
  }, [page, hasMore, loadingMore]);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="p-4 pb-40 space-y-6">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg">
          <Layers className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Genres</h1>
      </div>

      <div className="grid gap-3 justify-items-center" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
        {genres.map((g: any, i: number) => (
          <motion.button
            key={g.id || i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => navigate(`/channel/${g.id}`)}
            className="card-surface rounded-2xl overflow-hidden w-full transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl active:scale-[0.97] text-left group"
          >
            <div className="relative aspect-square overflow-hidden">
              <img src={getImg(g.image, '500x500')} alt={decodeHtml(g.name)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            </div>
            <div className="p-3">
              <p className="text-xs font-semibold text-foreground truncate">{decodeHtml(g.name || '')}</p>
            </div>
          </motion.button>
        ))}
      </div>

      {hasMore && (
        <button onClick={loadMore} disabled={loadingMore} className="w-full py-2.5 btn-3d-glass rounded-2xl text-sm font-semibold text-primary flex items-center justify-center gap-1.5 disabled:opacity-50">
          {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Load More'}
        </button>
      )}
    </div>
  );
};

export default GenresPage;
