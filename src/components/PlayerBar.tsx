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
      {/* Gradient border */}
      <div className="h-[2px] w-full" style={{ background: 'linear-gradient(90deg, hsl(280, 100%, 65%), hsl(320, 100%, 60%), hsl(200, 100%, 60%))' }} />
      
      <div className="glass-colorful px-3 pt-2 pb-1">
        {/* Top row */}
        <div className="flex items-center gap-2.5 mb-1.5">
          {/* Album art */}
          <div 
            className="relative cursor-pointer"
            onClick={() => setExpandedOpen(true)}
          >
            <div className={`absolute inset-0 rounded-full blur-md opacity-60 ${isPlaying ? 'animate-pulse' : ''}`}
              style={{ background: 'linear-gradient(135deg, hsl(280, 100%, 50%), hsl(320, 100%, 50%))' }}
            />
            <motion.img
              src={imgUrl}
              alt=""
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="relative w-11 h-11 rounded-full object-cover border-2 border-white/20"
            />
            {isPlaying && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 scale-50">
                <WaveBars />
              </div>
            )}
          </div>
          
          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => setExpandedOpen(true)}
          >
            <p className="text-sm font-bold truncate text-foreground">{currentSong.name || currentSong.title || 'Unknown'}</p>
            <p className="text-[11px] text-muted-foreground truncate">{getArtistStr(currentSong)}</p>
          </div>
          
          <div className="flex items-center gap-0.5">
            <button 
              onClick={toggleShuffle} 
              className={`p-1.5 rounded-full transition-all ${shuffle ? 'text-violet-400' : 'text-muted-foreground'}`}
            >
              <Shuffle className="w-4 h-4" />
            </button>
            <button onClick={playPrev} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
              <SkipBack className="w-4 h-4" />
            </button>
            <motion.button
              onClick={togglePlay}
              whileTap={{ scale: 0.9 }}
              className={`w-11 h-11 rounded-full flex items-center justify-center text-white transition-all ${
                isPlaying ? 'shadow-lg shadow-violet-500/30' : ''
              }`}
              style={{ background: 'linear-gradient(135deg, hsl(280, 100%, 60%), hsl(320, 100%, 55%))' }}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </motion.button>
            <button onClick={playNext} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
              <SkipForward className="w-4 h-4" />
            </button>
            <button 
              onClick={toggleRepeat} 
              className={`p-1.5 rounded-full transition-all ${repeat ? 'text-cyan-400' : 'text-muted-foreground'}`}
            >
              <Repeat className="w-4 h-4" />
            </button>
            <button onClick={stopPlayer} className="p-1.5 text-muted-foreground hover:text-rose-400 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="relative">
          <div
            className="w-full h-1.5 bg-white/10 rounded-full cursor-pointer overflow-hidden"
            onClick={handleProgressClick}
          >
            <motion.div 
              className="h-full rounded-full"
              style={{ 
                width: `${pct}%`,
                background: 'linear-gradient(90deg, hsl(280, 100%, 65%), hsl(320, 100%, 60%), hsl(200, 100%, 60%))'
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground/60 mt-0.5">
            <span>{fmtTime(currentTime)}</span>
            <span>{fmtTime(duration)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PlayerBar;
