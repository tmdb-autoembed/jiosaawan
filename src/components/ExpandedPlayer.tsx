import { useState } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import { getImg, getArtistStr, fmtTime, getUrlForQuality, getAudioUrl, getSongShareLink, getSongRingtone } from '@/lib/api';
import { ChevronDown, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Mic, ListOrdered, Share2, Heart, Download, Sliders, Bell, Infinity as InfinityIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import Equalizer from './Equalizer';
import WaveBars from './WaveBars';

const QUALITY_OPTIONS = [
  { value: '96kbps', label: 'Low' },
  { value: '160kbps', label: 'Medium' },
  { value: '320kbps', label: 'High' },
];

const ExpandedPlayer = () => {
  const {
    currentSong, isPlaying, togglePlay, playNext, playPrev,
    currentTime, duration, seek, volume, setVolume,
    shuffle, toggleShuffle, repeat, toggleRepeat,
    expandedOpen, setExpandedOpen, setQueueOpen,
    toggleLike, isLiked, preferredQuality, setQuality,
    autoPlay, toggleAutoPlay,
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

  const actions = [
    { icon: Mic, action: handleLyrics, label: 'Lyrics', active: false },
    { icon: ListOrdered, action: () => setQueueOpen(true), label: 'Queue', active: false },
    { icon: Share2, action: handleShare, label: 'Share', active: false },
    { icon: Heart, action: () => toggleLike(currentSong), label: 'Like', active: liked },
    { icon: Bell, action: handleRingtone, label: 'Ringtone', active: false },
  ];

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-0 z-[500] flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, hsl(250 20% 6%) 0%, hsl(250 22% 4%) 50%, hsl(25 15% 5%) 100%)',
      }}
    >
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-6 w-48 h-48 bg-primary/8 rounded-full blur-[100px]" />
        <div className="absolute top-40 right-4 w-40 h-40 bg-accent/6 rounded-full blur-[80px]" />
        <div className="absolute bottom-40 left-12 w-56 h-56 bg-accent2/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative flex-1 flex flex-col items-center px-6 pt-5 pb-4 overflow-y-auto">
        {/* Header */}
        <div className="w-full flex items-center justify-between mb-6">
          <button onClick={() => setExpandedOpen(false)} className="w-10 h-10 rounded-full bg-secondary/30 flex items-center justify-center hover:bg-secondary/50 transition-colors">
            <ChevronDown className="w-5 h-5 text-foreground" />
          </button>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">Now Playing</span>
          <button
            onClick={() => setShowEqualizer(!showEqualizer)}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${showEqualizer ? 'bg-gradient-primary text-primary-foreground glow-primary' : 'bg-secondary/30 text-muted-foreground hover:bg-secondary/50'}`}
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
              <div className="relative mb-8">
                <div className={`absolute inset-[-20px] rounded-full blur-3xl opacity-25 ${isPlaying ? 'animate-pulse' : ''}`}
                  style={{ background: 'var(--gradient-primary)' }}
                />
                <motion.img
                  src={imgUrl}
                  alt=""
                  animate={{ rotate: isPlaying ? 360 : 0 }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                  className="relative w-56 h-56 rounded-full object-cover border-[3px] border-primary/15"
                  style={{ boxShadow: '0 0 0 5px rgba(0,0,0,0.3), 0 30px 70px rgba(0,0,0,0.5)' }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-background/80 border-[3px] border-secondary/40" />
                </div>
                {isPlaying && (
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
                    <WaveBars />
                  </div>
                )}
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold text-foreground text-center mb-1 max-w-full truncate" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {currentSong.name || currentSong.title || '—'}
              </h2>
              <p className="text-sm text-muted-foreground text-center mb-6">{getArtistStr(currentSong) || '—'}</p>

              {/* Progress */}
              <div className="w-full mb-3">
                <div className="w-full h-1.5 bg-secondary/30 rounded-full cursor-pointer overflow-hidden" onClick={handleProgressClick}>
                  <motion.div className="h-full rounded-full progress-gradient" style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground/40 mt-2">
                  <span>{fmtTime(currentTime)}</span>
                  <span>{fmtTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-5 my-4 w-full">
                <button onClick={toggleShuffle} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${shuffle ? 'bg-gradient-warm text-primary-foreground shadow-lg' : 'bg-secondary/20 text-muted-foreground/60'}`}>
                  <Shuffle className="w-4.5 h-4.5" />
                </button>
                <button onClick={playPrev} className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center text-foreground/70 hover:text-foreground transition-all hover:bg-secondary/30">
                  <SkipBack className="w-5 h-5" />
                </button>
                <motion.button
                  onClick={togglePlay}
                  whileTap={{ scale: 0.95 }}
                  className={`w-[72px] h-[72px] rounded-full flex items-center justify-center text-primary-foreground ${isPlaying ? 'animate-play-pulse' : ''}`}
                  style={{ background: 'var(--gradient-primary)' }}
                >
                  {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                </motion.button>
                <button onClick={playNext} className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center text-foreground/70 hover:text-foreground transition-all hover:bg-secondary/30">
                  <SkipForward className="w-5 h-5" />
                </button>
                <button onClick={toggleRepeat} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${repeat ? 'bg-gradient-cool text-white shadow-lg' : 'bg-secondary/20 text-muted-foreground/60'}`}>
                  <Repeat className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Auto-play toggle */}
              <button
                onClick={toggleAutoPlay}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all mt-2 ${
                  autoPlay ? 'bg-gradient-primary text-primary-foreground shadow-lg' : 'card-surface text-muted-foreground hover:text-foreground'
                }`}
              >
                <InfinityIcon className="w-4 h-4" />
                {autoPlay ? 'On' : 'Off'}
              </button>

              {/* Actions */}
              <div className="flex justify-around w-full mt-3 gap-1">
                {actions.map(({ icon: Icon, action, label, active }) => (
                  <button
                    key={label}
                    onClick={action}
                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all ${
                      active ? 'bg-gradient-primary text-primary-foreground shadow-lg' : 'text-muted-foreground/60 hover:text-foreground hover:bg-secondary/20'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'fill-current' : ''}`} />
                    <span className="text-[9px] font-semibold">{label}</span>
                  </button>
                ))}
              </div>

              {/* Volume */}
              <div className="flex items-center gap-3 w-full mt-6 bg-secondary/15 rounded-2xl p-3.5">
                <span className="text-sm opacity-60">🔈</span>
                <input
                  type="range" min="0" max="1" step="0.01" value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="flex-1 h-1 appearance-none rounded-full bg-secondary/30 cursor-pointer accent-primary"
                  style={{
                    background: `linear-gradient(90deg, hsl(25, 100%, 60%) 0%, hsl(340, 85%, 58%) ${volume * 100}%, hsla(250, 12%, 16%, 0.5) ${volume * 100}%)`
                  }}
                />
                <span className="text-sm opacity-60">🔊</span>
              </div>

              {/* Quality */}
              <div className="mt-5 w-full">
                <p className="text-[9px] text-muted-foreground/40 uppercase tracking-wider text-center mb-2 font-semibold">Quality</p>
                <div className="flex justify-center gap-2">
                  {QUALITY_OPTIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setQuality(value)}
                      className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
                        preferredQuality === value
                          ? 'bg-gradient-primary text-primary-foreground shadow-lg glow-primary'
                          : 'bg-secondary/20 text-muted-foreground/50 hover:bg-secondary/30'
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
                className="mt-5 w-full py-3.5 rounded-2xl text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 bg-gradient-primary glow-primary"
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
