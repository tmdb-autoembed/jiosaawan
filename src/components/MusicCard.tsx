import { getImg, getArtistStr, decodeHtml } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '@/contexts/PlayerContext';
import { Play } from 'lucide-react';

interface MusicCardProps {
  item: any;
  type: 'songs' | 'albums' | 'artists' | 'playlists' | 'podcasts' | 'radio' | 'channels';
}

const VIBRANT_COLORS = [
  'hsl(340, 85%, 65%)',
  'hsl(160, 70%, 55%)',
  'hsl(45, 95%, 60%)',
  'hsl(190, 80%, 60%)',
  'hsl(280, 70%, 65%)',
  'hsl(25, 95%, 62%)',
  'hsl(210, 80%, 65%)',
  'hsl(130, 65%, 55%)',
];

const getColor = (id: string, offset = 0) => {
  let hash = 0;
  for (let i = 0; i < (id || '').length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return VIBRANT_COLORS[Math.abs(hash + offset) % VIBRANT_COLORS.length];
};

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

  const nameColor = getColor(item.id || name, 0);
  const subColor = getColor(item.id || name, 3);

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
        <span className="text-[11px] font-semibold truncate max-w-[88px] transition-colors" style={{ color: nameColor }}>{name}</span>
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
        <p className="text-xs font-semibold truncate" style={{ color: nameColor }}>{name}</p>
        <p className="text-[10px] truncate mt-0.5" style={{ color: subColor, opacity: 0.75 }}>{decodeHtml(String(sub))}</p>
      </div>
    </button>
  );
};

export default MusicCard;
