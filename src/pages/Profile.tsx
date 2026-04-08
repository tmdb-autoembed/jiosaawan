import { useState, useEffect } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import SongItem from '@/components/SongItem';
import MusicCard from '@/components/MusicCard';
import { Heart, HeartCrack, Bookmark, ListMusic, Sliders, Play, Users, X, Plus, Pencil, Trash2, Music, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getImg, decodeHtml } from '@/lib/api';
import { toast } from 'sonner';

const QUALITY_OPTIONS = [
  { value: '96kbps', label: '96 kbps', gradient: 'from-gray-500 to-gray-600' },
  { value: '160kbps', label: '160 kbps', gradient: 'from-blue-500 to-cyan-400' },
  { value: '320kbps', label: '320 kbps', gradient: 'from-emerald-500 to-teal-400' },
];

const Profile = () => {
  const {
    likedSongs, savedPlaylists, playQueue, preferredQuality, setQuality,
    customPlaylists, createCustomPlaylist, deleteCustomPlaylist, renameCustomPlaylist,
    removeFromCustomPlaylist,
  } = usePlayer();
  const navigate = useNavigate();
  const [favArtists, setFavArtists] = useState<any[]>([]);
  const [userName, setUserName] = useState(() => localStorage.getItem('user_name') || 'Music Lover');
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showCreatePl, setShowCreatePl] = useState(false);
  const [expandedPl, setExpandedPl] = useState<string | null>(null);

  useEffect(() => {
    try { setFavArtists(JSON.parse(localStorage.getItem('fav_artists') || '[]')); } catch {}
  }, []);

  const removeFav = (artistId: string) => {
    const updated = favArtists.filter(a => a.id !== artistId);
    setFavArtists(updated);
    localStorage.setItem('fav_artists', JSON.stringify(updated));
  };

  const saveName = () => {
    const name = tempName.trim() || 'Music Lover';
    setUserName(name);
    localStorage.setItem('user_name', name);
    setEditingName(false);
    toast.success('Name updated!');
  };

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) return;
    createCustomPlaylist(newPlaylistName.trim());
    setNewPlaylistName('');
    setShowCreatePl(false);
  };

  return (
    <div className="p-4 pb-40">
      {/* Profile Header */}
      <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl" style={{ background: 'linear-gradient(135deg, hsla(280, 40%, 15%, 0.6), hsla(340, 30%, 12%, 0.5))' }}>
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
          <User className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          {editingName ? (
            <div className="flex gap-2">
              <input
                autoFocus
                value={tempName}
                onChange={e => setTempName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveName()}
                className="flex-1 bg-secondary/50 rounded-lg px-3 py-1.5 text-sm text-white outline-none"
                placeholder="Your name"
              />
              <button onClick={saveName} className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold">Save</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white truncate">{userName}</h1>
              <button onClick={() => { setTempName(userName); setEditingName(true); }} className="text-white/50 hover:text-white">
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <p className="text-xs" style={{ color: '#ccc' }}>{likedSongs.length} liked • {customPlaylists.length} playlists</p>
        </div>
      </div>

      {/* Custom Playlists */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-400 flex items-center justify-center">
              <Music className="w-3.5 h-3.5 text-white" />
            </div>
            <h2 className="text-sm font-black text-white">My Playlists ({customPlaylists.length})</h2>
          </div>
          <button onClick={() => setShowCreatePl(!showCreatePl)} className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
            <Plus className="w-3.5 h-3.5 text-white" />
          </button>
        </div>

        {showCreatePl && (
          <div className="flex gap-2 mb-3">
            <input
              autoFocus
              value={newPlaylistName}
              onChange={e => setNewPlaylistName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreatePlaylist()}
              placeholder="Playlist name…"
              className="flex-1 bg-secondary/50 rounded-xl px-3 py-2 text-sm text-white outline-none placeholder:text-white/30"
            />
            <button onClick={handleCreatePlaylist} className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold">Create</button>
          </div>
        )}

        {customPlaylists.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 rounded-2xl" style={{ background: 'hsla(250, 18%, 12%, 0.5)' }}>
            <ListMusic className="w-10 h-10 text-white/30" />
            <p className="text-sm" style={{ color: '#ccc' }}>Create your first playlist!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {customPlaylists.map(pl => (
              <div key={pl.id} className="rounded-xl overflow-hidden" style={{ background: 'hsla(250, 18%, 12%, 0.5)' }}>
                <div
                  className="flex items-center gap-3 p-3 cursor-pointer"
                  onClick={() => setExpandedPl(expandedPl === pl.id ? null : pl.id)}
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center">
                    <Music className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{pl.name}</p>
                    <p className="text-[10px]" style={{ color: '#ccc' }}>{pl.songs.length} songs</p>
                  </div>
                  {pl.songs.length > 0 && (
                    <button onClick={(e) => { e.stopPropagation(); playQueue(pl.songs, 0); }} className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <Play className="w-3.5 h-3.5 text-white ml-0.5" />
                    </button>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); deleteCustomPlaylist(pl.id); }} className="text-white/30 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {expandedPl === pl.id && pl.songs.length > 0 && (
                  <div className="px-3 pb-3 space-y-1">
                    {pl.songs.map((s, i) => (
                      <div key={s.id} className="flex items-center gap-2">
                        <div className="flex-1 min-w-0">
                          <SongItem song={s} songList={pl.songs} songIdx={i} />
                        </div>
                        <button onClick={() => removeFromCustomPlaylist(pl.id, s.id)} className="text-white/30 hover:text-red-400 flex-shrink-0">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Liked Songs */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-pink-500 to-rose-400 flex items-center justify-center">
            <Heart className="w-3.5 h-3.5 text-white" />
          </div>
          <h2 className="text-sm font-black text-white">Liked Songs ({likedSongs.length})</h2>
        </div>

        {likedSongs.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 rounded-2xl" style={{ background: 'hsla(250, 18%, 12%, 0.5)' }}>
            <HeartCrack className="w-10 h-10 text-white/30" />
            <p className="text-sm" style={{ color: '#ccc' }}>No liked songs yet</p>
          </div>
        ) : (
          <>
            <div className="space-y-1.5">
              {likedSongs.map((s, i) => <SongItem key={s.id} song={s} songList={likedSongs} songIdx={i} />)}
            </div>
            <button
              onClick={() => playQueue([...likedSongs], 0)}
              className="mt-3 px-4 py-2 rounded-full bg-gradient-to-r from-primary to-accent text-white text-xs font-bold flex items-center gap-1.5"
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
          <h2 className="text-sm font-black text-white">Saved Playlists ({savedPlaylists.length})</h2>
        </div>

        {savedPlaylists.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 rounded-2xl" style={{ background: 'hsla(250, 18%, 12%, 0.5)' }}>
            <ListMusic className="w-10 h-10 text-white/30" />
            <p className="text-sm" style={{ color: '#ccc' }}>No saved playlists yet</p>
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
          <h2 className="text-sm font-black text-white">Favorite Artists ({favArtists.length})</h2>
        </div>

        {favArtists.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 rounded-2xl" style={{ background: 'hsla(250, 18%, 12%, 0.5)' }}>
            <Users className="w-10 h-10 text-white/30" />
            <p className="text-sm" style={{ color: '#ccc' }}>No favorite artists yet</p>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {favArtists.map(a => (
              <div key={a.id} className="flex-shrink-0 flex flex-col items-center gap-1.5 relative group" onClick={() => navigate(`/artist/${a.id}`)}>
                <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-primary/30">
                  <img src={getImg(a.image, '150x150')} alt="" className="w-full h-full object-cover" />
                </div>
                <span className="text-[10px] font-bold text-white text-center w-16 truncate">{decodeHtml(a.name || '')}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); removeFav(a.id); }}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
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
          <h2 className="text-sm font-black text-white">Audio Quality</h2>
        </div>
        <div className="flex gap-2">
          {QUALITY_OPTIONS.map(({ value, label, gradient }) => (
            <button
              key={value}
              onClick={() => setQuality(value)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                preferredQuality === value
                  ? `bg-gradient-to-r ${gradient} text-white shadow-lg`
                  : 'text-white/50 hover:text-white'
              }`}
              style={preferredQuality !== value ? { background: 'hsla(250, 18%, 16%, 0.5)' } : undefined}
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
