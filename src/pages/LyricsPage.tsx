import { useEffect, useState, useRef } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import { getLyrics, getSyncedLyrics, getImg, getArtistStr } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mic, MicOff, Loader2, Music2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SyncLine {
  time: number;
  text: string;
}

const LyricsPage = () => {
  const { currentSong, currentTime, isPlaying } = usePlayer();
  const navigate = useNavigate();
  const [lyrics, setLyrics] = useState('');
  const [syncedLines, setSyncedLines] = useState<SyncLine[]>([]);
  const [hasSync, setHasSync] = useState(false);
  const [copyright, setCopyright] = useState('');
  const [loading, setLoading] = useState(true);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentSong) { setLoading(false); return; }
    setLoading(true);
    setSyncedLines([]);
    setHasSync(false);

    // Try synced lyrics first
    const syncPromise = getSyncedLyrics(currentSong.id).catch(() => null);
    const fallbackPromise = getLyrics(currentSong).catch(() => null);

    Promise.all([syncPromise, fallbackPromise]).then(([syncData, fallbackData]) => {
      // Parse synced lyrics
      if (syncData?.data?.hasSync && syncData.data.lines?.length) {
        const lines: SyncLine[] = syncData.data.lines
          .map((l: any) => ({
            time: typeof l.startTime === 'number' ? l.startTime : parseFloat(l.startTime || '0'),
            text: l.text || l.line || '',
          }))
          .filter((l: SyncLine) => l.text.trim());
        
        if (lines.length > 0) {
          setSyncedLines(lines);
          setHasSync(true);
          setCopyright(syncData.data.copyright || '');
          setLoading(false);
          return;
        }
      }

      // Fallback to plain lyrics
      let text = '';
      let cr = '';
      if (fallbackData?.data) {
        const d = fallbackData.data;
        if (typeof d.lyrics === 'string') {
          text = d.lyrics;
          cr = d.copyright || '';
        } else if (d.lyrics && typeof d.lyrics === 'object') {
          text = d.lyrics.lyrics || '';
          if (!text && d.lyrics.lyricsHtml) {
            text = d.lyrics.lyricsHtml.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim();
          }
          cr = d.lyrics.copyright || '';
        }
      }
      setLyrics(text);
      setCopyright(cr);
      setLoading(false);
    });
  }, [currentSong]);

  // Auto-scroll synced lyrics
  const activeLine = syncedLines.findIndex((line, i) => {
    const next = syncedLines[i + 1];
    return currentTime >= line.time && (!next || currentTime < next.time);
  });

  useEffect(() => {
    if (!hasSync || activeLine < 0 || !lyricsContainerRef.current) return;
    const el = lyricsContainerRef.current.children[activeLine] as HTMLElement;
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeLine, hasSync]);

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
          <span className="text-sm font-bold text-foreground truncate">
            {hasSync ? 'Synced Lyrics' : 'Lyrics'}
          </span>
        </div>
        {hasSync && (
          <span className="ml-auto px-2 py-0.5 rounded-full bg-gradient-primary text-[10px] font-bold text-primary-foreground">
            SYNCED
          </span>
        )}
      </div>

      {/* Song info */}
      {currentSong && (
        <div className="flex items-center gap-3 mb-6 card-surface rounded-2xl p-3">
          {imgUrl && <img src={imgUrl} alt="" className="w-12 h-12 rounded-xl object-cover" />}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground truncate">{currentSong.name || currentSong.title}</p>
            <p className="text-xs text-muted-foreground truncate">{getArtistStr(currentSong)}</p>
          </div>
          {isPlaying && (
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
              <Music2 className="w-3 h-3 text-primary animate-pulse" />
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Loading lyrics…</p>
        </div>
      ) : hasSync && syncedLines.length > 0 ? (
        /* Synced Lyrics */
        <div ref={lyricsContainerRef} className="space-y-3 py-4">
          {syncedLines.map((line, i) => {
            const isActive = i === activeLine;
            const isPast = activeLine >= 0 && i < activeLine;
            return (
              <motion.p
                key={i}
                initial={{ opacity: 0.4 }}
                animate={{
                  opacity: isActive ? 1 : isPast ? 0.4 : 0.5,
                  scale: isActive ? 1.02 : 1,
                }}
                transition={{ duration: 0.3 }}
                className={`text-lg leading-relaxed font-bold transition-all duration-300 ${
                  isActive
                    ? 'text-primary animate-lyric-glow'
                    : isPast
                    ? 'text-muted-foreground/40'
                    : 'text-muted-foreground/60'
                }`}
              >
                {line.text}
              </motion.p>
            );
          })}
        </div>
      ) : lyrics ? (
        /* Plain Lyrics */
        <div className="card-surface rounded-2xl p-5">
          <pre className="text-sm text-muted-foreground leading-[2] whitespace-pre-wrap font-sans">
            {lyrics}
          </pre>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
          <MicOff className="w-12 h-12 opacity-50" />
          <p className="text-sm">No lyrics available</p>
        </div>
      )}

      {copyright && (
        <p className="text-[10px] text-muted-foreground/40 text-center mt-4">{copyright}</p>
      )}
    </div>
  );
};

export default LyricsPage;
