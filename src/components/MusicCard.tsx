import { getImg, getArtistStr, decodeHtml } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '@/contexts/PlayerContext';
import { Play } from 'lucide-react';

interface MusicCardProps {
  item: any;
  type: 'songs' | 'albums' | 'artists' | 'playlists' | 'podcasts' | 'radio' | 'channels';
}

const MusicCard = ({ item, type }: MusicCardProps) => {
  const navigate = useNavigate();
  const { loadAndPlay } = usePlayer();
  const isArtist = type === 'artists';
  const imgUrl = getImg(item.image || item.squareImage, '150x150');
  const name = decodeHtml(item.name || item.title || 'Unknown');
  const sub = type === 'songs' ? getArtistStr(item)
    : type === 'albums' ? (item.primaryArtists || item.year || '')
    : type === 'artists' ? (item.role || 'Artist')
    : type === 'playlists' ? `${item.songCount || 0} songs`
    : type === 'podcasts' ? (item.language || 'Podcast')
    : type === 'radio' ? (item.language || item.description || 'Radio')
    : type === 'channels' ? (item.subType || 'Channel')
    : '';

  const handleClick = () => {
    if (type === 'songs') loadAndPlay(item);
    else if (type === 'albums') navigate(`/album/${item.id || item._id}`);
    else if (type === 'artists') navigate(`/artist/${item.id}`);
    else if (type === 'playlists') navigate(`/playlist/${item.id || item._id}`);
    else if (type === 'podcasts') navigate(`/podcast/${item.id || item._id}`);
    else if (type === 'radio') navigate(`/radio/${encodeURIComponent(item.id)}`);
    else if (type === 'channels') navigate(`/channel/${item.id}`);
  };

  if (isArtist) {
    return (
      <button onClick={handleClick} className="flex flex-col items-center gap-2.5 group min-w-[88px]">
        <div className="relative">
          <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-primary/15 group-hover:ring-primary/40 transition-all duration-300 group-hover:scale-105">
            {imgUrl ? (
              <img src={imgUrl} alt={name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = ''; }} />
            ) : (
              <div className="w-full h-full bg-secondary" />
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg">
            <Play className="w-3 h-3 text-primary-foreground ml-0.5" />
          </div>
        </div>
        <span className="text-[11px] font-semibold text-foreground/80 group-hover:text-foreground truncate max-w-[88px] transition-colors">{name}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="card-surface rounded-2xl overflow-hidden min-w-[148px] max-w-[148px] flex-shrink-0 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/8 active:scale-[0.97] text-left group"
    >
      <div className="relative aspect-square overflow-hidden">
        {imgUrl ? (
          <img src={imgUrl} alt={name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" onError={(e) => { (e.target as HTMLImageElement).src = ''; }} />
        ) : (
          <div className="w-full h-full bg-secondary" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-lg glow-primary">
            <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
          </div>
        </div>
      </div>
      <div className="p-3">
        <p className="text-xs font-semibold text-foreground truncate">{name}</p>
        <p className="text-[10px] text-muted-foreground/60 truncate mt-0.5">{decodeHtml(String(sub))}</p>
      </div>
    </button>
  );
};

export default MusicCard;
