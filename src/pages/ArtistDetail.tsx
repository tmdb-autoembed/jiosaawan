import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getArtistById, getArtistSongs, getArtistAlbums, getImg, extractResults, extractBioText } from '@/lib/api';
import { usePlayer } from '@/contexts/PlayerContext';
import SongItem from '@/components/SongItem';
import MusicCard from '@/components/MusicCard';
import { ArrowLeft, Play, Loader2 } from 'lucide-react';

const ArtistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playQueue } = usePlayer();
  const [artist, setArtist] = useState<any>(null);
  const [songs, setSongs] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bioOpen, setBioOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      getArtistById(id),
      getArtistSongs(id).catch(() => null),
      getArtistAlbums(id).catch(() => null),
    ]).then(([artistRes, songsRes, albumsRes]) => {
      const a = artistRes?.data || artistRes;
      setArtist(a);

      let s = songsRes ? extractResults(songsRes) : [];
      if (!s.length && a?.topSongs) s = a.topSongs;
      setSongs(s);

      let al = albumsRes ? extractResults(albumsRes) : [];
      if (!al.length && a?.topAlbums) al = a.topAlbums;
      setAlbums(al);
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
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full nm-surface nm-raised flex items-center justify-center active:nm-inset">
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <span className="text-sm font-semibold text-foreground truncate">{artist.name || 'Artist'}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-32 h-32 rounded-full nm-raised overflow-hidden mb-3">
          {imgUrl ? <img src={imgUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-secondary" />}
        </div>
        <h2 className="text-xl font-extrabold text-foreground">{artist.name}</h2>
        {followers && <p className="text-xs text-muted-foreground mt-1">{Number(followers).toLocaleString()} followers</p>}
      </div>

      {/* Bio */}
      {bio && (
        <div className="mb-6">
          <button
            onClick={() => setBioOpen(!bioOpen)}
            className="text-sm font-bold text-foreground flex items-center justify-between w-full mb-2"
          >
            <span>About</span>
            <span className="text-muted-foreground text-xs">{bioOpen ? '▲' : '▼'}</span>
          </button>
          {bioOpen && (
            <div className="nm-surface nm-inset rounded-lg p-3 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {bio}
            </div>
          )}
        </div>
      )}

      {/* Songs */}
      {songs.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-foreground">🎵 Top Songs</h3>
            {songs.length > 0 && (
              <button
                onClick={() => playQueue(songs, 0)}
                className="nm-surface nm-raised rounded-full px-3 py-1 text-xs font-bold text-primary flex items-center gap-1 active:nm-inset"
              >
                <Play className="w-3 h-3" /> Play All
              </button>
            )}
          </div>
          <div className="space-y-2">
            {songs.map((s, i) => <SongItem key={s.id} song={s} songList={songs} songIdx={i} />)}
          </div>
        </div>
      )}

      {/* Albums */}
      {albums.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold text-foreground mb-3">💿 Albums</h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {albums.map(a => <MusicCard key={a.id} item={a} type="albums" />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtistDetail;
