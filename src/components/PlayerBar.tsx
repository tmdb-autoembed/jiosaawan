import { useMusicContext } from '@/contexts/MusicContext';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1, Volume2, Heart } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { motion } from 'framer-motion';

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

const PlayerBar = () => {
  const {
    currentTrack, isPlaying, togglePlay, next, previous,
    currentTime, duration, seek, volume, setVolume,
    shuffle, toggleShuffle, repeat, toggleRepeat,
    favorites, toggleFavorite,
  } = useMusicContext();

  if (!currentTrack) return null;

  const isFav = favorites.includes(currentTrack.id);

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border"
    >
      <div className="max-w-screen-xl mx-auto px-4 py-3">
        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-muted-foreground w-10 text-right">{formatTime(currentTime)}</span>
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={([v]) => seek(v)}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground w-10">{formatTime(duration)}</span>
        </div>

        <div className="flex items-center justify-between">
          {/* Track info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`w-10 h-10 rounded-lg ${currentTrack.coverGradient} flex-shrink-0`} />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate text-foreground">{currentTrack.title}</p>
              <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
            </div>
            <button onClick={() => toggleFavorite(currentTrack.id)} className="flex-shrink-0">
              <Heart className={`w-4 h-4 ${isFav ? 'fill-accent text-accent' : 'text-muted-foreground'}`} />
            </button>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button onClick={toggleShuffle} className={shuffle ? 'text-primary' : 'text-muted-foreground'}>
              <Shuffle className="w-4 h-4" />
            </button>
            <button onClick={previous} className="text-foreground hover:text-primary transition-colors">
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center glow-primary hover:scale-105 transition-transform"
            >
              {isPlaying ? <Pause className="w-5 h-5 text-primary-foreground" /> : <Play className="w-5 h-5 text-primary-foreground ml-0.5" />}
            </button>
            <button onClick={next} className="text-foreground hover:text-primary transition-colors">
              <SkipForward className="w-5 h-5" />
            </button>
            <button onClick={toggleRepeat} className={repeat !== 'off' ? 'text-primary' : 'text-muted-foreground'}>
              {repeat === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2 flex-1 justify-end">
            <Volume2 className="w-4 h-4 text-muted-foreground" />
            <Slider
              value={[volume * 100]}
              max={100}
              step={1}
              onValueChange={([v]) => setVolume(v / 100)}
              className="w-24"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PlayerBar;
