import { usePlayer } from '@/contexts/PlayerContext';
import SongItem from './SongItem';
import { X } from 'lucide-react';

const QueuePanel = () => {
  const { queue, queueOpen, setQueueOpen } = usePlayer();

  if (!queueOpen) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[400] max-w-[600px] mx-auto glass rounded-t-2xl max-h-[80vh] overflow-y-auto border-t border-border/30"
      style={{ animation: 'slideUp 0.35s cubic-bezier(0.4,0,0.2,1)', paddingBottom: '120px' }}
    >
      <div className="sticky top-0 glass px-4 py-3 flex items-center justify-between border-b border-border/20">
        <span className="font-bold text-foreground text-sm">🎵 Queue ({queue.length})</span>
        <button onClick={() => setQueueOpen(false)} className="text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
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
