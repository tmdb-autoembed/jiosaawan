import { useEffect, useState } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import { getLyrics } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mic, MicOff, Loader2 } from 'lucide-react';

const LyricsPage = () => {
  const { currentSong } = usePlayer();
  const navigate = useNavigate();
  const [lyrics, setLyrics] = useState('');
  const [copyright, setCopyright] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentSong) { setLoading(false); return; }
    setLoading(true);
    getLyrics(currentSong).then(data => {
      let text = '';
      let cr = '';
      if (data?.data) {
        const d = data.data;
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
    }).catch(() => {}).finally(() => setLoading(false));
  }, [currentSong]);

  return (
    <div className="p-4 pb-40">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full nm-surface nm-raised flex items-center justify-center active:nm-inset">
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <Mic className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-foreground truncate">
          {currentSong?.name || currentSong?.title || 'Lyrics'}
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
      ) : lyrics ? (
        <>
          <pre className="nm-surface nm-inset rounded-lg p-5 text-sm text-muted-foreground leading-[2] whitespace-pre-wrap font-sans">
            {lyrics}
          </pre>
          {copyright && (
            <p className="text-[11px] text-muted-foreground/50 text-center mt-3">{copyright}</p>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
          <MicOff className="w-12 h-12" />
          <p>No lyrics available</p>
        </div>
      )}
    </div>
  );
};

export default LyricsPage;
