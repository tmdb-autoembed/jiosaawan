import { usePlayer } from '@/contexts/PlayerContext';
import { getImg, getArtistStr, fmtTime } from '@/lib/api';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, X } from 'lucide-react';
import { motion } from 'framer-motion';
import WaveBars from './WaveBars';

const PlayerBar = () => {
  const {
    currentSong, isPlaying, togglePlay, playNext, playPrev,
    currentTime, duration, seek,
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
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 z-[200] max-w-[600px] mx-auto"
    >
      {/* Progress line at top */}
      <div className="w-full h-[2px] bg-secondary/30 cursor-pointer" onClick={handleProgressClick}>
        <motion.div className="h-full progress-gradient" style={{ width: `${pct}%` }} />
      </div>

      <div className="glass-vibrant px-3 pt-2.5 pb-2">
        <div className="flex items-center gap-3">
          {/* Album art */}
          <div className="relative cursor-pointer" onClick={() => setExpandedOpen(true)}>
            <motion.img
              src={imgUrl}
              alt=""
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
            />
            {isPlaying && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 scale-50">
                <WaveBars />
              </div>
            )}
          </div>

          {/* Song info */}
          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpandedOpen(true)}>
            <p className="text-sm font-semibold truncate text-foreground">{currentSong.name || currentSong.title || 'Unknown'}</p>
            <p className="text-[11px] text-muted-foreground truncate">{getArtistStr(currentSong)}</p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-0.5">
            <button onClick={toggleShuffle} className={`p-1.5 rounded-full transition-all ${shuffle ? 'text-accent3' : 'text-foreground/50'}`}>
              <Shuffle className="w-3.5 h-3.5" />
            </button>
            <button onClick={playPrev} className="p-1.5 text-foreground/70 hover:text-foreground transition-colors">
              <SkipBack className="w-4 h-4" />
            </button>
            <motion.button
              onClick={togglePlay}
              whileTap={{ scale: 0.9 }}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-primary-foreground ${isPlaying ? 'animate-play-pulse' : ''}`}
              style={{ background: 'var(--gradient-primary)' }}
            >
              {isPlaying ? <Pause className="w-4.5 h-4.5" /> : <Play className="w-4.5 h-4.5 ml-0.5" />}
            </motion.button>
            <button onClick={playNext} className="p-1.5 text-foreground/70 hover:text-foreground transition-colors">
              <SkipForward className="w-4 h-4" />
            </button>
            <button onClick={toggleRepeat} className={`p-1.5 rounded-full transition-all ${repeat ? 'text-accent2' : 'text-muted-foreground/60'}`}>
              <Repeat className="w-3.5 h-3.5" />
            </button>
            <button onClick={stopPlayer} className="p-1 text-muted-foreground/40 hover:text-accent transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Time */}
        <div className="flex justify-between text-[9px] text-muted-foreground/40 mt-1 px-0.5">
          <span>{fmtTime(currentTime)}</span>
          <span>{fmtTime(duration)}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default PlayerBar;
