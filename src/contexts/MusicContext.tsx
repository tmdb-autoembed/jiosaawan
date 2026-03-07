import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  file?: File;
  url?: string;
  coverGradient: string;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: string[];
  coverGradient: string;
  createdAt: Date;
}

export interface UserProfile {
  name: string;
  avatar: string;
  favoriteGenre: string;
  totalListened: number;
}

interface MusicContextType {
  tracks: Track[];
  playlists: Playlist[];
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  shuffle: boolean;
  repeat: 'off' | 'all' | 'one';
  profile: UserProfile;
  queue: Track[];
  addTracks: (files: FileList) => void;
  play: (track?: Track) => void;
  pause: () => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (v: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  createPlaylist: (name: string) => void;
  addToPlaylist: (playlistId: string, trackId: string) => void;
  removeFromPlaylist: (playlistId: string, trackId: string) => void;
  deletePlaylist: (id: string) => void;
  updateProfile: (p: Partial<UserProfile>) => void;
  favorites: string[];
  toggleFavorite: (trackId: string) => void;
}

const gradients = [
  'gradient-primary', 'gradient-accent', 'gradient-warm', 'gradient-cool',
];

const MusicContext = createContext<MusicContextType | null>(null);

export const useMusicContext = () => {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error('useMusicContext must be used within MusicProvider');
  return ctx;
};

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    const saved = localStorage.getItem('playlists');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<'off' | 'all' | 'one'>('off');
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('profile');
    return saved ? JSON.parse(saved) : {
      name: 'Music Lover',
      avatar: '🎵',
      favoriteGenre: 'All Genres',
      totalListened: 0,
    };
  });
  const [queue, setQueue] = useState<Track[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    localStorage.setItem('playlists', JSON.stringify(playlists));
  }, [playlists]);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      });
      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current?.duration || 0);
      });
      audioRef.current.addEventListener('ended', () => {
        handleTrackEnd();
      });
    }
  }, []);

  const handleTrackEnd = useCallback(() => {
    if (repeat === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      next();
    }
  }, [repeat]);

  const addTracks = useCallback((files: FileList) => {
    const newTracks: Track[] = Array.from(files).filter(f => f.type.startsWith('audio/')).map((file, i) => ({
      id: `${Date.now()}-${i}`,
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: 'Unknown Artist',
      album: 'Unknown Album',
      duration: 0,
      file,
      url: URL.createObjectURL(file),
      coverGradient: gradients[Math.floor(Math.random() * gradients.length)],
    }));
    setTracks(prev => [...prev, ...newTracks]);
    setQueue(prev => [...prev, ...newTracks]);
  }, []);

  const play = useCallback((track?: Track) => {
    const t = track || currentTrack;
    if (!t || !audioRef.current) return;
    if (t.id !== currentTrack?.id) {
      audioRef.current.src = t.url || '';
      setCurrentTrack(t);
    }
    audioRef.current.play();
    setIsPlaying(true);
  }, [currentTrack]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, play, pause]);

  const next = useCallback(() => {
    if (tracks.length === 0) return;
    const idx = tracks.findIndex(t => t.id === currentTrack?.id);
    let nextIdx: number;
    if (shuffle) {
      nextIdx = Math.floor(Math.random() * tracks.length);
    } else {
      nextIdx = (idx + 1) % tracks.length;
    }
    play(tracks[nextIdx]);
  }, [tracks, currentTrack, shuffle, play]);

  const previous = useCallback(() => {
    if (tracks.length === 0) return;
    const idx = tracks.findIndex(t => t.id === currentTrack?.id);
    const prevIdx = idx <= 0 ? tracks.length - 1 : idx - 1;
    play(tracks[prevIdx]);
  }, [tracks, currentTrack, play]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    if (audioRef.current) audioRef.current.volume = v;
  }, []);

  const toggleShuffle = useCallback(() => setShuffle(p => !p), []);
  const toggleRepeat = useCallback(() => {
    setRepeat(p => p === 'off' ? 'all' : p === 'all' ? 'one' : 'off');
  }, []);

  const createPlaylist = useCallback((name: string) => {
    setPlaylists(prev => [...prev, {
      id: Date.now().toString(),
      name,
      tracks: [],
      coverGradient: gradients[Math.floor(Math.random() * gradients.length)],
      createdAt: new Date(),
    }]);
  }, []);

  const addToPlaylist = useCallback((playlistId: string, trackId: string) => {
    setPlaylists(prev => prev.map(p =>
      p.id === playlistId ? { ...p, tracks: [...new Set([...p.tracks, trackId])] } : p
    ));
  }, []);

  const removeFromPlaylist = useCallback((playlistId: string, trackId: string) => {
    setPlaylists(prev => prev.map(p =>
      p.id === playlistId ? { ...p, tracks: p.tracks.filter(t => t !== trackId) } : p
    ));
  }, []);

  const deletePlaylist = useCallback((id: string) => {
    setPlaylists(prev => prev.filter(p => p.id !== id));
  }, []);

  const updateProfile = useCallback((p: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...p }));
  }, []);

  const toggleFavorite = useCallback((trackId: string) => {
    setFavorites(prev => prev.includes(trackId)
      ? prev.filter(id => id !== trackId)
      : [...prev, trackId]
    );
  }, []);

  return (
    <MusicContext.Provider value={{
      tracks, playlists, currentTrack, isPlaying, currentTime, duration,
      volume, shuffle, repeat, profile, queue, addTracks, play, pause,
      togglePlay, next, previous, seek, setVolume, toggleShuffle,
      toggleRepeat, createPlaylist, addToPlaylist, removeFromPlaylist,
      deletePlaylist, updateProfile, favorites, toggleFavorite,
    }}>
      {children}
    </MusicContext.Provider>
  );
};
