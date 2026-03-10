import { useEffect, useState } from 'react';
import { getChannelById, getImg, decodeHtml } from '@/lib/api';
import { useParams, useNavigate } from 'react-router-dom';
import MusicCard from '@/components/MusicCard';
import SongItem from '@/components/SongItem';
import { usePlayer } from '@/contexts/PlayerContext';
import { ArrowLeft, Play, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const ChannelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playQueue } = usePlayer();
  const [channel, setChannel] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getChannelById(id).then(res => {
      if (res?.data) setChannel(res.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!channel) return <p className="text-center text-muted-foreground py-10">Channel not found</p>;

  const imgUrl = getImg(channel.image, '500x500');
  const songs = channel.songs || channel.topSongs || [];
  const playlists = channel.playlists || channel.featuredPlaylists || [];
  const albums = channel.albums || [];

  return (
    <div className="p-4 pb-40 space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center gap-4">
        {imgUrl && <img src={imgUrl} alt={decodeHtml(channel.name)} className="w-40 h-40 rounded-2xl object-cover shadow-xl" />}
        <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{decodeHtml(channel.name || '')}</h1>
        {channel.description && <p className="text-sm text-muted-foreground">{decodeHtml(channel.description)}</p>}
        {songs.length > 0 && (
          <button onClick={() => playQueue(songs, 0)} className="flex items-center gap-2 px-6 py-2.5 btn-3d-primary rounded-2xl text-sm font-semibold text-primary-foreground">
            <Play className="w-4 h-4" /> Play All
          </button>
        )}
      </motion.div>

      {songs.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-foreground mb-3">Songs</h2>
          <div className="space-y-2">
            {songs.map((s: any, i: number) => (
              <SongItem key={`${s.id}-${i}`} song={s} songList={songs} songIdx={i} />
            ))}
          </div>
        </section>
      )}

      {playlists.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-foreground mb-3">Playlists</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {playlists.map((p: any) => (
              <div key={p.id} onClick={() => navigate(`/playlist/${p.id}`)} className="flex-shrink-0">
                <MusicCard item={p} type="playlists" />
              </div>
            ))}
          </div>
        </section>
      )}

      {albums.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-foreground mb-3">Albums</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {albums.map((a: any) => (
              <div key={a.id} onClick={() => navigate(`/album/${a.id}`)} className="flex-shrink-0">
                <MusicCard item={a} type="albums" />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ChannelDetail;
