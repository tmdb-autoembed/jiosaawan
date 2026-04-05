import { useState } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import { getImg, getArtistStr, fmtTime, getUrlForQuality, getAudioUrl, getSongRingtone, decodeHtml } from '@/lib/api';
import { ChevronDown, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Mic, ListOrdered, Heart, Download, Sliders, Bell, Infinity as InfinityIcon, Power, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import Equalizer from './Equalizer';

const QUALITY_OPTIONS = [
  { value: '96kbps', label: 'Low' },
  { value: '160kbps', label: 'Medium' },
  { value: '320kbps', label: 'High' },
];

const ExpandedPlayer = () => {
  const {
    currentSong, isPlaying, togglePlay, playNext, playPrev,
    currentTime, duration, seek,
    shuffle, toggleShuffle, repeat, toggleRepeat,
    expandedOpen, setExpandedOpen, setQueueOpen,
    toggleLike, isLiked, preferredQuality, setQuality,
    autoPlay, toggleAutoPlay, audioEffects, toggleEqualizer,
  } = usePlayer();
  const navigate = useNavigate();
  const [showEqualizer, setShowEqualizer] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  if (!expandedOpen || !currentSong) return null;

  const imgUrl = getImg(currentSong.image, '500x500');
  const pct = duration ? (currentTime / duration) * 100 : 0;
  const liked = isLiked(currentSong.id);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const p = (e.clientX - rect.left) / rect.width;
    seek(p * (duration || 0));
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

  const handleShare = async () => {
    const songUrl = currentSong.url || currentSong.permaUrl || `${window.location.origin}/?song=${currentSong.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: decodeHtml(currentSong.name || ''), text: `Listen to ${decodeHtml(currentSong.name || '')} by ${getArtistStr(currentSong)}`, url: songUrl });
      } else {
        await navigator.clipboard.writeText(songUrl);
        toast.success('Link copied!');
      }
    } catch {
      await navigator.clipboard.writeText(songUrl);
      toast.success('Link copied!');
    }
  };

  const handleLyrics = () => {
    setExpandedOpen(false);
    navigate('/lyrics');
  };

  const actions = [
    { icon: Mic, action: handleLyrics, label: 'Lyrics', active: false },
    { icon: ListOrdered, action: () => setQueueOpen(true), label: 'Queue', active: false },
    { icon: Heart, action: () => toggleLike(currentSong), label: 'Like', active: liked },
    { icon: Share2, action: handleShare, label: 'Share', active: false },
    { icon: Bell, action: handleRingtone, label: 'Ringtone', active: false },
  ];

  const tabs = ['Player', 'Equalizer'];

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-0 z-[500] flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, hsl(250 20% 8%) 0%, hsl(340 30% 8%) 40%, hsl(25 30% 6%) 70%, hsl(250 22% 4%) 100%)',
      }}
    >
      <div className="relative flex-1 flex flex-col items-center px-4 sm:px-8 lg:px-16 pt-5 pb-4 overflow-y-auto">
        <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mb-4 flex-shrink-0" />

        {/* Header */}
        <div className="w-full max-w-lg flex items-center justify-between mb-4">
          <button onClick={() => setExpandedOpen(false)} className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary/50 to-secondary/20 flex items-center justify-center hover:from-secondary/60 transition-all">
            <ChevronDown className="w-5 h-5 text-white" />
          </button>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground">Now Playing</span>
          <button
            onClick={() => { setShowEqualizer(!showEqualizer); setActiveTab(showEqualizer ? 0 : 1); }}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${showEqualizer ? 'bg-gradient-to-br from-primary to-primary/70 text-primary-foreground' : 'bg-gradient-to-br from-secondary/50 to-secondary/20 text-white hover:from-secondary/60'}`}
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>

        {/* Tab dots */}
        <div className="flex gap-2 mb-4">
          {tabs.map((_, i) => (
            <button key={i} onClick={() => { setActiveTab(i); setShowEqualizer(i === 1); }} className={`w-2 h-2 rounded-full transition-all ${activeTab === i ? 'bg-primary w-5' : 'bg-muted-foreground/30'}`} />
          ))}
        </div>

        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            {showEqualizer ? (
              <motion.div key="equalizer" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="w-full">
                <div className="flex items-center justify-between mb-4 bg-gradient-to-r from-secondary/30 to-secondary/10 rounded-2xl p-3">
                  <div className="flex items-center gap-2">
                    <Power className="w-4 h-4 text-white" />
                    <span className="text-xs font-semibold text-white">Equalizer</span>
                  </div>
                  <button
                    onClick={toggleEqualizer}
                    className={`w-12 h-6 rounded-full transition-all relative ${audioEffects.enabled ? 'bg-primary' : 'bg-secondary/50'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${audioEffects.enabled ? 'left-6' : 'left-0.5'}`} />
                  </button>
                </div>
                <Equalizer />
              </motion.div>
            ) : (
              <motion.div key="player" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className="w-full flex flex-col items-center">
                {/* Album Art */}
                <div className="relative mb-6">
                  <img
                    src={imgUrl}
                    alt=""
                    className={`w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 rounded-full object-cover border-[3px] border-secondary/30 ${isPlaying ? 'animate-spin' : ''}`}
                    style={{ animationDuration: '8s' }}
                  />
                </div>

                {/* Title - always white */}
                <h2 className="text-lg sm:text-xl font-bold text-white text-center mb-1 max-w-full truncate" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {decodeHtml(currentSong.name || currentSong.title || '—')}
                </h2>
                <p className="text-sm text-center mb-5" style={{ color: 'hsl(190, 80%, 60%)' }}>{getArtistStr(currentSong) || '—'}</p>

                {/* Progress */}
                <div className="w-full mb-2">
                  <div className="w-full h-1.5 bg-secondary/30 rounded-full cursor-pointer overflow-hidden" onClick={handleProgressClick}>
                    <motion.div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] mt-2" style={{ color: 'hsl(45, 95%, 65%)' }}>
                    <span>{fmtTime(currentTime)}</span>
                    <span>{fmtTime(duration)}</span>
                  </div>
                </div>

                {/* Controls - gradient buttons */}
                <div className="flex items-center justify-center gap-4 sm:gap-5 my-3 w-full">
                  <button onClick={toggleShuffle} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${shuffle ? 'bg-gradient-to-br from-primary to-primary/60 text-white' : 'bg-gradient-to-br from-white/15 to-white/5 text-white/80 hover:from-white/20'}`}>
                    <Shuffle className="w-4.5 h-4.5" />
                  </button>
                  <button onClick={playPrev} className="w-12 h-12 rounded-full bg-gradient-to-br from-white/15 to-white/5 flex items-center justify-center text-white hover:from-white/25 transition-all">
                    <SkipBack className="w-5 h-5" />
                  </button>
                  <motion.button
                    onClick={togglePlay}
                    whileTap={{ scale: 0.95 }}
                    className="w-[68px] h-[68px] rounded-full flex items-center justify-center text-white bg-gradient-to-br from-primary via-primary/90 to-primary/60"
                  >
                    {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
                  </motion.button>
                  <button onClick={playNext} className="w-12 h-12 rounded-full bg-gradient-to-br from-white/15 to-white/5 flex items-center justify-center text-white hover:from-white/25 transition-all">
                    <SkipForward className="w-5 h-5" />
                  </button>
                  <button onClick={toggleRepeat} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${repeat ? 'bg-gradient-to-br from-primary to-primary/60 text-white' : 'bg-gradient-to-br from-white/15 to-white/5 text-white/80 hover:from-white/20'}`}>
                    <Repeat className="w-4.5 h-4.5" />
                  </button>
                </div>

                {/* Auto-play */}
                <button
                  onClick={toggleAutoPlay}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all mt-1 ${
                    autoPlay ? 'bg-gradient-to-r from-primary to-primary/70 text-white' : 'bg-gradient-to-r from-white/10 to-white/5 text-white/60 hover:text-white'
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
                        active ? 'bg-gradient-to-br from-primary to-primary/60 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? 'fill-current' : ''}`} />
                      <span className="text-[9px] font-semibold">{label}</span>
                    </button>
                  ))}
                </div>

                {/* Quality */}
                <div className="mt-4 w-full">
                  <p className="text-[9px] uppercase tracking-wider text-center mb-2 font-semibold" style={{ color: 'hsl(280, 70%, 65%)' }}>Quality</p>
                  <div className="flex justify-center gap-2">
                    {QUALITY_OPTIONS.map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => setQuality(value)}
                        className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
                          preferredQuality === value
                            ? 'bg-gradient-to-r from-primary to-primary/70 text-white'
                            : 'bg-gradient-to-br from-white/10 to-white/5 text-white/50 hover:from-white/15'
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
                  className="mt-4 mb-6 w-full py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-primary via-primary/90 to-primary/60 flex-shrink-0"
                >
                  <Download className="w-4 h-4" /> Download Song
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default ExpandedPlayer;
