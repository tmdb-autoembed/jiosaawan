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
