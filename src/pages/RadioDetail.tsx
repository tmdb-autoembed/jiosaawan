import { useEffect, useState, useCallback } from 'react';
import { getRadioArtists, getImg, decodeHtml } from '@/lib/api';
import { useParams, useNavigate } from 'react-router-dom';
import SongItem from '@/components/SongItem';
import { usePlayer } from '@/contexts/PlayerContext';
import { ArrowLeft, Play, Radio, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const RadioDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playQueue } = usePlayer();
  const [station, setStation] = useState<any>(null);
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getRadioArtists(id, 1, 20).then(res => {
      const data = res?.data;
      if (data) {
        setStation(data);
        const s = data.songs || data.results || data.stationSongs || [];
        setSongs(Array.isArray(s) ? s : []);
        setHasMore((data.songs || data.results || data.stationSongs || []).length >= 20);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !id) return;
    setLoadingMore(true);
    try {
      const next = page + 1;
      const res = await getRadioArtists(id, next, 20);
      const data = res?.data;
      const s = data?.songs || data?.results || data?.stationSongs || [];
      if (s.length === 0) setHasMore(false);
      else { setSongs(prev => [...prev, ...s]); setPage(next); setHasMore(s.length >= 20); }
    } catch {} finally { setLoadingMore(false); }
  }, [page, hasMore, loadingMore, id]);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!station) return <p className="text-center text-muted-foreground py-10">Station not found</p>;

  const imgUrl = getImg(station.image, '500x500');

  return (
    <div className="p-4 pb-40 space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center gap-4">
        {imgUrl && <img src={imgUrl} alt={decodeHtml(station.name || '')} className="w-40 h-40 rounded-2xl object-cover shadow-xl" />}
        <div>
          <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{decodeHtml(station.name || 'Radio')}</h1>
          {station.description && <p className="text-sm text-muted-foreground mt-1">{decodeHtml(station.description)}</p>}
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <Radio className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs text-muted-foreground">Radio Station</span>
          </div>
        </div>

        {songs.length > 0 && (
          <button onClick={() => playQueue(songs, 0)} className="flex items-center gap-2 px-6 py-2.5 btn-3d-primary rounded-2xl text-sm font-semibold text-primary-foreground">
            <Play className="w-4 h-4" /> Play All
          </button>
        )}
      </motion.div>

      {songs.length > 0 && (
        <div className="space-y-2">
          {songs.map((song: any, i: number) => (
            <SongItem key={`${song.id}-${i}`} song={song} songList={songs} songIdx={i} />
          ))}
        </div>
      )}

      {hasMore && (
        <button onClick={loadMore} disabled={loadingMore} className="w-full py-2.5 btn-3d-glass rounded-2xl text-sm font-semibold text-primary flex items-center justify-center gap-1.5 disabled:opacity-50">
          {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Load More'}
        </button>
      )}
    </div>
  );
};

export default RadioDetail;
