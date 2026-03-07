import { useEffect, useState } from 'react';
import { searchSongs, searchAlbums, searchArtists, searchPlaylists, extractResults } from '@/lib/api';
import SongItem from '@/components/SongItem';
import MusicCard from '@/components/MusicCard';
import { Flame, Film, TrendingUp, Guitar, ListMusic, Star, Disc3, Loader2 } from 'lucide-react';

const homeConfigs = [
  { title: 'Arijit Singh Hits', icon: Flame, endpoint: 'songs', query: 'arijit singh hindi', type: 'songs' as const },
  { title: 'Bollywood Hits', icon: Film, endpoint: 'songs', query: 'bollywood hits 2024', type: 'songs' as const },
  { title: 'Trending Songs', icon: TrendingUp, endpoint: 'songs', query: 'trending hindi songs', type: 'songs' as const },
  { title: 'Punjabi Hits', icon: Guitar, endpoint: 'songs', query: 'diljit dosanjh punjabi', type: 'songs' as const },
  { title: 'Top Playlists', icon: ListMusic, endpoint: 'playlists', query: 'bollywood top hits', type: 'playlists' as const },
  { title: 'Popular Artists', icon: Star, endpoint: 'artists', query: 'arijit singh', type: 'artists' as const },
  { title: 'Popular Albums', icon: Disc3, endpoint: 'albums', query: 'arijit singh', type: 'albums' as const },
];

const fetchFn: Record<string, (q: string, l: number) => Promise<any>> = {
  songs: (q, l) => searchSongs(q, l),
  albums: (q, l) => searchAlbums(q, l),
  artists: (q, l) => searchArtists(q, l),
  playlists: (q, l) => searchPlaylists(q, l),
};

const HomeSection = ({ config }: { config: typeof homeConfigs[0] }) => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetchFn[config.endpoint](config.query, 20)
      .then(data => setResults(extractResults(data)))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [config]);

  const Icon = config.icon;

  if (loading) {
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Icon className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-foreground">{config.title}</h2>
        </div>
        <div className="flex justify-center py-6">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  if (!results.length) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-bold text-foreground">{config.title}</h2>
      </div>

      {config.type === 'songs' ? (
        <>
          <div className="space-y-2">
            {(expanded ? results : results.slice(0, 5)).map((song, i) => (
              <SongItem key={song.id} song={song} songList={results} songIdx={i} />
            ))}
          </div>
          {results.length > 5 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full mt-2 py-2.5 nm-surface nm-raised rounded-lg text-primary text-sm font-bold active:nm-inset active:scale-[0.98] transition-all"
            >
              {expanded ? 'Show Less' : `Show More (${results.length - 5} more)`}
            </button>
          )}
        </>
      ) : config.type === 'artists' ? (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {results.slice(0, 10).map(item => (
            <MusicCard key={item.id} item={item} type="artists" />
          ))}
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
          {results.slice(0, 10).map(item => (
            <MusicCard key={item.id || item._id} item={item} type={config.type} />
          ))}
        </div>
      )}
    </div>
  );
};

const Index = () => {
  return (
    <div className="p-4 pb-40">
      {homeConfigs.map((config, i) => (
        <HomeSection key={i} config={config} />
      ))}
    </div>
  );
};

export default Index;
