import { getImg, getArtistStr } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '@/contexts/PlayerContext';
import { Play } from 'lucide-react';

interface MusicCardProps {
  item: any;
  type: 'songs' | 'albums' | 'artists' | 'playlists' | 'podcasts';
}

const MusicCard = ({ item, type }: MusicCardProps) => {
  const navigate = useNavigate();
  const { loadAndPlay } = usePlayer();
  const isArtist = type === 'artists';
  const imgUrl = getImg(item.image || item.squareImage, '150x150');
  const name = item.name || item.title || 'Unknown';
  const sub = type === 'songs' ? getArtistStr(item)
    : type === 'albums' ? (item.primaryArtists || item.year || '')
    : type === 'artists' ? (item.role || 'Artist')
    : type === 'playlists' ? `${item.songCount || 0} songs`
    : type === 'podcasts' ? (item.language || 'Podcast')
    : '';

  const handleClick = () => {
    if (type === 'songs') loadAndPlay(item);
    else if (type === 'albums') navigate(`/album/${item.id || item._id}`);
    else if (type === 'artists') navigate(`/artist/${item.id}`);
    else if (type === 'playlists') navigate(`/playlist/${item.id || item._id}`);
    else if (type === 'podcasts') navigate(`/podcast/${item.id || item._id}`);
  };

  if (isArtist) {
    return (
      <button onClick={handleClick} className="flex flex-col items-center gap-2 group min-w-[80px]">
        <div className="w-[76px] h-[76px] rounded-full overflow-hidden ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all duration-300 group-hover:scale-105">
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
      className="card-surface rounded-2xl overflow-hidden min-w-[140px] max-w-[140px] flex-shrink-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 active:scale-[0.97] text-left group"
    >
      <div className="relative aspect-square overflow-hidden">
        {imgUrl ? (
          <img src={imgUrl} alt={name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" onError={(e) => { (e.target as HTMLImageElement).src = ''; }} />
        ) : (
          <div className="w-full h-full bg-secondary" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-lg glow-primary">
            <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
          </div>
        </div>
      </div>
      <div className="p-2.5">
        <p className="text-xs font-bold text-foreground truncate">{name}</p>
        <p className="text-[10px] text-muted-foreground truncate mt-0.5">{sub}</p>
      </div>
    </button>
  );
};

export default MusicCard;
