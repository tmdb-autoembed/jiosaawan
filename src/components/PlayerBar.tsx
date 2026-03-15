import { usePlayer } from '@/contexts/PlayerContext';
import { getImg, getArtistStr, fmtTime, decodeHtml } from '@/lib/api';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, X } from 'lucide-react';
import { motion, PanInfo } from 'framer-motion';
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

  // Slide down slightly to expand
  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.y < -20) {
      setExpandedOpen(true);
    }
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 z-[200] max-w-[600px] mx-auto"
    >
      {/* Progress line */}
      <div className="w-full h-[2px] bg-secondary/30 cursor-pointer" onClick={handleProgressClick}>
        <motion.div className="h-full bg-primary" style={{ width: `${pct}%` }} />
      </div>

      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.3}
        onDragEnd={handleDragEnd}
        className="bg-background/95 border-t border-border/10 px-3 pt-2.5 pb-2"
      >
        <div className="flex items-center gap-3">
          {/* Album art */}
          <div className="relative cursor-pointer" onClick={() => setExpandedOpen(true)}>
            <img
              src={imgUrl}
              alt=""
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
            <p className="text-sm font-semibold truncate text-foreground">{decodeHtml(currentSong.name || currentSong.title || 'Unknown')}</p>
            <p className="text-[11px] text-muted-foreground truncate">{getArtistStr(currentSong)}</p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-0.5">
            <button onClick={toggleShuffle} className={`p-1.5 rounded-full transition-all ${shuffle ? 'text-primary' : 'text-foreground/80'}`}>
              <Shuffle className="w-3.5 h-3.5" />
            </button>
            <button onClick={playPrev} className="p-1.5 text-foreground hover:text-foreground transition-colors">
              <SkipBack className="w-4 h-4" />
            </button>
            <motion.button
              onClick={togglePlay}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-full flex items-center justify-center text-primary-foreground bg-primary"
            >
              {isPlaying ? <Pause className="w-4.5 h-4.5" /> : <Play className="w-4.5 h-4.5 ml-0.5" />}
            </motion.button>
            <button onClick={playNext} className="p-1.5 text-foreground hover:text-foreground transition-colors">
              <SkipForward className="w-4 h-4" />
            </button>
            <button onClick={toggleRepeat} className={`p-1.5 rounded-full transition-all ${repeat ? 'text-primary' : 'text-foreground/80'}`}>
              <Repeat className="w-3.5 h-3.5" />
            </button>
            <button onClick={stopPlayer} className="p-1 text-foreground/60 hover:text-foreground transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Time */}
        <div className="flex justify-between text-[9px] text-muted-foreground/40 mt-1 px-0.5">
          <span>{fmtTime(currentTime)}</span>
          <span>{fmtTime(duration)}</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PlayerBar;
