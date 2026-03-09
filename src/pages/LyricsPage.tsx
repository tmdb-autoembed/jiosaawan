import { useEffect, useState, useRef } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import { getLyrics, getSyncedLyrics, getLyricsById, getImg, getArtistStr, fmtTime } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mic, MicOff, Loader2, Music2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

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

    // Try lyrics by ID then by query — no sync
    const idPromise = currentSong.lyricsId
      ? getLyricsById(currentSong.lyricsId).catch(() => null)
      : Promise.resolve(null);
    const fallbackPromise = getLyrics(currentSong).catch(() => null);

    Promise.all([idPromise, fallbackPromise]).then(([idData, fallbackData]) => {
      const lyricsData = idData || fallbackData;
      let text = '';
      let cr = '';
      if (lyricsData?.data) {
        const d = lyricsData.data;
        if (typeof d.lyrics === 'string') {
          text = d.lyrics;
          cr = d.copyright || '';
        } else if (d.lyrics && typeof d.lyrics === 'object') {
          text = d.lyrics.lyrics || '';
          if (!text && d.lyrics.lyricsHtml) {
            text = d.lyrics.lyricsHtml.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim();
          }
          if (!text && Array.isArray(d.lyrics.lines)) {
            text = d.lyrics.lines.map((l: any) => l.text || l.line || '').join('\n');
          }
          cr = d.lyrics.copyright || '';
        }
        if (!text && d.lyricsHtml) {
          text = d.lyricsHtml.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim();
        }
        if (!text && Array.isArray(d.lines)) {
          text = d.lines.map((l: any) => l.text || l.line || '').join('\n');
        }
        if (!cr) cr = d.copyright || '';
      }
      setLyrics(text);
      setCopyright(cr);
      setLoading(false);
    });
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
        /* Plain Lyrics — always white */
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
