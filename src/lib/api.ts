const API = 'https://elitejiosaavn-api.vercel.app/api';

export async function fetchJson(url: string) {
  const res = await fetch(url);
  return res.json();
}

export function getImg(images: any, preferred = '150x150'): string {
  if (!images) return '';
  if (typeof images === 'string') return images;
  if (Array.isArray(images) && images.length) {
    const found = images.find((i: any) => i.quality === preferred) || images[images.length - 1];
    return found?.url || found?.link || '';
  }
  return '';
}

export function getAudioUrl(song: any, quality = '320kbps'): string {
  if (Array.isArray(song.downloadUrl) && song.downloadUrl.length) {
    const preferred = song.downloadUrl.find(
      (d: any) => (d.quality || d.label || '').toLowerCase() === quality.toLowerCase()
    );
    if (preferred) return preferred.url || preferred.link || '';
    const q = song.downloadUrl.find((d: any) => /320/i.test(d.quality || d.label || ''))
           || song.downloadUrl.find((d: any) => /160/i.test(d.quality || d.label || ''))
           || song.downloadUrl[song.downloadUrl.length - 1];
    return q?.url || q?.link || '';
  }
  return song.url || '';
}

export function getUrlForQuality(song: any, quality: string): string {
  if (Array.isArray(song.downloadUrl) && song.downloadUrl.length) {
    const match = song.downloadUrl.find(
      (d: any) => (d.quality || d.label || '').toLowerCase() === quality.toLowerCase()
    );
    return match ? (match.url || match.link || '') : '';
  }
  return '';
}

export function getArtistStr(song: any): string {
  if (song.primaryArtists) return song.primaryArtists;
  if (song.singers) return song.singers;
  if (song.artists?.primary) {
    return song.artists.primary.map((a: any) => a.name).join(', ');
  }
  return '';
}

export function fmtTime(s: number): string {
  if (isNaN(s) || !isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export function extractBioText(bioArr: any): string {
  if (!bioArr) return '';
  if (typeof bioArr === 'string') return bioArr;
  if (!bioArr.length) return '';
  return bioArr
    .map((b: any) => (typeof b === 'string' ? b : (b && b.text) || ''))
    .filter(Boolean)
    .join('\n\n');
}

export function extractResults(data: any): any[] {
  if (!data?.data) return [];
  if (Array.isArray(data.data)) return data.data;
  if (data.data.results) return data.data.results;
  if (data.data.songs) return data.data.songs;
  return [];
}

// ---- Search endpoints ----
export async function searchSongs(query: string, limit = 20, page = 1) {
  return fetchJson(`${API}/search/songs?query=${encodeURIComponent(query)}&limit=${limit}&page=${page}`);
}
export async function searchAlbums(query: string, limit = 20, page = 1) {
  return fetchJson(`${API}/search/albums?query=${encodeURIComponent(query)}&limit=${limit}&page=${page}`);
}
export async function searchArtists(query: string, limit = 20, page = 1) {
  return fetchJson(`${API}/search/artists?query=${encodeURIComponent(query)}&limit=${limit}&page=${page}`);
}
export async function searchPlaylists(query: string, limit = 20, page = 1) {
  return fetchJson(`${API}/search/playlists?query=${encodeURIComponent(query)}&limit=${limit}&page=${page}`);
}
export async function globalSearch(query: string) {
  return fetchJson(`${API}/search?query=${encodeURIComponent(query)}`);
}

// ---- Detail endpoints ----
export async function getAlbumById(id: string) {
  return fetchJson(`${API}/albums?id=${id}`);
}
export async function getAlbumByLink(link: string) {
  return fetchJson(`${API}/albums?link=${encodeURIComponent(link)}`);
}
export async function getArtistById(id: string, opts?: { page?: number; songCount?: number; albumCount?: number; sortBy?: string; sortOrder?: string }) {
  const params = new URLSearchParams();
  if (opts?.page) params.set('page', String(opts.page));
  if (opts?.songCount) params.set('songCount', String(opts.songCount));
  if (opts?.albumCount) params.set('albumCount', String(opts.albumCount));
  if (opts?.sortBy) params.set('sortBy', opts.sortBy);
  if (opts?.sortOrder) params.set('sortOrder', opts.sortOrder);
  const qs = params.toString();
  return fetchJson(`${API}/artists/${id}${qs ? '?' + qs : ''}`);
}
export async function getArtistByLink(link: string, opts?: { page?: number; songCount?: number; albumCount?: number; sortBy?: string; sortOrder?: string }) {
  const params = new URLSearchParams({ link });
  if (opts?.page) params.set('page', String(opts.page));
  if (opts?.songCount) params.set('songCount', String(opts.songCount));
  if (opts?.albumCount) params.set('albumCount', String(opts.albumCount));
  if (opts?.sortBy) params.set('sortBy', opts.sortBy);
  if (opts?.sortOrder) params.set('sortOrder', opts.sortOrder);
  return fetchJson(`${API}/artists?${params}`);
}
export async function getArtistByName(query: string, opts?: { searchLimit?: number; sortBy?: string; sortOrder?: string; songCount?: number; albumCount?: number }) {
  const params = new URLSearchParams({ query });
  if (opts?.searchLimit) params.set('searchLimit', String(opts.searchLimit));
  if (opts?.sortBy) params.set('sortBy', opts.sortBy);
  if (opts?.sortOrder) params.set('sortOrder', opts.sortOrder);
  if (opts?.songCount) params.set('songCount', String(opts.songCount));
  if (opts?.albumCount) params.set('albumCount', String(opts.albumCount));
  return fetchJson(`${API}/artists/by-name?${params}`);
}
export async function getArtistSongs(id: string, page = 1, limit = 20, sortBy?: string, sortOrder?: string) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (sortBy) params.set('sortBy', sortBy);
  if (sortOrder) params.set('sortOrder', sortOrder);
  return fetchJson(`${API}/artists/${id}/songs?${params}`);
}
export async function getArtistAlbums(id: string, page = 1, limit = 20, sortBy?: string, sortOrder?: string) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (sortBy) params.set('sortBy', sortBy);
  if (sortOrder) params.set('sortOrder', sortOrder);
  return fetchJson(`${API}/artists/${id}/albums?${params}`);
}
export async function getPlaylistById(id: string, page = 1, limit = 50) {
  return fetchJson(`${API}/playlists?id=${id}&page=${page}&limit=${limit}`);
}
export async function getPlaylistByLink(link: string, page = 1, limit = 50) {
  return fetchJson(`${API}/playlists?link=${encodeURIComponent(link)}&page=${page}&limit=${limit}`);
}
export async function getSongById(id: string) {
  return fetchJson(`${API}/songs/${id}`);
}
export async function getSongByLink(link: string) {
  return fetchJson(`${API}/songs?link=${encodeURIComponent(link)}`);
}
export async function getSongsByIds(ids: string[]) {
  return fetchJson(`${API}/songs?ids=${ids.join(',')}`);
}

