import { useState } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import { getImg, getArtistStr, fmtTime, getUrlForQuality, getAudioUrl } from '@/lib/api';
import { ChevronDown, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Mic, ListOrdered, Share2, Heart, Download, Sliders } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import Equalizer from './Equalizer';
import WaveBars from './WaveBars';

const QUALITY_OPTIONS = [
  { value: '96kbps', label: '96', color: 'from-gray-500 to-gray-600' },
  { value: '160kbps', label: '160', color: 'from-blue-500 to-cyan-500' },
  { value: '320kbps', label: '320', color: 'from-violet-500 to-fuchsia-500' },
];

const ExpandedPlayer = () => {
  const {
    currentSong, isPlaying, togglePlay, playNext, playPrev,
    currentTime, duration, seek, volume, setVolume,
    shuffle, toggleShuffle, repeat, toggleRepeat,
    expandedOpen, setExpandedOpen, setQueueOpen,
    toggleLike, isLiked, preferredQuality, setQuality,
  } = usePlayer();
  const navigate = useNavigate();
  const [showEqualizer, setShowEqualizer] = useState(false);

  if (!expandedOpen || !currentSong) return null;

  const imgUrl = getImg(currentSong.image, '500x500');
  const pct = duration ? (currentTime / duration) * 100 : 0;
  const liked = isLiked(currentSong.id);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const p = (e.clientX - rect.left) / rect.width;
    seek(p * (duration || 0));
  };

  const handleShare = () => {
    const title = currentSong.name || currentSong.title || 'Unknown';
    const artist = getArtistStr(currentSong);
    if (navigator.share) {
      navigator.share({ title, text: `🎵 ${title} — ${artist}`, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href).then(() => toast.success('Link copied! 🔗'));
    }
  };

  const handleDownload = async () => {
    const audioUrl = getUrlForQuality(currentSong, preferredQuality) || getAudioUrl(currentSong, preferredQuality);
    if (!audioUrl) { toast.error('No audio URL'); return; }
    toast.info('Preparing download…');
    try {
      const resp = await fetch(audioUrl);
      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${currentSong.name || 'song'}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
      toast.success('Downloading…');
    } catch {
      toast.error('Download failed');
    }
  };

  const handleLyrics = () => {
    setExpandedOpen(false);
    navigate('/lyrics');
  };

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-0 z-[500] flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, hsl(280 30% 12%) 0%, hsl(250 25% 8%) 50%, hsl(320 20% 6%) 100%)',
      }}
    >
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-40 h-40 bg-violet-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-5 w-32 h-32 bg-fuchsia-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-40 left-20 w-48 h-48 bg-cyan-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative flex-1 flex flex-col items-center px-6 pt-6 pb-4 overflow-y-auto">
        {/* Header */}
        <div className="w-full flex items-center justify-between mb-4">
          <button
            onClick={() => setExpandedOpen(false)}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
          <span className="text-xs font-semibold uppercase tracking-wider text-gradient">Now Playing</span>
          <button
            onClick={() => setShowEqualizer(!showEqualizer)}
            className={`p-2 rounded-full transition-all ${showEqualizer ? 'bg-gradient-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Sliders className="w-5 h-5" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {showEqualizer ? (
            <motion.div
              key="equalizer"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full flex-1"
            >
              <Equalizer />
            </motion.div>
          ) : (
            <motion.div
              key="player"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full flex flex-col items-center"
            >
              {/* Album Art with glow */}
              <div className="relative mb-6">
                {/* Glow ring */}
                <div 
                  className={`absolute inset-0 rounded-full blur-xl opacity-60 ${isPlaying ? 'animate-pulse' : ''}`}
                  style={{ background: 'linear-gradient(135deg, hsl(280, 100%, 50%), hsl(320, 100%, 50%))' }}
                />
                <motion.img
                  src={imgUrl}
                  alt=""
                  animate={{ rotate: isPlaying ? 360 : 0 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  className="relative w-56 h-56 rounded-full object-cover border-4 border-white/10"
                  style={{ boxShadow: '0 0 0 4px rgba(0,0,0,0.3), 0 25px 50px rgba(0,0,0,0.5)' }}
                />
                {/* Vinyl hole */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-900 to-black border-4 border-white/5" />
                </div>
                {/* Wave bars overlay */}
                {isPlaying && (
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
                    <WaveBars />
                  </div>
                )}
              </div>

              {/* Title */}
              <h2 className="text-xl font-extrabold text-foreground text-center mb-1 max-w-full truncate">
                {currentSong.name || currentSong.title || '—'}
              </h2>
              <p className="text-sm text-muted-foreground text-center mb-6">{getArtistStr(currentSong) || '—'}</p>

              {/* Progress */}
              <div className="w-full mb-2">
                <div
                  className="w-full h-2 bg-white/10 rounded-full cursor-pointer overflow-hidden"
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
                <div className="flex justify-between text-xs text-muted-foreground/60 mt-1.5">
                  <span>{fmtTime(currentTime)}</span>
                  <span>{fmtTime(duration)}</span>
                </div>
              </div>

              {/* Main Controls */}
              <div className="flex items-center justify-center gap-5 my-4 w-full">
                <button 
                  onClick={toggleShuffle} 
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    shuffle ? 'bg-gradient-primary text-white shadow-lg shadow-violet-500/30' : 'bg-white/5 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Shuffle className="w-5 h-5" />
                </button>
                <button 
                  onClick={playPrev} 
                  className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all"
                >
                  <SkipBack className="w-5 h-5" />
                </button>
                <motion.button
                  onClick={togglePlay}
                  whileTap={{ scale: 0.95 }}
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl transition-all ${
                    isPlaying ? 'animate-play-pulse' : ''
                  }`}
                  style={{ background: 'linear-gradient(135deg, hsl(280, 100%, 60%), hsl(320, 100%, 55%))' }}
                >
                  {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                </motion.button>
                <button 
                  onClick={playNext} 
                  className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
                <button 
                  onClick={toggleRepeat} 
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    repeat ? 'bg-gradient-cyan text-white shadow-lg shadow-cyan-500/30' : 'bg-white/5 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Repeat className="w-5 h-5" />
                </button>
              </div>

              {/* Extra buttons */}
              <div className="flex justify-around w-full mt-2 gap-2">
                {[
                  { icon: Mic, action: handleLyrics, label: 'Lyrics', gradient: 'from-amber-500 to-orange-500' },
                  { icon: ListOrdered, action: () => setQueueOpen(true), label: 'Queue', gradient: 'from-green-500 to-emerald-500' },
                  { icon: Share2, action: handleShare, label: 'Share', gradient: 'from-blue-500 to-cyan-500' },
                  { icon: Heart, action: () => toggleLike(currentSong), label: 'Like', gradient: 'from-pink-500 to-rose-500', active: liked },
                ].map(({ icon: Icon, action, label, gradient, active }) => (
                  <button 
                    key={label}
                    onClick={action} 
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                      active ? `bg-gradient-to-r ${gradient} text-white` : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${active ? 'fill-current' : ''}`} />
                    <span className="text-[10px]">{label}</span>
                  </button>
                ))}
              </div>

              {/* Volume */}
              <div className="flex items-center gap-3 w-full mt-5 bg-white/5 rounded-2xl p-3">
                <span className="text-lg">🔈</span>
                <div className="flex-1 relative">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full h-2 appearance-none rounded-full bg-white/10 cursor-pointer"
                    style={{
                      background: `linear-gradient(90deg, hsl(280, 100%, 65%) 0%, hsl(320, 100%, 60%) ${volume * 100}%, rgba(255,255,255,0.1) ${volume * 100}%)`
                    }}
                  />
                </div>
                <span className="text-lg">🔊</span>
              </div>

              {/* Quality */}
              <div className="mt-4 w-full">
                <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider text-center mb-2">Quality (kbps)</p>
                <div className="flex justify-center gap-2">
                  {QUALITY_OPTIONS.map(({ value, label, color }) => (
                    <button
                      key={value}
                      onClick={() => setQuality(value)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        preferredQuality === value 
                          ? `bg-gradient-to-r ${color} text-white shadow-lg` 
                          : 'bg-white/5 text-muted-foreground hover:bg-white/10'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Download */}
              <motion.button
                onClick={handleDownload}
                whileTap={{ scale: 0.98 }}
                className="mt-4 w-full py-3 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, hsl(280, 100%, 60%), hsl(320, 100%, 55%))' }}
              >
                <Download className="w-4 h-4" /> Download Song
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ExpandedPlayer;
