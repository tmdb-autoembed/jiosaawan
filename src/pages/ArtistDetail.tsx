import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getArtistById, getArtistSongs, getArtistAlbums, getRelatedArtists, getImg, extractResults, extractBioText, decodeHtml } from '@/lib/api';
import { usePlayer } from '@/contexts/PlayerContext';
import SongItem from '@/components/SongItem';
import MusicCard from '@/components/MusicCard';
import { ArrowLeft, Play, Loader2, Users, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const ArtistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playQueue } = usePlayer();
  const [artist, setArtist] = useState<any>(null);
  const [songs, setSongs] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bioOpen, setBioOpen] = useState(false);
  const [isFav, setIsFav] = useState(false);

  // Favorite logic using localStorage
  const FAV_KEY = 'fav_artists';
  const getFavs = (): any[] => { try { return JSON.parse(localStorage.getItem(FAV_KEY) || '[]'); } catch { return []; } };

  useEffect(() => {
    if (id) setIsFav(getFavs().some((a: any) => a.id === id));
  }, [id]);

  const toggleFav = () => {
    if (!artist) return;
    const favs = getFavs();
    if (isFav) {
      localStorage.setItem(FAV_KEY, JSON.stringify(favs.filter((a: any) => a.id !== id)));
      setIsFav(false);
      toast.success('Removed from favorites');
    } else {
      favs.push({ id: artist.id || id, name: artist.name, image: artist.image });
      localStorage.setItem(FAV_KEY, JSON.stringify(favs));
      setIsFav(true);
      toast.success('Added to favorites ❤️');
    }
  };

  // Infinite scroll state
  const [songsPage, setSongsPage] = useState(1);
  const [songsHasMore, setSongsHasMore] = useState(true);
  const [songsLoadingMore, setSongsLoadingMore] = useState(false);
  const [albumsPage, setAlbumsPage] = useState(1);
  const [albumsHasMore, setAlbumsHasMore] = useState(true);
  const [albumsLoadingMore, setAlbumsLoadingMore] = useState(false);

  const songsSentinelRef = useRef<HTMLDivElement>(null);
  const albumsSentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setSongsPage(1); setAlbumsPage(1);
    setSongsHasMore(true); setAlbumsHasMore(true);
    Promise.all([
      getArtistById(id),
      getArtistSongs(id, 1, 20).catch(() => null),
      getArtistAlbums(id, 1).catch(() => null),
      getRelatedArtists(id).catch(() => null),
    ]).then(([artistRes, songsRes, albumsRes, relatedRes]) => {
      const a = artistRes?.data || artistRes;
      setArtist(a);

      let s = songsRes ? extractResults(songsRes) : [];
      if (!s.length && a?.topSongs) s = a.topSongs;
      setSongs(s);
      setSongsHasMore(s.length >= 20);

      let al = albumsRes ? extractResults(albumsRes) : [];
      if (!al.length && a?.topAlbums) al = a.topAlbums;
      setAlbums(al);
      setAlbumsHasMore(al.length >= 20);

      const rel = relatedRes?.data?.results || relatedRes?.data || [];
      setRelated(Array.isArray(rel) ? rel : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const loadMoreSongs = useCallback(async () => {
    if (!id || songsLoadingMore || !songsHasMore) return;
    setSongsLoadingMore(true);
    try {
      const next = songsPage + 1;
      const res = await getArtistSongs(id, next, 20);
      const items = extractResults(res);
      if (items.length === 0) { setSongsHasMore(false); }
      else { setSongs(p => [...p, ...items]); setSongsPage(next); setSongsHasMore(items.length >= 20); }
    } catch {} finally { setSongsLoadingMore(false); }
  }, [id, songsPage, songsHasMore, songsLoadingMore]);

  const loadMoreAlbums = useCallback(async () => {
    if (!id || albumsLoadingMore || !albumsHasMore) return;
    setAlbumsLoadingMore(true);
    try {
      const next = albumsPage + 1;
      const res = await getArtistAlbums(id, next);
      const items = extractResults(res);
      if (items.length === 0) { setAlbumsHasMore(false); }
      else { setAlbums(p => [...p, ...items]); setAlbumsPage(next); setAlbumsHasMore(items.length >= 20); }
    } catch {} finally { setAlbumsLoadingMore(false); }
  }, [id, albumsPage, albumsHasMore, albumsLoadingMore]);

  // Observers
  useEffect(() => {
    if (!songsSentinelRef.current || !songsHasMore) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) loadMoreSongs(); }, { rootMargin: '300px' });
    obs.observe(songsSentinelRef.current);
    return () => obs.disconnect();
  }, [songsHasMore, loadMoreSongs]);

  useEffect(() => {
    if (!albumsSentinelRef.current || !albumsHasMore) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) loadMoreAlbums(); }, { rootMargin: '300px' });
    obs.observe(albumsSentinelRef.current);
    return () => obs.disconnect();
  }, [albumsHasMore, loadMoreAlbums]);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;
  if (!artist) return <div className="text-center py-16 text-muted-foreground">Artist not found</div>;

  const imgUrl = getImg(artist.image, '500x500');
  const bio = extractBioText(artist.bio);
  const followers = artist.followerCount || artist.fanCount || '';

  return (
    <div className="p-4 pb-40">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-secondary/60 flex items-center justify-center hover:bg-secondary">
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <span className="text-sm font-bold text-foreground truncate">{decodeHtml(artist.name || 'Artist')}</span>
      </div>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center mb-6">
        <div className="relative">
          <div className="absolute inset-0 rounded-full blur-xl opacity-30" style={{ background: 'var(--gradient-primary)' }} />
          <div className="w-28 h-28 rounded-full overflow-hidden ring-3 ring-primary/30 relative">
            {imgUrl ? <img src={imgUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-secondary" />}
          </div>
        </div>
        <h2 className="text-xl font-black text-foreground mt-3">{decodeHtml(artist.name)}</h2>
        {followers && <p className="text-xs text-muted-foreground mt-1">{Number(followers).toLocaleString()} followers</p>}
      </motion.div>

      {/* Bio */}
      {bio && (
        <div className="mb-6">
          <button onClick={() => setBioOpen(!bioOpen)} className="text-sm font-bold text-foreground flex items-center justify-between w-full mb-2">
            <span>About</span>
            <span className="text-muted-foreground text-xs">{bioOpen ? '▲' : '▼'}</span>
          </button>
          {bioOpen && <div className="card-surface rounded-2xl p-4 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{decodeHtml(bio)}</div>}
        </div>
      )}

      {/* Songs - Infinite Scroll */}
      {songs.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-rose-500 to-orange-400 flex items-center justify-center">
                <Play className="w-3 h-3 text-white ml-0.5" />
              </div>
              <h3 className="text-sm font-black text-foreground">Top Songs</h3>
            </div>
            <button onClick={() => playQueue(songs, 0)} className="px-3 py-1 rounded-full bg-gradient-primary text-primary-foreground text-xs font-bold flex items-center gap-1">
              <Play className="w-3 h-3" /> Play All
            </button>
          </div>
          <div className="space-y-1.5">
            {songs.map((s, i) => <SongItem key={`${s.id}-${i}`} song={s} songList={songs} songIdx={i} />)}
          </div>
          {songsHasMore ? (
            <div ref={songsSentinelRef} className="flex justify-center py-3">
              {songsLoadingMore && <Loader2 className="w-5 h-5 text-primary animate-spin" />}
            </div>
          ) : (
            <p className="text-center text-xs text-muted-foreground/50 py-3 font-medium">— No more songs —</p>
          )}
        </div>
      )}

      {/* Albums - Infinite Scroll */}
      {albums.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-violet-500 to-purple-400 flex items-center justify-center">
              <Loader2 className="w-3 h-3 text-white" />
            </div>
            <h3 className="text-sm font-black text-foreground">Albums</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {albums.map(a => <MusicCard key={a.id} item={a} type="albums" />)}
          </div>
          {albumsHasMore ? (
            <div ref={albumsSentinelRef} className="flex justify-center py-3">
              {albumsLoadingMore && <Loader2 className="w-5 h-5 text-primary animate-spin" />}
            </div>
          ) : (
            <p className="text-center text-xs text-muted-foreground/50 py-3 font-medium">— No more albums —</p>
          )}
        </div>
      )}

      {/* Related Artists */}
      {related.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-300 flex items-center justify-center">
              <Users className="w-3 h-3 text-white" />
            </div>
            <h3 className="text-sm font-black text-foreground">Related Artists</h3>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {related.map((a: any) => <MusicCard key={a.id} item={a} type="artists" />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtistDetail;
