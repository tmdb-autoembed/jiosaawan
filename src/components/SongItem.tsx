import { useState } from 'react';
import { getImg, getArtistStr, fmtTime, decodeHtml } from '@/lib/api';
import { usePlayer } from '@/contexts/PlayerContext';
import WaveBars from './WaveBars';
import { Music, Plus, Check } from 'lucide-react';


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
  const { currentSong, isPlaying, playQueue, loadAndPlay, customPlaylists, addToCustomPlaylist } = usePlayer();
  const [showPlMenu, setShowPlMenu] = useState(false);
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


  const artistColor = getColor(song.id || '', 2);
  const metaColor = getColor(song.id || '', 4);

  return (
    <div
      onClick={handleClick}
      className={`group flex items-center gap-3 rounded-xl cursor-pointer transition-all duration-200 active:scale-[0.98] px-2.5 py-2 ${
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
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover ${isActive ? 'ring-2 ring-primary/40' : ''}`}
            onError={(e) => { (e.target as HTMLImageElement).src = ''; }}
          />
        ) : (
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-secondary flex items-center justify-center">
            <Music className="w-5 h-5 text-muted-foreground/40" />
          </div>
        )}
        {isActive && isPlaying && (
          <div className="absolute inset-0 rounded-lg bg-black/30 flex items-center justify-center">
            <WaveBars />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate text-white">
          {decodeHtml(song.name || song.title || 'Unknown')}
        </p>
        <p className="text-xs truncate mt-0.5" style={{ color: artistColor, opacity: 0.85 }}>{artist}</p>
        {showMeta && metaParts.length > 0 && (
          <p className="text-[10px] truncate mt-0.5" style={{ color: metaColor, opacity: 0.6 }}>{metaParts.join(' · ')}</p>
        )}
      </div>

      <span className="text-xs flex-shrink-0 tabular-nums pr-1" style={{ color: 'hsl(45, 95%, 65%)', opacity: 0.7 }}>{dur}</span>

      {/* Add to playlist */}
      <div className="relative flex-shrink-0">
        <button
          onClick={(e) => { e.stopPropagation(); setShowPlMenu(!showPlMenu); }}
          className="w-7 h-7 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        {showPlMenu && customPlaylists.length > 0 && (
          <div
            className="absolute right-0 bottom-8 z-50 rounded-xl py-1 min-w-[140px] shadow-xl"
            style={{ background: 'hsl(250, 20%, 14%)' }}
            onClick={e => e.stopPropagation()}
          >
            {customPlaylists.map(pl => {
              const inPl = pl.songs.some(s => s.id === song.id);
              return (
                <button
                  key={pl.id}
                  onClick={() => { addToCustomPlaylist(pl.id, song); setShowPlMenu(false); }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10 flex items-center gap-2"
                >
                  {inPl ? <Check className="w-3 h-3 text-green-400" /> : <Plus className="w-3 h-3" />}
                  {pl.name}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SongItem;
