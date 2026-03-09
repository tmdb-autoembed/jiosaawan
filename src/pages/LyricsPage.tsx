import { useEffect, useState, useRef } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import { getLyrics, getSyncedLyrics, getLyricsById, getImg, getArtistStr, fmtTime } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mic, MicOff, Loader2, Music2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SyncLine {
  time: number;
  text: string;
}

const LyricsPage = () => {
  const { currentSong, currentTime, duration, isPlaying, seek } = usePlayer();
  const navigate = useNavigate();
  const [lyrics, setLyrics] = useState('');
  const [syncedLines, setSyncedLines] = useState<SyncLine[]>([]);
  const [hasSync, setHasSync] = useState(false);
  const [syncSource, setSyncSource] = useState('');
  const [copyright, setCopyright] = useState('');
  const [loading, setLoading] = useState(true);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentSong) { setLoading(false); return; }
    setLoading(true);
    setSyncedLines([]);
    setHasSync(false);
    setSyncSource('');
    setLyrics('');

    // Try synced lyrics first, then lyrics by ID, then lyrics by query
    const syncPromise = getSyncedLyrics(currentSong.id).catch(() => null);
    const idPromise = currentSong.lyricsId
      ? getLyricsById(currentSong.lyricsId).catch(() => null)
      : Promise.resolve(null);
    const fallbackPromise = getLyrics(currentSong).catch(() => null);

    Promise.all([syncPromise, idPromise, fallbackPromise]).then(([syncData, idData, fallbackData]) => {
      // 1. Parse synced lyrics (timed lines)
      if (syncData?.data?.lines?.length) {
        const lines: SyncLine[] = syncData.data.lines
          .map((l: any) => ({
            time: typeof l.startTime === 'number' ? l.startTime : parseFloat(l.startTime || l.time || '0'),
            text: l.text || l.line || l.words || '',
          }))
          .filter((l: SyncLine) => l.text.trim());
        
        if (lines.length > 0) {
          setSyncedLines(lines);
          setHasSync(syncData.data.hasSync !== false);
          setSyncSource(syncData.data.source || syncData.data.syncType || '');
          setCopyright(syncData.data.copyright || '');
          setLoading(false);
          return;
        }
      }

      // 2. Try lyrics by ID
      const lyricsData = idData || fallbackData;
      let text = '';
      let cr = '';
      if (lyricsData?.data) {
        const d = lyricsData.data;
        // Direct lyrics string
        if (typeof d.lyrics === 'string') {
          text = d.lyrics;
          cr = d.copyright || '';
        } else if (d.lyrics && typeof d.lyrics === 'object') {
          // Nested lyrics object
          text = d.lyrics.lyrics || '';
          if (!text && d.lyrics.lyricsHtml) {
            text = d.lyrics.lyricsHtml.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim();
          }
          // Check for lines array in plain lyrics (non-timed)
          if (!text && Array.isArray(d.lyrics.lines)) {
            text = d.lyrics.lines.map((l: any) => l.text || l.line || '').join('\n');
          }
          cr = d.lyrics.copyright || '';
        }
        // Top-level lyricsHtml fallback
        if (!text && d.lyricsHtml) {
          text = d.lyricsHtml.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim();
        }
        // Top-level lines array (non-timed)
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

  const handleLineClick = (time: number) => {
    if (hasSync) {
      seek(time);
    }
  };

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
          <div className="ml-auto flex items-center gap-1.5">
            {syncSource && (
              <span className="px-2 py-0.5 rounded-full bg-secondary/60 text-[9px] font-semibold text-muted-foreground uppercase">
                {syncSource}
              </span>
            )}
            <span className="px-2 py-0.5 rounded-full bg-gradient-primary text-[10px] font-bold text-primary-foreground">
              SYNCED
            </span>
          </div>
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
      ) : hasSync && syncedLines.length > 0 ? (
        /* Synced Lyrics — tap to seek */
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
                onClick={() => handleLineClick(line.time)}
                className={`text-lg leading-relaxed font-bold transition-all duration-300 cursor-pointer select-none ${
                  isActive
                    ? 'text-primary animate-lyric-glow'
                    : isPast
                    ? 'text-muted-foreground/40'
                    : 'text-muted-foreground/60 hover:text-muted-foreground/80'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  {isActive && <Clock className="w-3 h-3 text-primary inline-block flex-shrink-0" />}
                  {line.text}
                </span>
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
