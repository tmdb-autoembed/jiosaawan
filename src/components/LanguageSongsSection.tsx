import { useEffect, useState } from 'react';
import { searchSongs, extractResults } from '@/lib/api';
import SongItem from '@/components/SongItem';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface LanguageSongsSectionProps {
  language: string;
  emoji: string;
  icon: React.ReactNode;
  gradient: string;
}

const LanguageSongsSection = ({ language, emoji, icon, gradient }: LanguageSongsSectionProps) => {
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    searchSongs(language, 10, 1)
      .then(data => {
        const r = extractResults(data);
        setSongs(r);
        setHasMore(r.length >= 10);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [language]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const data = await searchSongs(language, 10, nextPage);
      const r = extractResults(data);
      if (r.length === 0) setHasMore(false);
      else {
        setSongs(prev => [...prev, ...r]);
        setPage(nextPage);
        setHasMore(r.length >= 10);
      }
    } catch {} finally { setLoadingMore(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  if (!songs.length) return null;

  return (
    <motion.section initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            {icon}
          </div>
          <h2 className="text-base font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            {emoji} {language} Hits
          </h2>
        </div>
      </div>

      <div className="space-y-2">
        {songs.map((song: any, i: number) => (
          <SongItem key={`${language}-${song.id}-${i}`} song={song} songList={songs} songIdx={i} />
        ))}
      </div>

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loadingMore}
          className="w-full mt-3 py-2.5 rounded-2xl text-sm font-semibold text-primary flex items-center justify-center gap-1.5 disabled:opacity-50 bg-secondary/20 hover:bg-secondary/30 transition-all"
        >
          {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : `Load More ${language} Songs`}
        </button>
      )}
    </motion.section>
  );
};

export default LanguageSongsSection;
