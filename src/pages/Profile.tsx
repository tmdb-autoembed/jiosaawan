import { useState, useEffect, useRef } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import SongItem from '@/components/SongItem';
import MusicCard from '@/components/MusicCard';
import { Heart, HeartCrack, Bookmark, ListMusic, Sliders, Play, Users, X, Plus, Pencil, Trash2, Music, User, Camera, AlertTriangle } from 'lucide-react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [favArtists, setFavArtists] = useState<any[]>([]);
  const [userName, setUserName] = useState(() => localStorage.getItem('user_name') || 'Music Lover');
  const [profilePic, setProfilePic] = useState(() => localStorage.getItem('user_profile_pic') || '');
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showCreatePl, setShowCreatePl] = useState(false);
  const [expandedPl, setExpandedPl] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

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

  const handleProfilePic = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      toast.error('Image too large (max 500KB)');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setProfilePic(dataUrl);
      localStorage.setItem('user_profile_pic', dataUrl);
      toast.success('Profile pic updated!');
    };
    reader.readAsDataURL(file);
  };

  const handleClearAll = () => {
    localStorage.clear();
    setUserName('Music Lover');
    setProfilePic('');
    setFavArtists([]);
    setShowClearConfirm(false);
    toast.success('All data cleared! Reload to reset fully.');
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <div className="p-4 pb-40">
      {/* Profile Header */}
      <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl" style={{ background: 'linear-gradient(135deg, hsla(280, 40%, 15%, 0.6), hsla(340, 30%, 12%, 0.5))' }}>
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            {profilePic ? (
              <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-white" />
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center ring-2 ring-background"
          >
            <Camera className="w-3 h-3 text-white" />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleProfilePic} />
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

      {/* Clear All Data */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
            <Trash2 className="w-3.5 h-3.5 text-white" />
          </div>
          <h2 className="text-sm font-black text-white">Clear All Data</h2>
        </div>
        {!showClearConfirm ? (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-colors"
          >
            Clear all saved data
          </button>
        ) : (
          <div className="p-3 rounded-xl border border-red-500/30" style={{ background: 'hsla(0, 50%, 15%, 0.4)' }}>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <p className="text-xs text-red-400 font-bold">This will delete everything!</p>
            </div>
            <p className="text-[11px] mb-3" style={{ color: '#ccc' }}>Liked songs, playlists, profile pic, name — sab clear ho jayega.</p>
            <div className="flex gap-2">
              <button onClick={handleClearAll} className="px-4 py-2 rounded-xl bg-red-500 text-white text-xs font-bold">Yes, Clear All</button>
              <button onClick={() => setShowClearConfirm(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-white/50 hover:text-white" style={{ background: 'hsla(250, 18%, 16%, 0.5)' }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;