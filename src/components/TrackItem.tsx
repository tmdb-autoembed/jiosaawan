import { Track, useMusicContext } from '@/contexts/MusicContext';
import { Play, Pause, Heart, MoreVertical } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TrackItemProps {
  track: Track;
  index: number;
}

const TrackItem = ({ track, index }: TrackItemProps) => {
  const { currentTrack, isPlaying, play, pause, favorites, toggleFavorite, playlists, addToPlaylist } = useMusicContext();
  const isActive = currentTrack?.id === track.id;
  const isFav = favorites.includes(track.id);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`flex items-center gap-3 p-3 rounded-xl transition-colors cursor-pointer group ${
        isActive ? 'bg-muted' : 'hover:bg-muted/50'
      }`}
      onClick={() => isActive && isPlaying ? pause() : play(track)}
    >
      <div className={`w-11 h-11 rounded-lg ${track.coverGradient} flex items-center justify-center flex-shrink-0 relative`}>
        {isActive && isPlaying ? (
          <Pause className="w-4 h-4 text-primary-foreground" />
        ) : (
          <Play className="w-4 h-4 text-primary-foreground ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
        {isActive && (
          <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full gradient-primary animate-pulse-glow" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isActive ? 'text-gradient-primary' : 'text-foreground'}`}>
          {track.title}
        </p>
        <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); toggleFavorite(track.id); }}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Heart className={`w-4 h-4 ${isFav ? 'fill-accent text-accent' : 'text-muted-foreground'}`} />
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <button className="opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreVertical className="w-4 h-4 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-card border-border">
          <DropdownMenuItem onClick={() => toggleFavorite(track.id)}>
            {isFav ? 'Remove from Favorites' : 'Add to Favorites'}
          </DropdownMenuItem>
          {playlists.length > 0 && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Add to Playlist</DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="bg-card border-border">
                {playlists.map(p => (
                  <DropdownMenuItem key={p.id} onClick={() => addToPlaylist(p.id, track.id)}>
                    {p.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
};

export default TrackItem;
