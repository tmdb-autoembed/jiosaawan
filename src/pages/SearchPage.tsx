import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchSongs, searchAlbums, searchArtists, searchPlaylists, extractResults } from '@/lib/api';
import SongItem from '@/components/SongItem';
import MusicCard from '@/components/MusicCard';
import { Search as SearchIcon, Loader2, ChevronRight } from 'lucide-react';

const SearchPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const q = params.get('q') || '';
  const [loading, setLoading] = useState(true);
  const [songs, setSongs] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    Promise.all([
      searchSongs(q, 5).catch(() => null),
      searchAlbums(q, 5).catch(() => null),
      searchArtists(q, 5).catch(() => null),
      searchPlaylists(q, 5).catch(() => null),
    ]).then(([s, al, ar, pl]) => {
      setSongs(extractResults(s));
      setAlbums(extractResults(al));
      setArtists(extractResults(ar));
      setPlaylists(extractResults(pl));
    }).finally(() => setLoading(false));
  }, [q]);

  if (!q) return <div className="p-8 text-center text-muted-foreground">Enter a search query</div>;
  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;

  const noResults = !songs.length && !albums.length && !artists.length && !playlists.length;
  if (noResults) return (
    <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
      <SearchIcon className="w-12 h-12 opacity-50" />
      <p>No results found</p>
    </div>
  );

  const Section = ({ title, emoji, seeAllPath, children }: { title: string; emoji: string; seeAllPath: string; children: React.ReactNode }) => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-black text-foreground flex items-center gap-2">{emoji} {title}</h2>
        <button onClick={() => navigate(seeAllPath)} className="text-xs text-primary font-bold flex items-center gap-0.5">
          See all <ChevronRight className="w-3 h-3" />
        </button>
      </div>
      {children}
    </div>
  );

  return (
    <div className="p-4 pb-40">
      {songs.length > 0 && (
        <Section title="Songs" emoji="🎵" seeAllPath={`/search/songs?q=${encodeURIComponent(q)}`}>
          <div className="space-y-1.5">
            {songs.map((s, i) => <SongItem key={s.id} song={s} songList={songs} songIdx={i} />)}
          </div>
        </Section>
      )}
      {albums.length > 0 && (
        <Section title="Albums" emoji="💿" seeAllPath={`/search/albums?q=${encodeURIComponent(q)}`}>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {albums.map(a => <MusicCard key={a.id} item={a} type="albums" />)}
          </div>
        </Section>
      )}
      {artists.length > 0 && (
        <Section title="Artists" emoji="⭐" seeAllPath={`/search/artists?q=${encodeURIComponent(q)}`}>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {artists.map(a => <MusicCard key={a.id} item={a} type="artists" />)}
          </div>
        </Section>
      )}
      {playlists.length > 0 && (
        <Section title="Playlists" emoji="📋" seeAllPath={`/search/playlists?q=${encodeURIComponent(q)}`}>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {playlists.map(p => <MusicCard key={p.id} item={p} type="playlists" />)}
          </div>
        </Section>
      )}
    </div>
  );
};

export default SearchPage;
