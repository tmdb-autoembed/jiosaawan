import { useEffect, useState, useCallback } from 'react';
import { getRadioArtists, getRadioFeatured, getImg, decodeHtml } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { Radio, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const RadioPage = () => {
  const navigate = useNavigate();
  const [stations, setStations] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getRadioArtists(undefined, 1, 20),
      getRadioFeatured(1, 10),
    ]).then(([radioRes, featRes]) => {
      const rData = radioRes?.data;
      const rItems = rData?.results || rData?.songs || (Array.isArray(rData) ? rData : []);
      setStations(rItems);
      setHasMore(rItems.length >= 20);
      setFeatured(featRes?.data?.results || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const next = page + 1;
      const res = await getRadioArtists(undefined, next, 20);
      const rData = res?.data;
      const items = rData?.results || rData?.songs || (Array.isArray(rData) ? rData : []);
      if (items.length === 0) setHasMore(false);
      else { setStations(prev => [...prev, ...items]); setPage(next); setHasMore(items.length >= 20); }
    } catch {} finally { setLoadingMore(false); }
  }, [page, hasMore, loadingMore]);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="p-4 pb-40 space-y-6">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
          <Radio className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Radio Stations</h1>
      </div>

      {featured.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">Featured</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {featured.map((s: any) => (
              <motion.button
                key={s.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => navigate(`/radio/${encodeURIComponent(s.id)}`)}
                className="card-surface rounded-2xl overflow-hidden min-w-[148px] max-w-[148px] flex-shrink-0 transition-all duration-300 hover:-translate-y-1.5 text-left group"
              >
                <div className="aspect-square overflow-hidden">
                  <img src={getImg(s.image, '500x500')} alt={decodeHtml(s.name)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="p-3">
                  <p className="text-xs font-semibold text-foreground truncate">{decodeHtml(s.name)}</p>
                  {s.description && <p className="text-[10px] text-muted-foreground/60 truncate mt-0.5">{s.description}</p>}
                </div>
              </motion.button>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-sm font-bold text-foreground mb-3">All Stations</h2>
        <div className="grid gap-3 justify-items-center" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
          {stations.map((s: any, i: number) => (
            <motion.button
              key={s.id || i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.02 }}
              onClick={() => navigate(`/radio/${encodeURIComponent(s.id)}`)}
              className="card-surface rounded-2xl overflow-hidden w-full transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl active:scale-[0.97] text-left group"
            >
              <div className="aspect-square overflow-hidden">
                <img src={getImg(s.image, '500x500')} alt={decodeHtml(s.name || '')} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="p-3">
                <p className="text-xs font-semibold text-foreground truncate">{decodeHtml(s.name || '')}</p>
                {s.language && <p className="text-[10px] text-muted-foreground/60 truncate mt-0.5">{s.language}</p>}
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {hasMore && (
        <button onClick={loadMore} disabled={loadingMore} className="w-full py-2.5 btn-3d-glass rounded-2xl text-sm font-semibold text-primary flex items-center justify-center gap-1.5 disabled:opacity-50">
          {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Load More Stations'}
        </button>
      )}
    </div>
  );
};

export default RadioPage;
