import { useMusicContext } from '@/contexts/MusicContext';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Music, ListMusic, Heart, Clock } from 'lucide-react';

const avatars = ['🎵', '🎸', '🎹', '🎤', '🎧', '🎺', '🎻', '🥁'];

const Profile = () => {
  const { profile, updateProfile, tracks, playlists, favorites } = useMusicContext();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.name);

  const stats = [
    { icon: Music, label: 'Tracks', value: tracks.length, gradient: 'gradient-primary' },
    { icon: ListMusic, label: 'Playlists', value: playlists.length, gradient: 'gradient-cool' },
    { icon: Heart, label: 'Favorites', value: favorites.length, gradient: 'gradient-accent' },
    { icon: Clock, label: 'Listened', value: `${profile.totalListened}m`, gradient: 'gradient-warm' },
  ];

  return (
    <div className="pb-36 min-h-screen px-4 pt-6">
      <h1 className="text-2xl font-bold text-gradient-primary mb-8">Profile</h1>

      {/* Avatar */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center"
      >
        <div className="w-28 h-28 rounded-full gradient-primary glow-primary flex items-center justify-center text-5xl mb-4">
          {profile.avatar}
        </div>

        {editing ? (
          <div className="flex gap-2 items-center mb-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-muted border-border text-foreground text-center w-48"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  updateProfile({ name });
                  setEditing(false);
                }
              }}
            />
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="text-xl font-bold text-foreground hover:text-primary transition-colors">
            {profile.name}
          </button>
        )}
        <p className="text-sm text-muted-foreground">{profile.favoriteGenre}</p>
      </motion.div>

      {/* Avatar picker */}
      <div className="flex justify-center gap-2 mt-4">
        {avatars.map((a) => (
          <button
            key={a}
            onClick={() => updateProfile({ avatar: a })}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all ${
              profile.avatar === a ? 'bg-primary/20 ring-2 ring-primary scale-110' : 'bg-muted hover:bg-muted/80'
            }`}
          >
            {a}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mt-8">
        {stats.map(({ icon: Icon, label, value, gradient }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl bg-card border border-border p-4 flex items-center gap-3"
          >
            <div className={`w-10 h-10 rounded-xl ${gradient} flex items-center justify-center`}>
              <Icon className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Genre selector */}
      <div className="mt-8">
        <h3 className="text-sm font-semibold text-foreground mb-3">Favorite Genre</h3>
        <div className="flex flex-wrap gap-2">
          {['All Genres', 'Pop', 'Rock', 'Hip Hop', 'Electronic', 'Jazz', 'Classical', 'R&B', 'Bollywood', 'Punjabi'].map((g) => (
            <button
              key={g}
              onClick={() => updateProfile({ favoriteGenre: g })}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                profile.favoriteGenre === g
                  ? 'gradient-primary text-primary-foreground glow-primary'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
