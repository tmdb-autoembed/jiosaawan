import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchSongs, searchAlbums, searchArtists, searchPlaylists, extractResults } from '@/lib/api';
import SongItem from '@/components/SongItem';
import MusicCard from '@/components/MusicCard';
import { Search as SearchIcon, Loader2 } from 'lucide-react';

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

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const noResults = !songs.length && !albums.length && !artists.length && !playlists.length;

  if (noResults) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
        <SearchIcon className="w-12 h-12" />
        <p>No results found</p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-40">
      {songs.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">🎵 Songs</h2>
            <button onClick={() => navigate(`/search/songs?q=${encodeURIComponent(q)}`)} className="text-xs text-primary font-semibold">See all →</button>
          </div>
          <div className="space-y-2">
            {songs.map((s, i) => <SongItem key={s.id} song={s} songList={songs} songIdx={i} />)}
          </div>
        </div>
      )}

      {albums.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-foreground">💿 Albums</h2>
            <button onClick={() => navigate(`/search/albums?q=${encodeURIComponent(q)}`)} className="text-xs text-primary font-semibold">See all →</button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {albums.map(a => <MusicCard key={a.id} item={a} type="albums" />)}
          </div>
        </div>
      )}

      {artists.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-foreground">⭐ Artists</h2>
            <button onClick={() => navigate(`/search/artists?q=${encodeURIComponent(q)}`)} className="text-xs text-primary font-semibold">See all →</button>
          </div>
          <div className="flex flex-wrap gap-3">
            {artists.map(a => <MusicCard key={a.id} item={a} type="artists" />)}
          </div>
        </div>
      )}

      {playlists.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-foreground">📋 Playlists</h2>
            <button onClick={() => navigate(`/search/playlists?q=${encodeURIComponent(q)}`)} className="text-xs text-primary font-semibold">See all →</button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {playlists.map(p => <MusicCard key={p.id} item={p} type="playlists" />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
