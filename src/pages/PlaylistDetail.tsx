import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPlaylistById, getImg, decodeHtml } from '@/lib/api';
import { usePlayer } from '@/contexts/PlayerContext';
import SongItem from '@/components/SongItem';
import { ArrowLeft, Play, Share2, Bookmark, BookmarkCheck, Loader2, ListMusic } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const PlaylistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playQueue, savePlaylist, unsavePlaylist, isPlaylistSaved } = usePlayer();
  const [playlist, setPlaylist] = useState<any>(null);
  const [songs, setSongs] = useState<any[]>([]);
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
    getPlaylistById(id, 1, 50).then(data => {
      const pl = data.data || data;
      setPlaylist(pl);
      const s = pl.songs || [];
      setSongs(s);
      setHasMore(s.length >= 50);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const loadMore = useCallback(async () => {
    if (!id || loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const next = page + 1;
      const data = await getPlaylistById(id, next, 50);
      const pl = data.data || data;
      const newSongs = pl.songs || [];
      if (newSongs.length === 0) { setHasMore(false); }
      else { setSongs(p => [...p, ...newSongs]); setPage(next); setHasMore(newSongs.length >= 50); }
    } catch {} finally { setLoadingMore(false); }
  }, [id, page, hasMore, loadingMore]);

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) loadMore(); }, { rootMargin: '300px' });
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [hasMore, loadMore]);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;
  if (!playlist) return <div className="text-center py-16 text-muted-foreground">Playlist not found</div>;

  const imgUrl = getImg(playlist.image, '500x500');
  const saved = isPlaylistSaved(playlist.id);

  return (
    <div className="p-4 pb-40">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-secondary/60 flex items-center justify-center hover:bg-secondary">
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <span className="text-sm font-bold text-foreground truncate">{decodeHtml(playlist.name || 'Playlist')}</span>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4 items-end mb-6">
        {imgUrl && <img src={imgUrl} alt="" className="w-28 h-28 rounded-2xl object-cover shadow-xl" />}
        <div className="flex-1 min-w-0">
          <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-[9px] font-bold text-white">PLAYLIST</span>
          <h2 className="text-lg font-black text-foreground leading-tight mt-1">{decodeHtml(playlist.name || 'Unknown')}</h2>
          <p className="text-xs text-muted-foreground mt-1">{playlist.songCount || songs.length} songs</p>
          <div className="flex gap-2 mt-3 flex-wrap">
            {songs.length > 0 && (
              <button onClick={() => playQueue(songs, 0)} className="px-4 py-1.5 rounded-full bg-gradient-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5" /> Play All
              </button>
            )}
            <button
              onClick={() => saved ? unsavePlaylist(playlist.id) : savePlaylist(playlist)}
              className={`px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5 font-bold ${saved ? 'bg-gradient-gold text-white' : 'bg-secondary/50 text-muted-foreground'}`}
            >
              {saved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              {saved ? 'Saved' : 'Save'}
            </button>
            <button
              onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success('Link copied!'); }}
              className="px-3 py-1.5 rounded-full bg-secondary/50 text-xs text-muted-foreground flex items-center gap-1.5 hover:bg-secondary"
            >
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
          </div>
        </div>
      </motion.div>

      {songs.length > 0 ? (
        <>
          <div className="flex items-center gap-2 mb-3">
            <ListMusic className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-black text-foreground">Songs</h3>
          </div>
          <div className="space-y-1.5">
            {songs.map((s: any, i: number) => <SongItem key={`${s.id}-${i}`} song={s} songList={songs} songIdx={i} />)}
          </div>
          {hasMore ? (
            <div ref={sentinelRef} className="flex justify-center py-3">
              {loadingMore && <Loader2 className="w-5 h-5 text-primary animate-spin" />}
            </div>
          ) : (
            <p className="text-center text-xs text-muted-foreground/50 py-3 font-medium">— No more songs —</p>
          )}
        </>
      ) : (
        <div className="text-center py-8 text-muted-foreground text-sm">No songs in this playlist</div>
      )}
    </div>
  );
};

export default PlaylistDetail;
