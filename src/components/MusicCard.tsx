import { getImg, getArtistStr } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '@/contexts/PlayerContext';
import { Play } from 'lucide-react';

interface MusicCardProps {
  item: any;
  type: 'songs' | 'albums' | 'artists' | 'playlists';
}

const MusicCard = ({ item, type }: MusicCardProps) => {
  const navigate = useNavigate();
  const { loadAndPlay } = usePlayer();
  const isArtist = type === 'artists';
  const imgUrl = getImg(item.image, '150x150');
  const name = item.name || item.title || 'Unknown';
  const sub = type === 'songs' ? getArtistStr(item)
    : type === 'albums' ? (item.primaryArtists || '')
    : type === 'artists' ? (item.role || 'Artist')
    : type === 'playlists' ? `${item.songCount || 0} songs`
    : '';

  const handleClick = () => {
    if (type === 'songs') loadAndPlay(item);
    else if (type === 'albums') navigate(`/album/${item.id || item._id}`);
    else if (type === 'artists') navigate(`/artist/${item.id}`);
    else if (type === 'playlists') navigate(`/playlist/${item.id || item._id}`);
  };

  if (isArtist) {
    return (
      <button
        onClick={handleClick}
        className="flex flex-col items-center gap-1.5 group"
      >
        <div className="w-[80px] h-[80px] rounded-full nm-surface nm-raised overflow-hidden transition-transform duration-200 group-hover:scale-105">
          {imgUrl ? (
            <img src={imgUrl} alt={name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = ''; }} />
          ) : (
            <div className="w-full h-full bg-secondary" />
          )}
        </div>
        <span className="text-[11px] font-semibold text-foreground truncate max-w-[80px]">{name}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="nm-surface nm-raised rounded-lg overflow-hidden min-w-[130px] max-w-[130px] flex-shrink-0 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:nm-inset active:scale-[0.97] text-left"
    >
      <div className="relative aspect-square overflow-hidden group">
        {imgUrl ? (
          <img src={imgUrl} alt={name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" onError={(e) => { (e.target as HTMLImageElement).src = ''; }} />
        ) : (
          <div className="w-full h-full bg-secondary" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="w-8 h-8 text-primary drop-shadow-[0_0_8px_hsl(145,63%,42%)]" />
        </div>
      </div>
      <div className="p-2">
        <p className="text-xs font-semibold text-foreground truncate">{name}</p>
        <p className="text-[11px] text-muted-foreground truncate mt-0.5">{sub}</p>
      </div>
    </button>
  );
};

export default MusicCard;
