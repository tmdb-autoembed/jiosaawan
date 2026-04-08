import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { getAudioUrl, getImg, getArtistStr, getSongById, getUrlForQuality, getSongSuggestions } from '@/lib/api';
import { toast } from 'sonner';

interface AudioEffects {
  eqBands: number[];
  bassBoost: number;
  reverb: number;
  pitch: number;
  speed: number;
  echo: number;
  enabled: boolean;
}

interface PlayerState {
  currentSong: any | null;
  queue: any[];
  queueIdx: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  shuffle: boolean;
  repeat: boolean;
  likedSongs: any[];
  savedPlaylists: any[];
  preferredQuality: string;
  expandedOpen: boolean;
  queueOpen: boolean;
  audioEffects: AudioEffects;
  autoPlay: boolean;
  customPlaylists: { id: string; name: string; songs: any[] }[];
}

interface PlayerContextType extends PlayerState {
  audioRef: React.RefObject<HTMLAudioElement>;
  loadAndPlay: (song: any) => Promise<void>;
  playQueue: (songs: any[], idx: number) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrev: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setVolume: (v: number) => void;
  seek: (time: number) => void;
  toggleLike: (song: any) => void;
  isLiked: (id: string) => boolean;
  savePlaylist: (pl: any) => void;
  unsavePlaylist: (id: string) => void;
  isPlaylistSaved: (id: string) => boolean;
  setQuality: (q: string) => void;
  setExpandedOpen: (v: boolean) => void;
  setQueueOpen: (v: boolean) => void;
  stopPlayer: () => void;
  setAudioEffects: (effects: AudioEffects) => void;
  toggleAutoPlay: () => void;
  toggleEqualizer: () => void;
  createCustomPlaylist: (name: string) => string;
  addToCustomPlaylist: (playlistId: string, song: any) => void;
  removeFromCustomPlaylist: (playlistId: string, songId: string) => void;
  deleteCustomPlaylist: (playlistId: string) => void;
  renameCustomPlaylist: (playlistId: string, name: string) => void;
}

const DEFAULT_EFFECTS: AudioEffects = {
  eqBands: [0, 0, 0, 0, 0, 0],
  bassBoost: 0,
  reverb: 0,
  pitch: 1,
  speed: 1,
  echo: 0,
  enabled: false,
};

