import { useMusicContext } from '@/contexts/MusicContext';
import { Upload, Music, Disc3 } from 'lucide-react';
import { useRef } from 'react';
import { motion } from 'framer-motion';
import TrackItem from '@/components/TrackItem';
import heroImg from '@/assets/music-hero.jpg';

const Index = () => {
  const { tracks, addTracks } = useMusicContext();
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="pb-36 min-h-screen">
      {/* Hero */}
      <div className="relative h-64 overflow-hidden">
        <img src={heroImg} alt="Music visualization" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" />
        <div className="absolute bottom-6 left-6">
          <h1 className="text-3xl font-bold text-gradient-primary">BeatFlow</h1>
          <p className="text-sm text-muted-foreground mt-1">Your music, your vibe</p>
        </div>
      </div>

      <div className="px-4 mt-6">
        {/* Upload section */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => fileRef.current?.click()}
          className="w-full p-6 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center gap-3 group"
        >
          <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center glow-primary group-hover:scale-110 transition-transform">
            <Upload className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">Add Music from Device</p>
            <p className="text-xs text-muted-foreground">Tap to select audio files</p>
          </div>
        </motion.button>
        <input
          ref={fileRef}
          type="file"
          accept="audio/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addTracks(e.target.files)}
        />

        {/* Track list */}
        {tracks.length > 0 ? (
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <Disc3 className="w-5 h-5 text-primary animate-spin-slow" />
              <h2 className="text-lg font-semibold text-foreground">Your Library</h2>
              <span className="text-xs text-muted-foreground ml-auto">{tracks.length} tracks</span>
            </div>
            <div className="space-y-1">
              {tracks.map((track, i) => (
                <TrackItem key={track.id} track={track} index={i} />
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-16 flex flex-col items-center gap-4 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <Music className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <p className="text-foreground font-medium">No tracks yet</p>
              <p className="text-sm text-muted-foreground">Upload audio files to get started</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
