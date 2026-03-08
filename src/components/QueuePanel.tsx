import { usePlayer } from '@/contexts/PlayerContext';
import SongItem from './SongItem';
import { X, ListMusic } from 'lucide-react';

const QueuePanel = () => {
  const { queue, queueOpen, setQueueOpen } = usePlayer();

  if (!queueOpen) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[400] max-w-[600px] mx-auto glass rounded-t-3xl max-h-[80vh] overflow-y-auto border-t border-primary/15"
      style={{ animation: 'slideUp 0.35s cubic-bezier(0.4,0,0.2,1)', paddingBottom: '120px' }}
    >
      <div className="sticky top-0 glass-vibrant px-4 py-3.5 flex items-center justify-between border-b border-border/15 rounded-t-3xl">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
            <ListMusic className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-foreground text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Queue ({queue.length})</span>
        </div>
        <button onClick={() => setQueueOpen(false)} className="w-8 h-8 rounded-full bg-secondary/40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-3 space-y-2">
        {queue.map((song, i) => (
          <SongItem key={`${song.id}-${i}`} song={song} songList={queue} songIdx={i} showMeta={false} />
        ))}
      </div>
    </div>
  );
};

export default QueuePanel;
