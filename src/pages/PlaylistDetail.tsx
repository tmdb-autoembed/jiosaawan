import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPlaylistById, getImg } from '@/lib/api';
import { usePlayer } from '@/contexts/PlayerContext';
import SongItem from '@/components/SongItem';
import { ArrowLeft, Play, Share2, Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const PlaylistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playQueue, savePlaylist, unsavePlaylist, isPlaylistSaved } = usePlayer();
  const [playlist, setPlaylist] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getPlaylistById(id).then(data => {
      setPlaylist(data.data || data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;
  if (!playlist) return <div className="text-center py-16 text-muted-foreground">Playlist not found</div>;

  const songs = playlist.songs || [];
  const imgUrl = getImg(playlist.image, '500x500');
  const saved = isPlaylistSaved(playlist.id);

  return (
    <div className="p-4 pb-40">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full nm-surface nm-raised flex items-center justify-center active:nm-inset">
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <span className="text-sm font-semibold text-foreground truncate">{playlist.name || 'Playlist'}</span>
      </div>

      {/* Header */}
      <div className="flex gap-4 items-end mb-5">
        {imgUrl && (
          <img src={imgUrl} alt="" className="w-28 h-28 rounded-xl object-cover nm-raised" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-primary font-bold mb-1">Playlist</p>
          <h2 className="text-lg font-extrabold text-foreground leading-tight">{playlist.name || 'Unknown'}</h2>
          <p className="text-xs text-muted-foreground mt-1">{playlist.songCount || songs.length} songs</p>
          <div className="flex gap-2 mt-3 flex-wrap">
            {songs.length > 0 && (
              <button
                onClick={() => playQueue(songs, 0)}
                className="nm-surface nm-raised rounded-full px-4 py-1.5 text-xs font-bold text-primary flex items-center gap-1.5 active:nm-inset"
              >
                <Play className="w-3.5 h-3.5" /> Play All
              </button>
            )}
            <button
              onClick={() => saved ? unsavePlaylist(playlist.id) : savePlaylist(playlist)}
              className={`nm-surface nm-flat rounded-full px-3 py-1.5 text-xs flex items-center gap-1.5 active:nm-inset ${saved ? 'text-accent2' : 'text-muted-foreground'}`}
            >
              {saved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              {saved ? 'Saved' : 'Save'}
            </button>
            <button
              onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success('Link copied!'); }}
              className="nm-surface nm-flat rounded-full px-3 py-1.5 text-xs text-muted-foreground flex items-center gap-1.5 active:nm-inset"
            >
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
          </div>
        </div>
      </div>

      {/* Tracks */}
      {songs.length > 0 ? (
        <div className="space-y-2">
          {songs.map((s: any, i: number) => <SongItem key={s.id} song={s} songList={songs} songIdx={i} />)}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground text-sm">No songs in this playlist</div>
      )}
    </div>
  );
};

export default PlaylistDetail;
