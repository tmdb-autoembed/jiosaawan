import { useEffect, useState, useCallback } from 'react';
import { getCharts, getImg, decodeHtml } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const ChartsPage = () => {
  const navigate = useNavigate();
  const [charts, setCharts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setLoading(true);
    getCharts(1, 20).then(res => {
      const items = res?.data?.results || [];
      setCharts(items);
      setHasMore(res?.data?.hasMore ?? items.length >= 20);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const next = page + 1;
      const res = await getCharts(next, 20);
      const items = res?.data?.results || [];
      if (items.length === 0) setHasMore(false);
      else {
        setCharts(prev => [...prev, ...items]);
        setPage(next);
        setHasMore(res?.data?.hasMore ?? items.length >= 20);
      }
    } catch {} finally { setLoadingMore(false); }
  }, [page, hasMore, loadingMore]);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="p-4 pb-40 space-y-6">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Top Charts</h1>
      </div>

      <div className="grid gap-3 justify-items-center" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
        {charts.map((chart: any, i: number) => (
          <motion.button
            key={chart.id || i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => navigate(`/playlist/${chart.id}`)}
            className="card-surface rounded-2xl overflow-hidden w-full transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl active:scale-[0.97] text-left group"
          >
            <div className="relative aspect-square overflow-hidden">
              <img src={getImg(chart.image, '500x500')} alt={decodeHtml(chart.name)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              {chart.songCount && <span className="absolute bottom-2 right-2 text-[10px] font-bold text-white/80 bg-black/40 px-1.5 py-0.5 rounded-lg">{chart.songCount} songs</span>}
            </div>
            <div className="p-3">
              <p className="text-xs font-semibold text-foreground truncate">{decodeHtml(chart.name || '')}</p>
              {chart.subtitle && <p className="text-[10px] text-muted-foreground/60 truncate mt-0.5">{chart.subtitle}</p>}
            </div>
          </motion.button>
        ))}
      </div>

      {hasMore && (
        <button onClick={loadMore} disabled={loadingMore} className="w-full py-2.5 btn-3d-glass rounded-2xl text-sm font-semibold text-primary flex items-center justify-center gap-1.5 disabled:opacity-50">
          {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Load More Charts'}
        </button>
      )}
    </div>
  );
};

export default ChartsPage;
