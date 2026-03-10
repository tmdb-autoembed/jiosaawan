import { useEffect, useState, useCallback } from 'react';
import { getMoods, getImg, decodeHtml } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { Heart, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const MoodsPage = () => {
  const navigate = useNavigate();
  const [moods, setMoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setLoading(true);
    getMoods(1, 20).then(res => {
      const items = res?.data?.results || [];
      setMoods(items);
      setHasMore(res?.data?.hasMore ?? items.length >= 20);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const next = page + 1;
      const res = await getMoods(next, 20);
      const items = res?.data?.results || [];
      if (items.length === 0) setHasMore(false);
      else { setMoods(prev => [...prev, ...items]); setPage(next); setHasMore(res?.data?.hasMore ?? items.length >= 20); }
    } catch {} finally { setLoadingMore(false); }
  }, [page, hasMore, loadingMore]);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="p-4 pb-40 space-y-6">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg">
          <Heart className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Moods & Genres</h1>
      </div>

      <div className="grid gap-3 justify-items-center" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
        {moods.map((m: any, i: number) => (
          <motion.button
            key={m.id || i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => navigate(`/channel/${m.id}`)}
            className="card-surface rounded-2xl overflow-hidden w-full transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl active:scale-[0.97] text-left group"
          >
            <div className="relative aspect-square overflow-hidden">
              <img src={getImg(m.image, '500x500')} alt={decodeHtml(m.name)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            </div>
            <div className="p-3">
              <p className="text-xs font-semibold text-foreground truncate">{decodeHtml(m.name || '')}</p>
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

export default MoodsPage;
