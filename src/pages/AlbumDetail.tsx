import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAlbumById, getImg } from '@/lib/api';
import { usePlayer } from '@/contexts/PlayerContext';
import SongItem from '@/components/SongItem';
import { ArrowLeft, Play, Share2, Loader2, Disc3 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const AlbumDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playQueue } = usePlayer();
  const [album, setAlbum] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getAlbumById(id).then(data => setAlbum(data.data || data)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;
  if (!album) return <div className="text-center py-16 text-muted-foreground">Album not found</div>;

  const songs = album.songs || [];
  const imgUrl = getImg(album.image, '500x500');

  return (
    <div className="p-4 pb-40">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-secondary/60 flex items-center justify-center hover:bg-secondary">
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <span className="text-sm font-bold text-foreground truncate">{album.name || 'Album'}</span>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4 items-end mb-6">
        {imgUrl && <img src={imgUrl} alt="" className="w-28 h-28 rounded-2xl object-cover shadow-xl" />}
        <div className="flex-1 min-w-0">
          <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-violet-500 to-purple-400 text-[9px] font-bold text-white">ALBUM</span>
          <h2 className="text-lg font-black text-foreground leading-tight mt-1">{album.name || 'Unknown Album'}</h2>
          <p className="text-xs text-muted-foreground mt-1">{album.primaryArtists || ''} {album.year ? `• ${album.year}` : ''}</p>
          <div className="flex gap-2 mt-3">
            {songs.length > 0 && (
              <button onClick={() => playQueue(songs, 0)} className="px-4 py-1.5 rounded-full bg-gradient-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5" /> Play All
              </button>
            )}
            <button
              onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success('Link copied!'); }}
              className="px-3 py-1.5 rounded-full bg-secondary/50 text-xs text-muted-foreground flex items-center gap-1.5 hover:bg-secondary"
            >
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
          </div>
        </div>
      </motion.div>

      {songs.length > 0 && (
        <>
          <div className="flex items-center gap-2 mb-3">
            <Disc3 className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-black text-foreground">Tracks ({songs.length})</h3>
          </div>
          <div className="space-y-1.5">
            {songs.map((s: any, i: number) => <SongItem key={s.id} song={s} songList={songs} songIdx={i} />)}
          </div>
        </>
      )}
    </div>
  );
};

export default AlbumDetail;
