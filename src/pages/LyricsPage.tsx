import { useEffect, useState } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import { getLyricsByQuery, getImg, getArtistStr, fmtTime } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mic, MicOff, Loader2, Music2 } from 'lucide-react';

const LyricsPage = () => {
  const { currentSong, currentTime, duration, isPlaying } = usePlayer();
  const navigate = useNavigate();
  const [lyrics, setLyrics] = useState('');
  const [loading, setLoading] = useState(true);
  const [copyright, setCopyright] = useState('');

  useEffect(() => {
    if (!currentSong) { setLoading(false); return; }
    setLoading(true);
    setLyrics('');

    const songName = currentSong.name || currentSong.title || '';
    const artist = getArtistStr(currentSong);
    const query = artist ? `${songName} ${artist}` : songName;

    if (!query.trim()) { setLoading(false); return; }

    getLyricsByQuery(query, 2).then(data => {
      let text = '';
      let cr = '';
      if (data?.data) {
        const d = data.data;
        // Could be array of results or single
        const results = Array.isArray(d) ? d : d.results ? d.results : [d];
        for (const item of results) {
          if (item.lyrics) {
            if (typeof item.lyrics === 'string') {
              text = item.lyrics;
              cr = item.copyright || '';
              break;
            } else if (typeof item.lyrics === 'object') {
              text = item.lyrics.lyrics || '';
              if (!text && item.lyrics.lyricsHtml) {
                text = item.lyrics.lyricsHtml.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim();
              }
              cr = item.lyrics.copyright || '';
              if (text) break;
            }
          }
          if (item.lyricsHtml) {
            text = item.lyricsHtml.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim();
            cr = item.copyright || '';
            if (text) break;
          }
        }
      }
      setLyrics(text);
      setCopyright(cr);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [currentSong]);

  const imgUrl = currentSong ? getImg(currentSong.image, '500x500') : '';

  return (
    <div className="p-4 pb-40 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-secondary/60 flex items-center justify-center hover:bg-secondary transition-colors">
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center">
            <Mic className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-foreground truncate">Lyrics</span>
        </div>
      </div>

      {/* Song info */}
      {currentSong && (
        <div className="flex items-center gap-3 mb-6 card-surface rounded-2xl p-3">
          {imgUrl && <img src={imgUrl} alt="" className="w-12 h-12 rounded-xl object-cover" />}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground truncate">{currentSong.name || currentSong.title}</p>
            <p className="text-xs text-muted-foreground truncate">{getArtistStr(currentSong)}</p>
          </div>
          <div className="flex items-center gap-2">
            {duration > 0 && (
              <span className="text-[10px] text-muted-foreground/60 font-mono">
                {fmtTime(currentTime)} / {fmtTime(duration)}
              </span>
            )}
            {isPlaying && (
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                <Music2 className="w-3 h-3 text-primary animate-pulse" />
              </div>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Loading lyrics…</p>
        </div>
      ) : lyrics ? (
        <div className="card-surface rounded-2xl p-5">
          <pre className="text-sm text-white leading-[2] whitespace-pre-wrap font-sans">
            {lyrics}
          </pre>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
          <MicOff className="w-12 h-12 opacity-50" />
          <p className="text-sm">No lyrics available</p>
          <p className="text-xs text-muted-foreground/50">Try playing a song with lyrics</p>
        </div>
      )}

      {copyright && (
        <p className="text-[10px] text-muted-foreground/40 text-center mt-4">{copyright}</p>
      )}
    </div>
  );
};

export default LyricsPage;
