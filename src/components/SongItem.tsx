import { getImg, getArtistStr, fmtTime, decodeHtml } from '@/lib/api';
import { usePlayer } from '@/contexts/PlayerContext';
import WaveBars from './WaveBars';

interface SongItemProps {
  song: any;
  songList?: any[];
  songIdx?: number;
  showMeta?: boolean;
}

const VIBRANT_COLORS = [
  'hsl(340, 85%, 60%)', // crimson-pink
  'hsl(160, 70%, 50%)', // emerald
  'hsl(45, 95%, 55%)',  // gold
  'hsl(190, 80%, 55%)', // cyan
  'hsl(280, 70%, 60%)', // purple
  'hsl(25, 95%, 58%)',  // orange
  'hsl(210, 80%, 60%)', // blue
  'hsl(130, 65%, 50%)', // green
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

  const titleColor = isActive ? 'hsl(25, 95%, 58%)' : getColor(song.id || '', 0);
  const artistColor = getColor(song.id || '', 2);
  const metaColor = getColor(song.id || '', 4);

  return (
    <div
      onClick={handleClick}
      className={`group flex items-center gap-3 p-2.5 rounded-2xl cursor-pointer transition-all duration-200 active:scale-[0.98] ${
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
      <div className="relative flex-shrink-0">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={decodeHtml(song.name || '')}
            loading="lazy"
            className={`w-10 h-10 rounded-lg object-cover ${isActive ? 'ring-2 ring-primary/40' : ''}`}
            onError={(e) => { (e.target as HTMLImageElement).src = ''; }}
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-secondary flex-shrink-0" />
        )}
        {isActive && isPlaying && (
          <div className="absolute inset-0 rounded-lg bg-black/30 flex items-center justify-center">
            <WaveBars />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: titleColor }}>
          {decodeHtml(song.name || song.title || 'Unknown')}
        </p>
        <p className="text-xs truncate mt-0.5" style={{ color: artistColor, opacity: 0.85 }}>{artist}</p>
        {showMeta && metaParts.length > 0 && (
          <p className="text-[10px] truncate mt-0.5" style={{ color: metaColor, opacity: 0.6 }}>{metaParts.join(' · ')}</p>
        )}
      </div>

      <span className="text-xs flex-shrink-0 pl-2 tabular-nums" style={{ color: 'hsl(45, 95%, 65%)', opacity: 0.7 }}>{dur}</span>
    </div>
  );
};

export default SongItem;
