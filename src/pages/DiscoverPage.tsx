import { useEffect, useState } from 'react';
import { getDiscover, getImg, decodeHtml } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { Compass, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const DiscoverPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getDiscover().then(res => {
      setItems(res?.data?.results || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="p-4 pb-40 space-y-6">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg">
          <Compass className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Discover</h1>
      </div>

      <div className="grid gap-3 justify-items-center" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
        {items.map((item: any, i: number) => (
          <motion.button
            key={item.id || i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => navigate(`/channel/${item.id}`)}
            className="card-surface rounded-2xl overflow-hidden w-full transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl active:scale-[0.97] text-left group"
          >
            <div className="aspect-square overflow-hidden">
              <img src={getImg(item.image, '500x500')} alt={decodeHtml(item.name)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="p-3">
              <p className="text-xs font-semibold text-foreground truncate">{decodeHtml(item.name || '')}</p>
              {item.subType && <p className="text-[10px] text-muted-foreground/60 truncate mt-0.5 capitalize">{item.subType}</p>}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default DiscoverPage;
