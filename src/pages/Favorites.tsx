import { useMusicContext } from '@/contexts/MusicContext';
import { Heart } from 'lucide-react';
import TrackItem from '@/components/TrackItem';

const Favorites = () => {
  const { tracks, favorites } = useMusicContext();
  const favTracks = tracks.filter(t => favorites.includes(t.id));

  return (
    <div className="pb-36 min-h-screen px-4 pt-6">
      <h1 className="text-2xl font-bold text-gradient-accent mb-6">Favorites</h1>

      {favTracks.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
            <Heart className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-foreground font-medium">No favorites yet</p>
          <p className="text-sm text-muted-foreground">Heart a track to add it here</p>
        </div>
      ) : (
        <div className="space-y-1">
          {favTracks.map((t, i) => <TrackItem key={t.id} track={t} index={i} />)}
        </div>
      )}
    </div>
  );
};

export default Favorites;
