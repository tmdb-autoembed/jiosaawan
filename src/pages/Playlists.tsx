import { useMusicContext } from '@/contexts/MusicContext';
import { Plus, Trash2, Music } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TrackItem from '@/components/TrackItem';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Playlists = () => {
  const { playlists, createPlaylist, deletePlaylist, tracks } = useMusicContext();
  const [newName, setNewName] = useState('');
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleCreate = () => {
    if (newName.trim()) {
      createPlaylist(newName.trim());
      setNewName('');
      setOpen(false);
    }
  };

  return (
    <div className="pb-36 min-h-screen px-4 pt-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gradient-primary">Playlists</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center glow-accent hover:scale-105 transition-transform">
              <Plus className="w-5 h-5 text-accent-foreground" />
            </button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">New Playlist</DialogTitle>
            </DialogHeader>
            <div className="flex gap-2 mt-2">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Playlist name..."
                className="bg-muted border-border text-foreground"
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
              <Button onClick={handleCreate} className="gradient-primary text-primary-foreground">
                Create
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {playlists.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
            <Music className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-foreground font-medium">No playlists yet</p>
          <p className="text-sm text-muted-foreground">Create your first playlist</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {playlists.map((pl, i) => {
              const plTracks = tracks.filter(t => pl.tracks.includes(t.id));
              const isExpanded = expandedId === pl.id;
              return (
                <motion.div
                  key={pl.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl bg-card border border-border overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : pl.id)}
                    className="w-full flex items-center gap-3 p-4"
                  >
                    <div className={`w-12 h-12 rounded-xl ${pl.coverGradient} flex items-center justify-center`}>
                      <Music className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-foreground">{pl.name}</p>
                      <p className="text-xs text-muted-foreground">{pl.tracks.length} tracks</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deletePlaylist(pl.id); }}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </button>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden border-t border-border"
                      >
                        <div className="p-2">
                          {plTracks.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-4">
                              No tracks — add from your library
                            </p>
                          ) : (
                            plTracks.map((t, j) => <TrackItem key={t.id} track={t} index={j} />)
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Playlists;
