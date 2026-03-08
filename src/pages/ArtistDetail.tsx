import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getArtistById, getArtistSongs, getArtistAlbums, getRelatedArtists, getImg, extractResults, extractBioText } from '@/lib/api';
import { usePlayer } from '@/contexts/PlayerContext';
import SongItem from '@/components/SongItem';
import MusicCard from '@/components/MusicCard';
import { ArrowLeft, Play, Loader2, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const ArtistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playQueue } = usePlayer();
  const [artist, setArtist] = useState<any>(null);
  const [songs, setSongs] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bioOpen, setBioOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      getArtistById(id),
      getArtistSongs(id).catch(() => null),
      getArtistAlbums(id).catch(() => null),
      getRelatedArtists(id).catch(() => null),
    ]).then(([artistRes, songsRes, albumsRes, relatedRes]) => {
      const a = artistRes?.data || artistRes;
      setArtist(a);

      let s = songsRes ? extractResults(songsRes) : [];
      if (!s.length && a?.topSongs) s = a.topSongs;
      setSongs(s);

      let al = albumsRes ? extractResults(albumsRes) : [];
      if (!al.length && a?.topAlbums) al = a.topAlbums;
      setAlbums(al);

      const rel = relatedRes?.data?.results || relatedRes?.data || [];
      setRelated(Array.isArray(rel) ? rel : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;
  if (!artist) return <div className="text-center py-16 text-muted-foreground">Artist not found</div>;

  const imgUrl = getImg(artist.image, '500x500');
  const bio = extractBioText(artist.bio);
  const followers = artist.followerCount || artist.fanCount || '';

  return (
    <div className="p-4 pb-40">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-secondary/60 flex items-center justify-center hover:bg-secondary">
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <span className="text-sm font-bold text-foreground truncate">{artist.name || 'Artist'}</span>
      </div>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center mb-6">
        <div className="relative">
          <div className="absolute inset-0 rounded-full blur-xl opacity-30" style={{ background: 'var(--gradient-primary)' }} />
          <div className="w-28 h-28 rounded-full overflow-hidden ring-3 ring-primary/30 relative">
            {imgUrl ? <img src={imgUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-secondary" />}
          </div>
        </div>
        <h2 className="text-xl font-black text-foreground mt-3">{artist.name}</h2>
        {followers && <p className="text-xs text-muted-foreground mt-1">{Number(followers).toLocaleString()} followers</p>}
      </motion.div>

      {/* Bio */}
      {bio && (
        <div className="mb-6">
          <button onClick={() => setBioOpen(!bioOpen)} className="text-sm font-bold text-foreground flex items-center justify-between w-full mb-2">
            <span>About</span>
            <span className="text-muted-foreground text-xs">{bioOpen ? '▲' : '▼'}</span>
          </button>
          {bioOpen && <div className="card-surface rounded-2xl p-4 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{bio}</div>}
        </div>
      )}

      {/* Songs */}
      {songs.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-rose-500 to-orange-400 flex items-center justify-center">
                <Play className="w-3 h-3 text-white ml-0.5" />
              </div>
              <h3 className="text-sm font-black text-foreground">Top Songs</h3>
            </div>
            <button onClick={() => playQueue(songs, 0)} className="px-3 py-1 rounded-full bg-gradient-primary text-primary-foreground text-xs font-bold flex items-center gap-1">
              <Play className="w-3 h-3" /> Play All
            </button>
          </div>
          <div className="space-y-1.5">
            {songs.map((s, i) => <SongItem key={s.id} song={s} songList={songs} songIdx={i} />)}
          </div>
        </div>
      )}

      {/* Albums */}
      {albums.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-violet-500 to-purple-400 flex items-center justify-center">
              <Loader2 className="w-3 h-3 text-white" />
            </div>
            <h3 className="text-sm font-black text-foreground">Albums</h3>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {albums.map(a => <MusicCard key={a.id} item={a} type="albums" />)}
          </div>
        </div>
      )}

      {/* Related Artists */}
      {related.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-300 flex items-center justify-center">
              <Users className="w-3 h-3 text-white" />
            </div>
            <h3 className="text-sm font-black text-foreground">Related Artists</h3>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {related.map((a: any) => <MusicCard key={a.id} item={a} type="artists" />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtistDetail;
