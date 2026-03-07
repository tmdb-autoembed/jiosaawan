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

// Extract results from various API response shapes
export function extractResults(data: any): any[] {
  if (!data?.data) return [];
  if (Array.isArray(data.data)) return data.data;
  if (data.data.results) return data.data.results;
  if (data.data.songs) return data.data.songs;
  return [];
}

// ---- API endpoints ----

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

export async function getAlbumById(id: string) {
  return fetchJson(`${API}/albums?id=${id}`);
}

export async function getArtistById(id: string) {
  return fetchJson(`${API}/artists/${id}`);
}

export async function getArtistSongs(id: string, page = 1, limit = 20) {
  return fetchJson(`${API}/artists/${id}/songs?page=${page}&limit=${limit}`);
}

export async function getArtistAlbums(id: string, page = 1, limit = 20) {
  return fetchJson(`${API}/artists/${id}/albums?page=${page}&limit=${limit}`);
}

export async function getPlaylistById(id: string) {
  return fetchJson(`${API}/playlists?id=${id}`);
}

export async function getSongById(id: string) {
  return fetchJson(`${API}/songs/${id}`);
}

export async function getLyrics(song: any) {
  const url = song.lyricsId
    ? `${API}/lyrics/${encodeURIComponent(song.lyricsId)}`
    : `${API}/lyrics?query=${encodeURIComponent(song.name || song.title || '')}`;
  return fetchJson(url);
}
