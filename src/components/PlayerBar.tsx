import { usePlayer } from '@/contexts/PlayerContext';
import { getImg, getArtistStr, fmtTime } from '@/lib/api';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, X } from 'lucide-react';

const PlayerBar = () => {
  const {
    currentSong, isPlaying, togglePlay, playNext, playPrev,
    currentTime, duration, seek, volume, setVolume,
    shuffle, toggleShuffle, repeat, toggleRepeat,
    setExpandedOpen, stopPlayer,
  } = usePlayer();

  if (!currentSong) return null;

  const imgUrl = getImg(currentSong.image, '150x150');
  const pct = duration ? (currentTime / duration) * 100 : 0;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const p = (e.clientX - rect.left) / rect.width;
    seek(p * (duration || 0));
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[200] glass border-t border-border/30 max-w-[600px] mx-auto">
      <div className="px-3 pt-2 pb-1">
        {/* Top row */}
        <div className="flex items-center gap-2.5 mb-1.5">
          <img
            src={imgUrl}
            alt=""
            className={`w-11 h-11 rounded-full object-cover border-2 border-background nm-flat cursor-pointer ${
              isPlaying ? 'animate-vinyl-spin' : ''
            }`}
            style={{ boxShadow: '0 0 0 2px #000, 0 6px 15px rgba(0,0,0,0.8), inset 0 2px 6px rgba(255,255,255,0.05)' }}
            onClick={() => setExpandedOpen(true)}
          />
          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => setExpandedOpen(true)}
          >
            <p className="text-sm font-bold truncate text-foreground">{currentSong.name || currentSong.title || 'Unknown'}</p>
            <p className="text-[11px] text-muted-foreground truncate">{getArtistStr(currentSong)}</p>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={toggleShuffle} className={`p-1.5 rounded-full transition-colors ${shuffle ? 'text-primary' : 'text-muted-foreground'}`}>
              <Shuffle className="w-4 h-4" />
            </button>
            <button onClick={playPrev} className="p-1.5 text-muted-foreground hover:text-foreground">
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={togglePlay}
              className={`w-11 h-11 rounded-full nm-surface nm-raised flex items-center justify-center text-primary transition-all ${
                isPlaying ? 'glow-green' : ''
              }`}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <button onClick={playNext} className="p-1.5 text-muted-foreground hover:text-foreground">
              <SkipForward className="w-4 h-4" />
            </button>
            <button onClick={toggleRepeat} className={`p-1.5 rounded-full transition-colors ${repeat ? 'text-primary' : 'text-muted-foreground'}`}>
              <Repeat className="w-4 h-4" />
            </button>
            <button onClick={stopPlayer} className="p-1.5 text-muted-foreground hover:text-accent">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="relative">
          <div
            className="w-full h-1 bg-secondary nm-inset rounded cursor-pointer"
            onClick={handleProgressClick}
          >
            <div className="h-full progress-gradient rounded" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground/60 mt-0.5">
            <span>{fmtTime(currentTime)}</span>
            <span>{fmtTime(duration)}</span>
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2 pb-1">
          <span className="text-[10px] text-muted-foreground">🔈</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="flex-1 h-1.5 appearance-none rounded bg-secondary cursor-pointer accent-primary"
          />
          <span className="text-[10px] text-muted-foreground">🔊</span>
        </div>
      </div>
    </div>
  );
};

export default PlayerBar;