const PlayerContext = createContext<PlayerContextType | null>(null);

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
};

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  // Web Audio API refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const eqNodesRef = useRef<BiquadFilterNode[]>([]);
  const bassBoostNodeRef = useRef<BiquadFilterNode | null>(null);
  const convolverNodeRef = useRef<ConvolverNode | null>(null);
  const reverbGainRef = useRef<GainNode | null>(null);
  const dryGainRef = useRef<GainNode | null>(null);
  const delayNodeRef = useRef<DelayNode | null>(null);
  const feedbackGainRef = useRef<GainNode | null>(null);
  const echoGainRef = useRef<GainNode | null>(null);
  const bypassNodeRef = useRef<GainNode | null>(null);
  const effectsOutputRef = useRef<GainNode | null>(null);

  const [currentSong, setCurrentSong] = useState<any | null>(() => {
    try { const s = localStorage.getItem('currentSong'); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [queue, setQueue] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('playerQueue') || '[]'); } catch { return []; }
  });
  const [queueIdx, setQueueIdx] = useState(() => {
    try { return parseInt(localStorage.getItem('queueIdx') || '-1', 10); } catch { return -1; }
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const resumeTimeRef = useRef<number>(
    (() => { try { return parseFloat(localStorage.getItem('playerTime') || '0'); } catch { return 0; } })()
  );
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [expandedOpen, setExpandedOpen] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const [autoPlay, setAutoPlay] = useState(() => {
    try { return localStorage.getItem('autoPlay') !== 'false'; } catch { return true; }
  });
  const [audioEffects, setAudioEffectsState] = useState<AudioEffects>(() => {
    try { 
      const saved = localStorage.getItem('audioEffects');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_EFFECTS, ...parsed };
      }
      return DEFAULT_EFFECTS;
    } catch { return DEFAULT_EFFECTS; }
  });

  const [likedSongs, setLikedSongs] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('liked') || '[]'); } catch { return []; }
  });
  const [savedPlaylists, setSavedPlaylists] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('savedPlaylists') || '[]'); } catch { return []; }
  });
  const [preferredQuality, setPreferredQuality] = useState(() =>
    localStorage.getItem('preferredQuality') || '320kbps'
  );

  // Persist
  useEffect(() => { localStorage.setItem('liked', JSON.stringify(likedSongs)); }, [likedSongs]);
  useEffect(() => { localStorage.setItem('savedPlaylists', JSON.stringify(savedPlaylists)); }, [savedPlaylists]);
  useEffect(() => { localStorage.setItem('preferredQuality', preferredQuality); }, [preferredQuality]);
  useEffect(() => { localStorage.setItem('audioEffects', JSON.stringify(audioEffects)); }, [audioEffects]);
  useEffect(() => { localStorage.setItem('autoPlay', String(autoPlay)); }, [autoPlay]);

  // Persist playback state
  useEffect(() => { if (currentSong) localStorage.setItem('currentSong', JSON.stringify(currentSong)); }, [currentSong]);
  useEffect(() => { localStorage.setItem('playerQueue', JSON.stringify(queue.slice(0, 50))); }, [queue]);
  useEffect(() => { localStorage.setItem('queueIdx', String(queueIdx)); }, [queueIdx]);
  useEffect(() => {
    const interval = setInterval(() => {
      if (audioRef.current && !audioRef.current.paused) {
        localStorage.setItem('playerTime', String(audioRef.current.currentTime));
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Restore playback on mount
  const hasRestoredRef = useRef(false);
  useEffect(() => {
    if (hasRestoredRef.current || !currentSong || !audioRef.current) return;
    hasRestoredRef.current = true;
    const restoreSong = async () => {
      try {
        let songData = currentSong;
        if (!songData.downloadUrl || !Array.isArray(songData.downloadUrl) || !songData.downloadUrl.length) {
          const res = await getSongById(songData.id);
          songData = (res.data && (Array.isArray(res.data) ? res.data[0] : res.data)) || songData;
          setCurrentSong(songData);
        }
        const url = getAudioUrl(songData, preferredQuality);
        if (!url) return;
        const audio = audioRef.current!;
        audio.src = url;
        audio.currentTime = resumeTimeRef.current;
        audio.playbackRate = audioEffects.speed;
        audio.play().catch(() => {});
        // Media Session
        if ('mediaSession' in navigator) {
          try {
            const artworkUrl = getImg(songData.image, '500x500');
            navigator.mediaSession.metadata = new MediaMetadata({
              title: songData.name || songData.title || 'Unknown',
              artist: getArtistStr(songData),
              album: songData.album?.name || '',
              artwork: artworkUrl ? [{ src: artworkUrl, sizes: '512x512', type: 'image/jpeg' }] : [],
            });
          } catch {}
        }
      } catch {}
    };
    restoreSong();
  }, []);

  // Initialize Web Audio API
  const initAudioContext = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || audioCtxRef.current) return;

    try {
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const source = ctx.createMediaElementSource(audio);
      sourceNodeRef.current = source;

      // Bypass path (clean audio)
      const bypassGain = ctx.createGain();
      bypassGain.gain.value = 1;
      bypassNodeRef.current = bypassGain;

      // Effects output
      const effectsOutput = ctx.createGain();
      effectsOutput.gain.value = 0;
      effectsOutputRef.current = effectsOutput;

      // EQ bands: 60Hz, 230Hz, 910Hz, 3.6kHz, 14kHz, 16kHz
      const freqs = [60, 230, 910, 3600, 14000, 16000];
      const eqNodes = freqs.map((freq, i) => {
        const filter = ctx.createBiquadFilter();
        filter.type = i === 0 ? 'lowshelf' : i === freqs.length - 1 ? 'highshelf' : 'peaking';
        filter.frequency.value = freq;
        filter.gain.value = 0;
        filter.Q.value = 1.0;
        return filter;
      });
      eqNodesRef.current = eqNodes;

      // Bass boost
      const bassBoost = ctx.createBiquadFilter();
      bassBoost.type = 'lowshelf';
      bassBoost.frequency.value = 150;
      bassBoost.gain.value = 0;
      bassBoostNodeRef.current = bassBoost;

      // Reverb (convolver with generated impulse)
      const convolver = ctx.createConvolver();
      const reverbGain = ctx.createGain();
      const dryGain = ctx.createGain();
      reverbGain.gain.value = 0;
      dryGain.gain.value = 1;
      
      // Generate smoother impulse response for reverb (less noise)
      const sampleRate = ctx.sampleRate;
      const length = sampleRate * 2;
      const impulse = ctx.createBuffer(2, length, sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const data = impulse.getChannelData(ch);
        for (let i = 0; i < length; i++) {
          // Smoother decay with less noise
          data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 3.5) * 0.5;
        }
      }
      convolver.buffer = impulse;
      convolverNodeRef.current = convolver;
      reverbGainRef.current = reverbGain;
      dryGainRef.current = dryGain;

      // Echo (delay + feedback)
      const delay = ctx.createDelay(1.0);
      delay.delayTime.value = 0.3;
      const feedbackGain = ctx.createGain();
      feedbackGain.gain.value = 0;
      const echoGain = ctx.createGain();
      echoGain.gain.value = 0;
      delayNodeRef.current = delay;
      feedbackGainRef.current = feedbackGain;
      echoGainRef.current = echoGain;

      const masterGain = ctx.createGain();
      gainNodeRef.current = masterGain;

      // Bypass path: source -> bypassGain -> masterGain
      source.connect(bypassGain);
      bypassGain.connect(masterGain);

      // Effects path: source -> eq chain -> bassBoost -> dry/reverb/echo -> effectsOutput -> masterGain
      let lastNode: AudioNode = source;
      for (const eq of eqNodes) {
        lastNode.connect(eq);
        lastNode = eq;
      }
      lastNode.connect(bassBoost);

      // Split into dry and reverb paths
      bassBoost.connect(dryGain);
      bassBoost.connect(convolver);
      convolver.connect(reverbGain);
      dryGain.connect(effectsOutput);
      reverbGain.connect(effectsOutput);

      // Echo path
      bassBoost.connect(delay);
      delay.connect(feedbackGain);
      feedbackGain.connect(delay);
      delay.connect(echoGain);
      echoGain.connect(effectsOutput);

      effectsOutput.connect(masterGain);
      masterGain.connect(ctx.destination);

      // Set initial bypass state
      if (audioEffects.enabled) {
        bypassGain.gain.value = 0;
        effectsOutput.gain.value = 1;
      } else {
        bypassGain.gain.value = 1;
        effectsOutput.gain.value = 0;
      }
    } catch (e) {
      console.warn('Web Audio API init failed:', e);
    }
  }, []);

  // Apply effects when they change
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.playbackRate = audioEffects.speed;
    }

    // Toggle bypass vs effects
    if (bypassNodeRef.current && effectsOutputRef.current) {
      if (audioEffects.enabled) {
        bypassNodeRef.current.gain.setTargetAtTime(0, audioCtxRef.current?.currentTime || 0, 0.05);
        effectsOutputRef.current.gain.setTargetAtTime(1, audioCtxRef.current?.currentTime || 0, 0.05);
      } else {
        bypassNodeRef.current.gain.setTargetAtTime(1, audioCtxRef.current?.currentTime || 0, 0.05);
        effectsOutputRef.current.gain.setTargetAtTime(0, audioCtxRef.current?.currentTime || 0, 0.05);
      }
    }

    if (!audioEffects.enabled) return;

    // EQ bands
    eqNodesRef.current.forEach((node, i) => {
      if (audioEffects.eqBands[i] !== undefined) {
        const t = audioCtxRef.current?.currentTime || 0;
        node.gain.setTargetAtTime(audioEffects.eqBands[i], t, 0.05);
      }
    });

    // Bass boost
    if (bassBoostNodeRef.current) {
      const t = audioCtxRef.current?.currentTime || 0;
      bassBoostNodeRef.current.gain.setTargetAtTime(audioEffects.bassBoost * 0.25, t, 0.05);
    }

    // Reverb
    if (reverbGainRef.current && dryGainRef.current) {
      const reverbAmount = audioEffects.reverb / 100;
      const t = audioCtxRef.current?.currentTime || 0;
      reverbGainRef.current.gain.setTargetAtTime(reverbAmount * 0.6, t, 0.05);
      dryGainRef.current.gain.setTargetAtTime(1 - reverbAmount * 0.2, t, 0.05);
    }

    // Pitch
    if (audio) {
      (audio as any).preservesPitch = audioEffects.pitch === 1;
    }

    // Echo
    if (delayNodeRef.current && feedbackGainRef.current && echoGainRef.current) {
      const echoAmount = audioEffects.echo / 100;
      const t = audioCtxRef.current?.currentTime || 0;
      feedbackGainRef.current.gain.setTargetAtTime(echoAmount * 0.4, t, 0.05);
      echoGainRef.current.gain.setTargetAtTime(echoAmount * 0.5, t, 0.05);
      delayNodeRef.current.delayTime.setTargetAtTime(0.2 + echoAmount * 0.3, t, 0.05);
    }
  }, [audioEffects]);

  // Fetch song suggestions and append to queue for infinite playback
  const fetchAndAppendSuggestions = useCallback(async (songId: string) => {
    try {
      const res = await getSongSuggestions(songId, 10);
      const suggestions = Array.isArray(res?.data) ? res.data : [];
      if (suggestions.length > 0) {
        setQueue(prev => {
          const existingIds = new Set(prev.map((s: any) => s.id));
          const newSongs = suggestions.filter((s: any) => !existingIds.has(s.id));
          if (newSongs.length > 0) {
            toast.info(`♾️ ${newSongs.length} similar songs added to queue`);
            return [...prev, ...newSongs];
          }
          return prev;
        });
      }
    } catch {}
  }, []);

  // Audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onPlay = () => {
      setIsPlaying(true);
      if (!audioCtxRef.current) initAudioContext();
      if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
    };
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      if (!repeat) playNextInternal();
    };
    const onError = () => {
      toast.error('Audio error — trying next');
      setTimeout(playNextInternal, 1000);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [repeat, shuffle, queue, initAudioContext]);

  const playNextInternal = useCallback(() => {
    if (queue.length === 0) return;
    const isLastSong = queueIdx >= queue.length - 1;
    if (isLastSong && autoPlay && currentSong?.id) {
      fetchAndAppendSuggestions(currentSong.id);
    }
    let nextIdx: number;
    if (shuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else {
      nextIdx = (queueIdx + 1) % queue.length;
    }
    setQueueIdx(nextIdx);
    loadSong(queue[nextIdx]);
  }, [queue, queueIdx, shuffle, autoPlay, currentSong]);

  const loadSong = async (song: any) => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      let songData = song;
      if (!songData.downloadUrl || !Array.isArray(songData.downloadUrl) || !songData.downloadUrl.length) {
        const res = await getSongById(song.id);
        songData = (res.data && (Array.isArray(res.data) ? res.data[0] : res.data)) || song;
      }

      setCurrentSong(songData);

      const url = getAudioUrl(songData, preferredQuality);
      if (!url) { toast.error('No audio URL found'); return; }

      audio.src = url;
      audio.playbackRate = audioEffects.speed;
      audio.play().catch(() => toast.error('Playback failed'));

      // Media Session
      if ('mediaSession' in navigator) {
        try {
          const artworkUrl = getImg(songData.image, '500x500');
          navigator.mediaSession.metadata = new MediaMetadata({
            title: songData.name || songData.title || 'Unknown',
            artist: getArtistStr(songData),
            album: songData.album?.name || '',
            artwork: artworkUrl ? [{ src: artworkUrl, sizes: '512x512', type: 'image/jpeg' }] : [],
          });
        } catch {}
      }
    } catch {
      toast.error('Failed to load song');
    }
  };

  const loadAndPlay = useCallback(async (song: any) => {
    const existingIdx = queue.findIndex(s => s.id === song.id);
    if (existingIdx !== -1) {
      setQueueIdx(existingIdx);
    } else {
      setQueue([song]);
      setQueueIdx(0);
    }
    await loadSong(song);
  }, [queue, preferredQuality, audioEffects.speed]);

  const playQueue = useCallback((songs: any[], idx: number) => {
    setQueue(songs);
    setQueueIdx(idx);
    loadSong(songs[idx]);
  }, [preferredQuality, audioEffects.speed]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play().catch(() => toast.error('Playback failed'));
    else audio.pause();
  }, []);

  const playNext = useCallback(() => {
    if (queue.length === 0) return;
    if (repeat) {
      const audio = audioRef.current;
      if (audio) { audio.currentTime = 0; audio.play(); }
      return;
    }
    const isLastSong = queueIdx >= queue.length - 1;
    if (isLastSong && autoPlay && currentSong?.id) {
      fetchAndAppendSuggestions(currentSong.id);
    }
    let nextIdx: number;
    if (shuffle) nextIdx = Math.floor(Math.random() * queue.length);
    else nextIdx = (queueIdx + 1) % queue.length;
    setQueueIdx(nextIdx);
    loadSong(queue[nextIdx]);
  }, [queue, queueIdx, shuffle, repeat, preferredQuality, audioEffects.speed, autoPlay, currentSong]);

  const playPrev = useCallback(() => {
    if (queue.length === 0) return;
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) { audio.currentTime = 0; return; }
    const prevIdx = (queueIdx - 1 + queue.length) % queue.length;
    setQueueIdx(prevIdx);
    loadSong(queue[prevIdx]);
  }, [queue, queueIdx, preferredQuality, audioEffects.speed]);

  const toggleShuffle = useCallback(() => {
    setShuffle(p => { toast.info(!p ? 'Shuffle on' : 'Shuffle off'); return !p; });
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeat(p => {
      const next = !p;
      if (audioRef.current) audioRef.current.loop = next;
      toast.info(next ? 'Repeat on' : 'Repeat off');
      return next;
    });
  }, []);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    if (audioRef.current) audioRef.current.volume = v;
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const toggleLike = useCallback((song: any) => {
    setLikedSongs(prev => {
      const idx = prev.findIndex(s => s.id === song.id);
      if (idx === -1) {
        toast.success('Added to liked songs ♥');
        return [...prev, song];
      } else {
        toast.info('Removed from liked songs');
        return prev.filter(s => s.id !== song.id);
      }
    });
  }, []);

  const isLiked = useCallback((id: string) => likedSongs.some(s => s.id === id), [likedSongs]);

  const savePlaylist = useCallback((pl: any) => {
    setSavedPlaylists(prev => {
      if (prev.some(p => p.id === pl.id)) return prev;
      toast.success('Playlist saved');
      return [...prev, pl];
    });
  }, []);

  const unsavePlaylist = useCallback((id: string) => {
    setSavedPlaylists(prev => {
      toast.info('Playlist removed');
      return prev.filter(p => p.id !== id);
    });
  }, []);

  const isPlaylistSaved = useCallback((id: string) => savedPlaylists.some(p => p.id === id), [savedPlaylists]);

  const setQuality = useCallback((q: string) => {
    setPreferredQuality(q);
    toast.info(`Quality: ${q}`);
    if (currentSong && audioRef.current) {
      const newUrl = getUrlForQuality(currentSong, q);
      if (newUrl) {
        const pos = audioRef.current.currentTime;
        const wasPlaying = !audioRef.current.paused;
        audioRef.current.src = newUrl;
        audioRef.current.currentTime = pos;
        audioRef.current.playbackRate = audioEffects.speed;
        if (wasPlaying) audioRef.current.play().catch(() => {});
      }
    }
  }, [currentSong, audioEffects.speed]);

  const setAudioEffects = useCallback((effects: AudioEffects) => {
    setAudioEffectsState(effects);
  }, []);

  const toggleEqualizer = useCallback(() => {
    setAudioEffectsState(prev => {
      const next = { ...prev, enabled: !prev.enabled };
      toast.info(next.enabled ? '🎛️ Equalizer ON' : '🎛️ Equalizer OFF');
      return next;
    });
  }, []);

  const toggleAutoPlay = useCallback(() => {
    setAutoPlay(p => {
      toast.info(!p ? '♾️ Auto-play on — similar songs will play next' : 'Auto-play off');
      return !p;
    });
  }, []);

  const stopPlayer = useCallback(() => {
    const audio = audioRef.current;
    if (audio) { audio.pause(); audio.src = ''; }
    setCurrentSong(null);
    setQueue([]);
    setQueueIdx(-1);
    setIsPlaying(false);
    setExpandedOpen(false);
    setQueueOpen(false);
    localStorage.removeItem('currentSong');
    localStorage.removeItem('playerQueue');
    localStorage.removeItem('queueIdx');
    localStorage.removeItem('playerTime');
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (currentSong) togglePlay();
          break;
        case 'ArrowRight':
          if (audioRef.current) audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 10, audioRef.current.duration || 0);
          break;
        case 'ArrowLeft':
          if (audioRef.current) audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0);
          break;
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [currentSong, togglePlay]);

  // Media Session handlers
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.setActionHandler('play', () => audioRef.current?.play());
    navigator.mediaSession.setActionHandler('pause', () => audioRef.current?.pause());
    navigator.mediaSession.setActionHandler('nexttrack', playNext);
    navigator.mediaSession.setActionHandler('previoustrack', playPrev);
  }, [playNext, playPrev]);

  return (
    <PlayerContext.Provider value={{
      currentSong, queue, queueIdx, isPlaying, currentTime, duration,
      volume, shuffle, repeat, likedSongs, savedPlaylists, preferredQuality,
      expandedOpen, queueOpen, audioRef, audioEffects, autoPlay,
      loadAndPlay, playQueue, togglePlay, playNext, playPrev,
      toggleShuffle, toggleRepeat, setVolume, seek, toggleLike, isLiked,
      savePlaylist, unsavePlaylist, isPlaylistSaved, setQuality,
      setExpandedOpen, setQueueOpen, stopPlayer, setAudioEffects, toggleAutoPlay,
      toggleEqualizer,
    }}>
      {children}
      <audio ref={audioRef} preload="metadata" crossOrigin="anonymous" />
    </PlayerContext.Provider>
  );
};
