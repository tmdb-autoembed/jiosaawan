import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPodcastById, getImg, getAudioUrl, decodeHtml } from '@/lib/api';
import { usePlayer } from '@/contexts/PlayerContext';
import { ArrowLeft, Play, Loader2, Radio, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const PodcastDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loadAndPlay } = usePlayer();
  const [podcast, setPodcast] = useState<any>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setPage(1);
    setHasMore(true);
    getPodcastById(id, 1, 20)
      .then(res => {
        const data = res?.data || null;
        setPodcast(data);
        const eps = data?.episodes || [];
        setEpisodes(eps);
        setHasMore(eps.length >= 20);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const loadMore = useCallback(async () => {
    if (!id || loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const next = page + 1;
      const res = await getPodcastById(id, next, 20);
      const eps = res?.data?.episodes || [];
      if (eps.length === 0) { setHasMore(false); }
      else { setEpisodes(p => [...p, ...eps]); setPage(next); setHasMore(eps.length >= 20); }
    } catch {} finally { setLoadingMore(false); }
  }, [id, page, hasMore, loadingMore]);

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) loadMore(); }, { rootMargin: '300px' });
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [hasMore, loadMore]);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;
  if (!podcast) return <div className="text-center py-16 text-muted-foreground">Podcast not found</div>;

  const imgUrl = getImg(podcast.image || podcast.squareImage, '500x500');

  return (
    <div className="p-4 pb-40">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-secondary/60 flex items-center justify-center hover:bg-secondary">
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <span className="text-sm font-bold text-foreground truncate">{decodeHtml(podcast.name || 'Podcast')}</span>
      </div>

      {/* Header */}
      <div className="flex gap-4 items-end mb-6">
        {imgUrl && <img src={imgUrl} alt="" className="w-28 h-28 rounded-2xl object-cover shadow-lg" />}
        <div className="flex-1 min-w-0">
          <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-400 text-[9px] font-bold text-white">PODCAST</span>
          <h2 className="text-lg font-black text-foreground leading-tight mt-1">{decodeHtml(podcast.name)}</h2>
          <p className="text-xs text-muted-foreground mt-1">{podcast.totalEpisodes || episodes.length} episodes</p>
          {podcast.description && (
            <p className="text-[11px] text-muted-foreground/60 mt-1 line-clamp-2">{decodeHtml(podcast.description)}</p>
          )}
        </div>
      </div>

      {/* Episodes */}
      <h3 className="text-sm font-black text-foreground mb-3 flex items-center gap-2">
        <Radio className="w-4 h-4 text-accent" /> Episodes
      </h3>
      <div className="space-y-2">
        {episodes.map((ep: any, i: number) => {
          const epImg = getImg(ep.image, '150x150') || imgUrl;
          return (
            <motion.div
              key={ep.id || i}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.5) }}
              onClick={() => {
                if (ep.downloadUrl || ep.url) loadAndPlay(ep);
              }}
              className="flex items-center gap-3 p-3 card-surface rounded-2xl cursor-pointer hover:translate-x-0.5 transition-all"
            >
              {epImg && <img src={epImg} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{decodeHtml(ep.name || ep.title || `Episode ${i + 1}`)}</p>
                {ep.description && <p className="text-[11px] text-muted-foreground/60 truncate mt-0.5">{decodeHtml(ep.description)}</p>}
                {ep.duration && (
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground/40">
                    <Clock className="w-3 h-3" />
                    <span>{Math.floor(ep.duration / 60)}m</span>
                  </div>
                )}
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-400 flex items-center justify-center flex-shrink-0">
                <Play className="w-4 h-4 text-white ml-0.5" />
              </div>
            </motion.div>
          );
        })}
      </div>
      {hasMore ? (
        <div ref={sentinelRef} className="flex justify-center py-4">
          {loadingMore && <Loader2 className="w-5 h-5 text-primary animate-spin" />}
        </div>
      ) : episodes.length > 0 && (
        <p className="text-center text-xs text-muted-foreground/50 py-3 font-medium">— No more episodes —</p>
      )}
    </div>
  );
};

export default PodcastDetail;
