import { usePlayer } from '@/contexts/PlayerContext';
import { getImg, getArtistStr, fmtTime, getUrlForQuality, getAudioUrl } from '@/lib/api';
import { ChevronDown, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Mic, ListOrdered, Share2, Heart, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const QUALITY_OPTIONS = [
  { value: '96kbps', label: '96 kbps' },
  { value: '160kbps', label: '160 kbps' },
  { value: '320kbps', label: '320 kbps' },
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
    <div
      className="fixed inset-0 z-[500] bg-background flex flex-col items-center px-6 pt-8 pb-6 overflow-y-auto"
      style={{ animation: 'slideUp 0.4s cubic-bezier(0.4,0,0.2,1)' }}
    >
      <style>{`@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>

      {/* Close */}
      <button
        onClick={() => setExpandedOpen(false)}
        className="self-start flex items-center gap-1.5 text-muted-foreground hover:text-foreground mb-6 text-sm"
      >
        <ChevronDown className="w-5 h-5" /> Now Playing
      </button>

      {/* Art */}
      <div className="relative mb-6">
        <img
          src={imgUrl}
          alt=""
          className={`w-64 h-64 rounded-full object-cover border-2 border-background p-2 ${isPlaying ? 'animate-vinyl-spin' : ''}`}
          style={{ boxShadow: '0 0 0 2px #000, 0 20px 60px rgba(0,0,0,0.7), inset 0 2px 6px rgba(255,255,255,0.05), inset 0 -3px 6px rgba(0,0,0,0.9)' }}
        />
      </div>

      {/* Title */}
      <h2 className="text-xl font-extrabold text-foreground text-center mb-1">{currentSong.name || currentSong.title || '—'}</h2>
      <p className="text-sm text-muted-foreground text-center mb-6">{getArtistStr(currentSong) || '—'}</p>

      {/* Progress */}
      <div className="w-full mb-1">
        <div
          className="w-full h-1.5 bg-secondary nm-inset rounded cursor-pointer"
          onClick={handleProgressClick}
        >
          <div className="h-full progress-gradient rounded" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground/60 mt-1">
          <span>{fmtTime(currentTime)}</span>
          <span>{fmtTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 my-4 w-full">
        <button onClick={toggleShuffle} className={`w-11 h-11 rounded-full nm-surface nm-flat flex items-center justify-center transition-colors ${shuffle ? 'text-primary' : 'text-muted-foreground'}`}>
          <Shuffle className="w-5 h-5" />
        </button>
        <button onClick={playPrev} className="w-11 h-11 rounded-full nm-surface nm-flat flex items-center justify-center text-muted-foreground hover:text-foreground">
          <SkipBack className="w-5 h-5" />
        </button>
        <button
          onClick={togglePlay}
          className={`w-[70px] h-[70px] rounded-full nm-surface nm-raised flex items-center justify-center text-primary text-2xl transition-all ${
            isPlaying ? 'animate-play-pulse' : ''
          }`}
        >
          {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
        </button>
        <button onClick={playNext} className="w-11 h-11 rounded-full nm-surface nm-flat flex items-center justify-center text-muted-foreground hover:text-foreground">
          <SkipForward className="w-5 h-5" />
        </button>
        <button onClick={toggleRepeat} className={`w-11 h-11 rounded-full nm-surface nm-flat flex items-center justify-center transition-colors ${repeat ? 'text-primary' : 'text-muted-foreground'}`}>
          <Repeat className="w-5 h-5" />
        </button>
      </div>

      {/* Extra buttons */}
      <div className="flex justify-around w-full mt-2">
        <button onClick={handleLyrics} className="w-11 h-11 rounded-full nm-surface nm-flat flex items-center justify-center text-muted-foreground hover:text-foreground">
          <Mic className="w-5 h-5" />
        </button>
        <button onClick={() => setQueueOpen(true)} className="w-11 h-11 rounded-full nm-surface nm-flat flex items-center justify-center text-muted-foreground hover:text-foreground">
          <ListOrdered className="w-5 h-5" />
        </button>
        <button onClick={handleShare} className="w-11 h-11 rounded-full nm-surface nm-flat flex items-center justify-center text-muted-foreground hover:text-foreground">
          <Share2 className="w-5 h-5" />
        </button>
        <button onClick={() => toggleLike(currentSong)} className={`w-11 h-11 rounded-full nm-surface nm-flat flex items-center justify-center transition-colors ${liked ? 'text-accent' : 'text-muted-foreground'}`}>
          <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-3 w-full mt-4">
        <span className="text-xs text-muted-foreground">🔈</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="flex-1 h-1.5 appearance-none rounded bg-secondary cursor-pointer accent-primary"
        />
        <span className="text-xs text-muted-foreground">🔊</span>
      </div>

      {/* Quality */}
      <div className="mt-5 w-full">
        <p className="text-[11px] text-muted-foreground/60 uppercase tracking-wider text-center mb-2">Audio Quality</p>
        <div className="flex justify-center gap-2">
          {QUALITY_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setQuality(value)}
              className={`px-3 py-1 rounded-full text-xs font-semibold nm-surface transition-all ${
                preferredQuality === value ? 'nm-inset text-primary' : 'nm-flat text-muted-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Download */}
      <button
        onClick={handleDownload}
        className="mt-4 w-full py-2.5 nm-surface nm-raised rounded-lg text-primary font-bold text-sm flex items-center justify-center gap-2 active:nm-inset"
      >
        <Download className="w-4 h-4" /> Download
      </button>
    </div>
  );
};

export default ExpandedPlayer;
