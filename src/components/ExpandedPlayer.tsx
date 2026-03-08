import { useState } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import { getImg, getArtistStr, fmtTime, getUrlForQuality, getAudioUrl, getSongShareLink, getSongRingtone } from '@/lib/api';
import { ChevronDown, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Mic, ListOrdered, Share2, Heart, Download, Sliders, Bell, Link } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import Equalizer from './Equalizer';
import WaveBars from './WaveBars';

const QUALITY_OPTIONS = [
  { value: '96kbps', label: '96', gradient: 'from-gray-500 to-gray-600' },
  { value: '160kbps', label: '160', gradient: 'from-blue-500 to-cyan-500' },
  { value: '320kbps', label: '320', gradient: 'from-emerald-500 to-teal-400' },
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

  const handleShare = async () => {
    try {
      const res = await getSongShareLink(currentSong.id);
      const shareUrl = res?.data?.shareUrl || res?.data?.url || window.location.href;
      const title = currentSong.name || currentSong.title || 'Unknown';
      const artist = getArtistStr(currentSong);
      if (navigator.share) {
        navigator.share({ title, text: `🎵 ${title} — ${artist}`, url: shareUrl }).catch(() => {});
      } else {
        navigator.clipboard?.writeText(shareUrl).then(() => toast.success('Link copied! 🔗'));
      }
    } catch {
      navigator.clipboard?.writeText(window.location.href).then(() => toast.success('Link copied!'));
    }
  };

  const handleRingtone = async () => {
    toast.info('Fetching ringtone…');
    try {
      const res = await getSongRingtone(currentSong.id);
      if (res?.data?.previewUrl) {
        window.open(res.data.previewUrl, '_blank');
        toast.success('Ringtone preview opened!');
      } else if (res?.data?.url) {
        window.open(res.data.url, '_blank');
      } else {
        toast.error('Ringtone not available');
      }
    } catch {
      toast.error('Ringtone not available');
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
        background: 'linear-gradient(180deg, hsl(230 25% 8%) 0%, hsl(230 30% 5%) 40%, hsl(160 20% 5%) 100%)',
      }}
    >
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-16 left-8 w-44 h-44 bg-primary/10 rounded-full blur-[80px] animate-pulse" />
        <div className="absolute top-32 right-4 w-36 h-36 bg-accent/10 rounded-full blur-[60px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-32 left-16 w-52 h-52 bg-accent3/8 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative flex-1 flex flex-col items-center px-6 pt-5 pb-4 overflow-y-auto">
        {/* Header */}
        <div className="w-full flex items-center justify-between mb-4">
          <button onClick={() => setExpandedOpen(false)} className="w-9 h-9 rounded-full bg-secondary/40 flex items-center justify-center">
            <ChevronDown className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gradient">Now Playing</span>
          <button
            onClick={() => setShowEqualizer(!showEqualizer)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${showEqualizer ? 'bg-gradient-primary text-primary-foreground' : 'bg-secondary/40 text-muted-foreground'}`}
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {showEqualizer ? (
            <motion.div key="equalizer" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full flex-1">
              <Equalizer />
            </motion.div>
          ) : (
            <motion.div key="player" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full flex flex-col items-center">
              {/* Album Art */}
              <div className="relative mb-6">
                <div className={`absolute inset-0 rounded-full blur-2xl opacity-40 ${isPlaying ? 'animate-pulse' : ''}`}
                  style={{ background: 'var(--gradient-primary)' }}
                />
                <motion.img
                  src={imgUrl}
                  alt=""
                  animate={{ rotate: isPlaying ? 360 : 0 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  className="relative w-52 h-52 rounded-full object-cover border-4 border-primary/20"
                  style={{ boxShadow: '0 0 0 4px rgba(0,0,0,0.3), 0 25px 60px rgba(0,0,0,0.5)' }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-background/90 border-4 border-secondary/50" />
                </div>
                {isPlaying && (
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                    <WaveBars />
                  </div>
                )}
              </div>

              {/* Title */}
              <h2 className="text-xl font-black text-foreground text-center mb-1 max-w-full truncate">
                {currentSong.name || currentSong.title || '—'}
              </h2>
              <p className="text-sm text-muted-foreground text-center mb-5">{getArtistStr(currentSong) || '—'}</p>

              {/* Progress */}
              <div className="w-full mb-2">
                <div className="w-full h-2 bg-secondary/40 rounded-full cursor-pointer overflow-hidden" onClick={handleProgressClick}>
                  <motion.div className="h-full rounded-full progress-gradient" style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground/50 mt-1.5">
                  <span>{fmtTime(currentTime)}</span>
                  <span>{fmtTime(duration)}</span>
                </div>
              </div>

              {/* Main Controls */}
              <div className="flex items-center justify-center gap-4 my-4 w-full">
                <button onClick={toggleShuffle} className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${shuffle ? 'bg-gradient-gold text-white glow-gold' : 'bg-secondary/30 text-muted-foreground'}`}>
                  <Shuffle className="w-5 h-5" />
                </button>
                <button onClick={playPrev} className="w-11 h-11 rounded-full bg-secondary/30 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all">
                  <SkipBack className="w-5 h-5" />
                </button>
                <motion.button
                  onClick={togglePlay}
                  whileTap={{ scale: 0.95 }}
                  className={`w-18 h-18 rounded-full flex items-center justify-center text-primary-foreground ${isPlaying ? 'animate-play-pulse' : ''}`}
                  style={{ background: 'var(--gradient-primary)', width: '72px', height: '72px' }}
                >
                  {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                </motion.button>
                <button onClick={playNext} className="w-11 h-11 rounded-full bg-secondary/30 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all">
                  <SkipForward className="w-5 h-5" />
                </button>
                <button onClick={toggleRepeat} className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${repeat ? 'bg-gradient-ocean text-white glow-blue' : 'bg-secondary/30 text-muted-foreground'}`}>
                  <Repeat className="w-5 h-5" />
                </button>
              </div>

              {/* Action buttons */}
              <div className="flex justify-around w-full mt-2 gap-1">
                {[
                  { icon: Mic, action: handleLyrics, label: 'Lyrics', gradient: 'from-amber-400 to-orange-500' },
                  { icon: ListOrdered, action: () => setQueueOpen(true), label: 'Queue', gradient: 'from-emerald-500 to-teal-400' },
                  { icon: Share2, action: handleShare, label: 'Share', gradient: 'from-blue-500 to-cyan-400' },
                  { icon: Heart, action: () => toggleLike(currentSong), label: 'Like', gradient: 'from-pink-500 to-rose-400', active: liked },
                  { icon: Bell, action: handleRingtone, label: 'Ringtone', gradient: 'from-violet-500 to-purple-400' },
                ].map(({ icon: Icon, action, label, gradient, active }) => (
                  <button
                    key={label}
                    onClick={action}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                      active ? `bg-gradient-to-r ${gradient} text-white shadow-lg` : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'fill-current' : ''}`} />
                    <span className="text-[9px] font-bold">{label}</span>
                  </button>
                ))}
              </div>

              {/* Volume */}
              <div className="flex items-center gap-3 w-full mt-5 bg-secondary/20 rounded-2xl p-3">
                <span className="text-sm">🔈</span>
                <input
                  type="range" min="0" max="1" step="0.01" value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="flex-1 h-1.5 appearance-none rounded-full bg-secondary/40 cursor-pointer accent-primary"
                  style={{
                    background: `linear-gradient(90deg, hsl(160, 100%, 50%) 0%, hsl(200, 100%, 55%) ${volume * 100}%, hsla(230, 15%, 18%, 0.5) ${volume * 100}%)`
                  }}
                />
                <span className="text-sm">🔊</span>
              </div>

              {/* Quality */}
              <div className="mt-4 w-full">
                <p className="text-[9px] text-muted-foreground/50 uppercase tracking-wider text-center mb-2 font-bold">Quality (kbps)</p>
                <div className="flex justify-center gap-2">
                  {QUALITY_OPTIONS.map(({ value, label, gradient }) => (
                    <button
                      key={value}
                      onClick={() => setQuality(value)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        preferredQuality === value
                          ? `bg-gradient-to-r ${gradient} text-white shadow-lg`
                          : 'bg-secondary/30 text-muted-foreground hover:bg-secondary/50'
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
                className="mt-4 w-full py-3 rounded-2xl text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 bg-gradient-primary glow-primary"
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
