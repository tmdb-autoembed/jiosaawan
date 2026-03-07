import { usePlayer } from '@/contexts/PlayerContext';
import SongItem from '@/components/SongItem';
import MusicCard from '@/components/MusicCard';
import { Heart, HeartCrack, Bookmark, ListMusic, Sliders, Play } from 'lucide-react';

const QUALITY_OPTIONS = [
  { value: '96kbps', label: '96 kbps' },
  { value: '160kbps', label: '160 kbps' },
  { value: '320kbps', label: '320 kbps' },
];

const Profile = () => {
  const { likedSongs, savedPlaylists, playQueue, preferredQuality, setQuality } = usePlayer();

  return (
    <div className="p-4 pb-40">
      {/* Liked Songs */}
      <div className="mb-6">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
          <Heart className="w-4 h-4 text-accent" /> Liked Songs ({likedSongs.length})
        </h2>

        {likedSongs.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
            <HeartCrack className="w-10 h-10" />
            <p className="text-sm">No liked songs yet — heart a song in the player</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {likedSongs.map((s, i) => <SongItem key={s.id} song={s} songList={likedSongs} songIdx={i} />)}
            </div>
            <button
              onClick={() => playQueue([...likedSongs], 0)}
              className="mt-3 nm-surface nm-raised rounded-full px-4 py-2 text-xs font-bold text-primary flex items-center gap-1.5 active:nm-inset"
            >
              <Play className="w-3.5 h-3.5" /> Play All Liked
            </button>
          </>
        )}
      </div>

      {/* Saved Playlists */}
      <div className="mb-6">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
          <Bookmark className="w-4 h-4 text-accent2" /> Saved Playlists ({savedPlaylists.length})
        </h2>

        {savedPlaylists.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
            <ListMusic className="w-10 h-10" />
            <p className="text-sm">No saved playlists yet — save one from a playlist page</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {savedPlaylists.map(pl => <MusicCard key={pl.id} item={pl} type="playlists" />)}
          </div>
        )}
      </div>

      {/* Quality */}
      <div className="mb-6">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
          <Sliders className="w-4 h-4 text-primary" /> Audio Quality
        </h2>
        <p className="text-[11px] text-muted-foreground/60 uppercase tracking-wider mb-2">Select default streaming quality</p>
        <div className="flex gap-2">
          {QUALITY_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setQuality(value)}
              className={`px-4 py-2 rounded-full text-xs font-semibold nm-surface transition-all ${
                preferredQuality === value ? 'nm-inset text-primary' : 'nm-flat text-muted-foreground'
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
