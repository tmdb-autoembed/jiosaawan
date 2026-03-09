import { getImg, getArtistStr, fmtTime, decodeHtml } from '@/lib/api';
import { usePlayer } from '@/contexts/PlayerContext';
import WaveBars from './WaveBars';

interface SongItemProps {
  song: any;
  songList?: any[];
  songIdx?: number;
  showMeta?: boolean;
}

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

  return (
    <div
      onClick={handleClick}
      className={`group flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-200 hover:bg-secondary/40 active:scale-[0.98] ${
        isActive
          ? 'card-surface-warm ring-1 ring-primary/30 shadow-md shadow-primary/5'
          : 'card-surface hover:translate-x-0.5'
      }`}
    >
      <div className="relative flex-shrink-0">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={song.name || ''}
            loading="lazy"
            className={`w-12 h-12 rounded-xl object-cover ${isActive ? 'ring-2 ring-primary/40' : ''}`}
            onError={(e) => { (e.target as HTMLImageElement).src = ''; }}
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-secondary flex-shrink-0" />
        )}
        {isActive && isPlaying && (
          <div className="absolute inset-0 rounded-xl bg-black/30 flex items-center justify-center">
            <WaveBars />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${isActive ? 'text-primary' : 'text-foreground'}`}>
          {song.name || song.title || 'Unknown'}
        </p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">{artist}</p>
        {showMeta && metaParts.length > 0 && (
          <p className="text-[10px] text-muted-foreground/40 truncate mt-0.5">{metaParts.join(' · ')}</p>
        )}
      </div>

      <span className="text-xs text-muted-foreground/60 flex-shrink-0 pl-2 tabular-nums">{dur}</span>
    </div>
  );
};

export default SongItem;
