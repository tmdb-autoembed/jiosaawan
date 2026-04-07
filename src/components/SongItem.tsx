import { getImg, getArtistStr, fmtTime, decodeHtml } from '@/lib/api';
import { usePlayer } from '@/contexts/PlayerContext';
import WaveBars from './WaveBars';
import { Music } from 'lucide-react';


interface SongItemProps {
  song: any;
  songList?: any[];
  songIdx?: number;
  showMeta?: boolean;
}

const VIBRANT_COLORS = [
  'hsl(340, 85%, 60%)',
  'hsl(160, 70%, 50%)',
  'hsl(45, 95%, 55%)',
  'hsl(190, 80%, 55%)',
  'hsl(280, 70%, 60%)',
  'hsl(25, 95%, 58%)',
  'hsl(210, 80%, 60%)',
  'hsl(130, 65%, 50%)',
];

const getColor = (id: string, offset = 0) => {
  let hash = 0;
  for (let i = 0; i < (id || '').length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return VIBRANT_COLORS[Math.abs(hash + offset) % VIBRANT_COLORS.length];
};

const SongItem = ({ song, songList, songIdx = -1, showMeta = true }: SongItemProps) => {
  const { currentSong, isPlaying, playQueue, loadAndPlay } = usePlayer();
  const isActive = currentSong?.id === song.id;

  const imgUrl = getImg(song.image, '150x150');
  const artist = getArtistStr(song);
  const dur = song.duration ? fmtTime(song.duration) : '';

  const metaParts: string[] = [];
  if (song.album?.name) metaParts.push(decodeHtml(song.album.name));
  else if (typeof song.album === 'string') metaParts.push(decodeHtml(song.album));
  if (song.language) metaParts.push(song.language);
  if (song.year) metaParts.push(String(song.year));

  const handleClick = () => {
    if (songList && songList.length > 0) {
      const idx = songIdx >= 0 ? songIdx : songList.findIndex(s => s.id === song.id);
      playQueue(songList, idx >= 0 ? idx : 0);
    } else {
      loadAndPlay(song);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Always use app's own URL
    const songUrl = `${window.location.origin}/?song=${song.id}`;
    if (navigator.share) {
      navigator.share({ title: decodeHtml(song.name || ''), text: `Listen to ${decodeHtml(song.name || '')}`, url: songUrl }).catch(() => {});
    } else {
      navigator.clipboard.writeText(songUrl);
      toast.success('Link copied!');
    }
  };

  const artistColor = getColor(song.id || '', 2);
  const metaColor = getColor(song.id || '', 4);

  return (
    <div
      onClick={handleClick}
      className={`group flex items-center gap-0 rounded-xl cursor-pointer transition-all duration-200 active:scale-[0.98] overflow-hidden ${
        isActive
          ? 'ring-1 ring-primary/30 shadow-md shadow-primary/10'
          : 'hover:translate-x-0.5'
      }`}
      style={{
        background: isActive
          ? 'linear-gradient(135deg, hsla(25, 80%, 50%, 0.15), hsla(340, 70%, 45%, 0.12), hsla(250, 30%, 20%, 0.2))'
          : 'linear-gradient(135deg, hsla(250, 20%, 14%, 0.5), hsla(250, 18%, 12%, 0.4))',
      }}
    >
      {/* Image - bigger, no gap */}
      <div className="relative flex-shrink-0">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={decodeHtml(song.name || '')}
            loading="lazy"
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-l-xl object-cover ${isActive ? 'ring-2 ring-primary/40' : ''}`}
            onError={(e) => { (e.target as HTMLImageElement).src = ''; }}
          />
        ) : (
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-l-xl bg-secondary flex items-center justify-center">
            <Music className="w-5 h-5 text-muted-foreground/40" />
          </div>
        )}
        {isActive && isPlaying && (
          <div className="absolute inset-0 rounded-l-xl bg-black/30 flex items-center justify-center">
            <WaveBars />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 py-2 px-3">
        <p className="text-sm font-semibold truncate text-white">
          {decodeHtml(song.name || song.title || 'Unknown')}
        </p>
        <p className="text-xs truncate mt-0.5" style={{ color: artistColor, opacity: 0.85 }}>{artist}</p>
        {showMeta && metaParts.length > 0 && (
          <p className="text-[10px] truncate mt-0.5" style={{ color: metaColor, opacity: 0.6 }}>{metaParts.join(' · ')}</p>
        )}
      </div>

      <span className="text-xs flex-shrink-0 tabular-nums" style={{ color: 'hsl(45, 95%, 65%)', opacity: 0.7 }}>{dur}</span>

      {/* Share button - always visible on mobile */}
      <button
        onClick={handleShare}
        className="flex-shrink-0 p-2 mr-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all sm:opacity-0 sm:group-hover:opacity-100"
      >
        <Share2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default SongItem;
