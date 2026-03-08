import { getImg, getArtistStr, fmtTime } from '@/lib/api';
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
  if (song.album?.name) metaParts.push(song.album.name);
  else if (typeof song.album === 'string') metaParts.push(song.album);
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
      className={`flex items-center gap-3 p-2.5 rounded-2xl card-surface cursor-pointer transition-all duration-200 hover:translate-x-0.5 active:scale-[0.98] ${
        isActive ? 'ring-1 ring-primary/40 shadow-md shadow-primary/10' : ''
      }`}
    >
      {imgUrl ? (
        <img
          src={imgUrl}
          alt={song.name || ''}
          loading="lazy"
          className={`w-[50px] h-[50px] rounded-xl object-cover flex-shrink-0 ${isActive ? 'ring-2 ring-primary/50' : ''}`}
          onError={(e) => { (e.target as HTMLImageElement).src = ''; }}
        />
      ) : (
        <div className="w-[50px] h-[50px] rounded-xl bg-secondary flex-shrink-0" />
      )}

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold truncate ${isActive ? 'text-primary' : 'text-foreground'}`}>
          {song.name || song.title || 'Unknown'}
        </p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">{artist}</p>
        {showMeta && metaParts.length > 0 && (
          <p className="text-[10px] text-muted-foreground/50 truncate mt-0.5">{metaParts.join(' • ')}</p>
        )}
      </div>

      {isActive && isPlaying ? (
        <WaveBars />
      ) : (
        <span className="text-xs text-muted-foreground flex-shrink-0 pl-2">{dur}</span>
      )}
    </div>
  );
};

export default SongItem;
