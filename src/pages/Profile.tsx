import { useState, useEffect } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import SongItem from '@/components/SongItem';
import MusicCard from '@/components/MusicCard';
import { Heart, HeartCrack, Bookmark, ListMusic, Sliders, Play, Users, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getImg, decodeHtml } from '@/lib/api';

const QUALITY_OPTIONS = [
  { value: '96kbps', label: '96 kbps', gradient: 'from-gray-500 to-gray-600' },
  { value: '160kbps', label: '160 kbps', gradient: 'from-blue-500 to-cyan-400' },
  { value: '320kbps', label: '320 kbps', gradient: 'from-emerald-500 to-teal-400' },
];

const Profile = () => {
  const { likedSongs, savedPlaylists, playQueue, preferredQuality, setQuality } = usePlayer();
  const navigate = useNavigate();
  const [favArtists, setFavArtists] = useState<any[]>([]);

  useEffect(() => {
    try { setFavArtists(JSON.parse(localStorage.getItem('fav_artists') || '[]')); } catch {}
  }, []);

  const removeFav = (artistId: string) => {
    const updated = favArtists.filter(a => a.id !== artistId);
    setFavArtists(updated);
    localStorage.setItem('fav_artists', JSON.stringify(updated));
  };

  return (
    <div className="p-4 pb-40">
      {/* Liked Songs */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-pink-500 to-rose-400 flex items-center justify-center">
            <Heart className="w-3.5 h-3.5 text-white" />
          </div>
          <h2 className="text-sm font-black text-foreground">Liked Songs ({likedSongs.length})</h2>
        </div>

        {likedSongs.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground card-surface rounded-2xl">
            <HeartCrack className="w-10 h-10 opacity-50" />
            <p className="text-sm">No liked songs yet</p>
          </div>
        ) : (
          <>
            <div className="space-y-1.5">
              {likedSongs.map((s, i) => <SongItem key={s.id} song={s} songList={likedSongs} songIdx={i} />)}
            </div>
            <button
              onClick={() => playQueue([...likedSongs], 0)}
              className="mt-3 px-4 py-2 rounded-full bg-gradient-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" /> Play All Liked
            </button>
          </>
        )}
      </div>

      {/* Saved Playlists */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-300 flex items-center justify-center">
            <Bookmark className="w-3.5 h-3.5 text-white" />
          </div>
          <h2 className="text-sm font-black text-foreground">Saved Playlists ({savedPlaylists.length})</h2>
        </div>

        {savedPlaylists.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground card-surface rounded-2xl">
            <ListMusic className="w-10 h-10 opacity-50" />
            <p className="text-sm">No saved playlists yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {savedPlaylists.map(pl => <MusicCard key={pl.id} item={pl} type="playlists" />)}
          </div>
        )}
      </div>

      {/* Favorite Artists */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-fuchsia-500 to-purple-500 flex items-center justify-center">
            <Users className="w-3.5 h-3.5 text-white" />
          </div>
          <h2 className="text-sm font-black text-foreground">Favorite Artists ({favArtists.length})</h2>
        </div>

        {favArtists.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground card-surface rounded-2xl">
            <Users className="w-10 h-10 opacity-50" />
            <p className="text-sm">No favorite artists yet</p>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {favArtists.map(a => (
              <div key={a.id} className="flex-shrink-0 flex flex-col items-center gap-1.5 relative group" onClick={() => navigate(`/artist/${a.id}`)}>
                <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-primary/30">
                  <img src={getImg(a.image, '150x150')} alt="" className="w-full h-full object-cover" />
                </div>
                <span className="text-[10px] font-bold text-foreground text-center w-16 truncate">{decodeHtml(a.name || '')}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); removeFav(a.id); }}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Quality */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-violet-500 to-purple-400 flex items-center justify-center">
            <Sliders className="w-3.5 h-3.5 text-white" />
          </div>
          <h2 className="text-sm font-black text-foreground">Audio Quality</h2>
        </div>
        <div className="flex gap-2">
          {QUALITY_OPTIONS.map(({ value, label, gradient }) => (
            <button
              key={value}
              onClick={() => setQuality(value)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                preferredQuality === value
                  ? `bg-gradient-to-r ${gradient} text-white shadow-lg`
                  : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
