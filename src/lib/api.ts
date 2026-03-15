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

export function decodeHtml(str: string): string {
  if (!str) return '';
  const txt = document.createElement('textarea');
  txt.innerHTML = str;
  return txt.value;
}

export function getArtistStr(song: any): string {
  const raw = song.primaryArtists || song.singers ||
    (song.artists?.primary ? song.artists.primary.map((a: any) => a.name).join(', ') : '');
  return decodeHtml(raw);
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

// ===================== SONGS (5) =====================
export async function getSongById(id: string) {
  return fetchJson(`${API}/songs/${id}`);
}
export async function getSongByLink(link: string) {
  return fetchJson(`${API}/songs?link=${encodeURIComponent(link)}`);
}
export async function getSongsByIds(ids: string[]) {
  return fetchJson(`${API}/songs?ids=${ids.join(',')}`);
}
export async function getSongSuggestions(id: string, limit = 10) {
  return fetchJson(`${API}/songs/${id}/suggestions?limit=${limit}`);
}
export async function getSongRingtone(id: string) {
  return fetchJson(`${API}/songs/${id}/ringtone`);
}
export async function getSongShareLink(id: string) {
  return fetchJson(`${API}/songs/${id}/share`);
}

// ===================== ALBUMS (1) =====================
export async function getAlbumById(id: string) {
  return fetchJson(`${API}/albums?id=${id}`);
}
export async function getAlbumByLink(link: string) {
  return fetchJson(`${API}/albums?link=${encodeURIComponent(link)}`);
}

// ===================== PLAYLISTS (1) =====================
export async function getPlaylistById(id: string, page = 1, limit = 50) {
  return fetchJson(`${API}/playlists?id=${id}&page=${page}&limit=${limit}`);
}
export async function getPlaylistByLink(link: string, page = 1, limit = 50) {
  return fetchJson(`${API}/playlists?link=${encodeURIComponent(link)}&page=${page}&limit=${limit}`);
}

// ===================== PODCASTS (3) =====================
export async function getEpisodeById(id: string) {
  return fetchJson(`${API}/episodes/${id}`);
}
export async function getPodcastById(id: string, page = 1, limit = 20) {
  return fetchJson(`${API}/podcasts/${id}?page=${page}&limit=${limit}`);
}
export async function getPodcastByLink(link: string, page = 1, limit = 20) {
  const params = new URLSearchParams({ link, page: String(page), limit: String(limit) });
  return fetchJson(`${API}/podcasts?${params}`);
}

// ===================== SEARCH (6) =====================
export async function globalSearch(query: string) {
  return fetchJson(`${API}/search?query=${encodeURIComponent(query)}`);
}
export async function searchSongs(query: string, limit = 20, page = 1) {
  return fetchJson(`${API}/search/songs?query=${encodeURIComponent(query)}&limit=${limit}&page=${page}`);
}
export async function searchAlbums(query: string, limit = 20, page = 1) {
  return fetchJson(`${API}/search/albums?query=${encodeURIComponent(query)}&page=${page}`);
}
export async function searchArtists(query: string, limit = 20, page = 1) {
  return fetchJson(`${API}/search/artists?query=${encodeURIComponent(query)}&page=${page}`);
}
export async function searchPlaylists(query: string, limit = 20, page = 1) {
  return fetchJson(`${API}/search/playlists?query=${encodeURIComponent(query)}&page=${page}`);
}
export async function searchTopQuery(query: string) {
  return fetchJson(`${API}/search/top-query?query=${encodeURIComponent(query)}`);
}
export async function searchPodcasts(query: string, page = 1, limit = 20) {
  return fetchJson(`${API}/podcasts?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
}

// ===================== LYRICS (3) =====================
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

// ===================== ARTISTS (6) =====================
export async function getArtistById(id: string) {
  return fetchJson(`${API}/artists/${id}`);
}
export async function getArtistByLink(link: string) {
  return fetchJson(`${API}/artists?link=${encodeURIComponent(link)}`);
}
export async function getArtistByName(query: string) {
  return fetchJson(`${API}/artists/by-name?query=${encodeURIComponent(query)}`);
}
export async function getArtistSongs(id: string, page = 1, limit = 20) {
  return fetchJson(`${API}/artists/${id}/songs?page=${page}&limit=${limit}`);
}
export async function getArtistAlbums(id: string, page = 1) {
  return fetchJson(`${API}/artists/${id}/albums?page=${page}`);
}
export async function getRelatedArtists(id: string) {
  return fetchJson(`${API}/artists/${id}/related`);
}

// ===================== TRENDING (6) =====================
export async function getTrending(page = 1) {
  return fetchJson(`${API}/trending?page=${page}`);
}
export async function getTrendingSongs(page = 1) {
  return fetchJson(`${API}/trending/songs?page=${page}`);
}
export async function getTrendingAlbums(page = 1) {
  return fetchJson(`${API}/trending/albums?page=${page}`);
}
export async function getTrendingPlaylists(page = 1) {
  return fetchJson(`${API}/trending/playlists?page=${page}`);
}
export async function getTrendingArtists(page = 1) {
  return fetchJson(`${API}/trending/artists?page=${page}`);
}
export async function getTrendingPodcasts(page = 1) {
  return fetchJson(`${API}/trending/podcasts?page=${page}`);
}

// ===================== HOME (5) =====================
export async function getHomeFeed() {
  return fetchJson(`${API}/home`);
}
export async function getHomeArtistRecommendations(page = 1, limit = 20) {
  return fetchJson(`${API}/home/artist-recommendations?page=${page}&limit=${limit}`);
}
export async function getHomeCityModules(page = 1, limit = 20) {
  return fetchJson(`${API}/home/city-modules?page=${page}&limit=${limit}`);
}
export async function getHomeModules() {
  return fetchJson(`${API}/home/modules`);
}
export async function getHomePromos() {
  return fetchJson(`${API}/home/promos`);
}

// ===================== GENRES (1) =====================
export async function getGenres(page = 1, limit = 30) {
  return fetchJson(`${API}/genres?page=${page}&limit=${limit}`);
}

// ===================== BROWSE (6) =====================
export async function getChannels(page = 1, limit = 20) {
  return fetchJson(`${API}/channels?page=${page}&limit=${limit}`);
}
export async function getChannelById(id: string) {
  return fetchJson(`${API}/channels/${id}`);
}
export async function getCharts(page = 1, limit = 20) {
  return fetchJson(`${API}/charts?page=${page}&limit=${limit}`);
}
export async function getDiscover() {
  return fetchJson(`${API}/discover`);
}
export async function getMoods(page = 1, limit = 20) {
  return fetchJson(`${API}/moods?page=${page}&limit=${limit}`);
}
export async function getMusicPlus() {
  return fetchJson(`${API}/music-plus`);
}

// ===================== RADIO (4) =====================
export async function getRadio(page = 1, limit = 20) {
  return fetchJson(`${API}/radio?page=${page}&limit=${limit}`);
}
export async function getRadioById(id: string) {
  return fetchJson(`${API}/radio/${id}`);
}
export async function getRadioArtists(artistId?: string, page = 1, limit = 20) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (artistId) params.set('artist_id', artistId);
  return fetchJson(`${API}/radio/artists?${params}`);
}
export async function getRadioFeatured(page = 1, limit = 20) {
  return fetchJson(`${API}/radio/featured?page=${page}&limit=${limit}`);
}