// ---- Lyrics ----
export async function getLyrics(song: any) {
  const url = song.lyricsId
    ? `${API}/lyrics/${encodeURIComponent(song.lyricsId)}`
    : `${API}/lyrics?query=${encodeURIComponent(song.name || song.title || '')}`;
  return fetchJson(url);
}
export async function getLyricsById(id: string) {
  return fetchJson(`${API}/lyrics/${id}`);
}
export async function getLyricsByQuery(query: string, limit = 5) {
  return fetchJson(`${API}/lyrics?query=${encodeURIComponent(query)}&limit=${limit}`);
}
export async function getSyncedLyrics(songId: string) {
  return fetchJson(`${API}/lyrics/${songId}/sync`);
}

// ---- Trending (REAL API — no custom queries) ----
export async function getTrending(page = 1, limit = 20) {
  return fetchJson(`${API}/trending?page=${page}&limit=${limit}`);
}
export async function getTrendingSongs(page = 1, limit = 20) {
  return fetchJson(`${API}/trending/songs?page=${page}&limit=${limit}`);
}
export async function getTrendingAlbums(page = 1, limit = 20) {
  return fetchJson(`${API}/trending/albums?page=${page}&limit=${limit}`);
}
export async function getTrendingPlaylists(page = 1, limit = 20) {
  return fetchJson(`${API}/trending/playlists?page=${page}&limit=${limit}`);
}
export async function getTrendingArtists(page = 1, limit = 20) {
  return fetchJson(`${API}/trending/artists?page=${page}&limit=${limit}`);
}
export async function getTrendingPodcasts(page = 1, limit = 20) {
  return fetchJson(`${API}/trending/podcasts?page=${page}&limit=${limit}`);
}

// ---- Podcasts ----
export async function getPodcastById(id: string, page = 1, limit = 20, sortOrder?: string) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (sortOrder) params.set('sortOrder', sortOrder);
  return fetchJson(`${API}/podcasts/${id}?${params}`);
}
export async function getPodcastByLink(link: string, page = 1, limit = 20, sortOrder?: string) {
  const params = new URLSearchParams({ link, page: String(page), limit: String(limit) });
  if (sortOrder) params.set('sortOrder', sortOrder);
  return fetchJson(`${API}/podcasts?${params}`);
}
export async function searchPodcasts(query: string, page = 1, limit = 20) {
  return fetchJson(`${API}/podcasts?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
}

// ---- Related Artists ----
export async function getRelatedArtists(id: string, page = 1, limit = 20) {
  return fetchJson(`${API}/artists/${id}/related?page=${page}&limit=${limit}`);
}

// ---- Song Suggestions (for auto-play / infinite playback) ----
export async function getSongSuggestions(id: string, limit = 10) {
  return fetchJson(`${API}/songs/${id}/suggestions?limit=${limit}`);
}

// ---- Ringtone ----
export async function getSongRingtone(id: string) {
  return fetchJson(`${API}/songs/${id}/ringtone`);
}

// ---- Shareable Link ----
export async function getSongShareLink(id: string) {
  return fetchJson(`${API}/songs/${id}/share`);
}
