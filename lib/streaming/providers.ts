export interface StreamProvider {
  name: string;
  id: string;
  priority: number;
  getMovieUrl: (tmdbId: number) => string;
  getTvUrl: (tmdbId: number, season: number, episode: number) => string;
  isPremium?: boolean;
}

/**
 * Streaming providers ordered by priority:
 * 1. VidSrc (primary) - Most reliable, fast loading
 * 2. NexStream (backup) - Good quality backup
 * 3. Other sources as tertiary backups
 */
const providers: StreamProvider[] = [
  {
    name: "VidSrc",
    id: "vidsrc",
    priority: 1,
    getMovieUrl: (id) => `https://vidsrc.fyi/embed/movie/${id}`,
    getTvUrl: (id, s, e) => `https://vidsrc.fyi/embed/tv/${id}/${s}/${e}`,
  },
  {
    name: "NexStream",
    id: "nexstream",
    priority: 2,
    isPremium: true,
    getMovieUrl: (id) => {
      const key = process.env.NEXSTREAM_API_KEY || "";
      return `https://api.codespecters.com/embed/movie/${id}?apikey=${key}`;
    },
    getTvUrl: (id, s, e) => {
      const key = process.env.NEXSTREAM_API_KEY || "";
      return `https://api.codespecters.com/embed/tv/${id}/${s}/${e}?apikey=${key}`;
    },
  },
  {
    name: "AutoEmbed",
    id: "autoembed",
    priority: 3,
    getMovieUrl: (id) => `https://autoembed.co/movie/tmdb/${id}`,
    getTvUrl: (id, s, e) => `https://autoembed.co/tv/tmdb/${id}-${s}-${e}`,
  },
  {
    name: "VidPhantom",
    id: "vidphantom",
    priority: 4,
    getMovieUrl: (id) => `https://vidphantom.com/movie/${id}`,
    getTvUrl: (id, s, e) => `https://vidphantom.com/tv/${id}/${s}/${e}`,
  },
  {
    name: "2Embed",
    id: "2embed",
    priority: 5,
    getMovieUrl: (id) => `https://www.2embed.online/embed/movie/${id}`,
    getTvUrl: (id, s, e) => `https://www.2embed.online/embed/tv/${id}/${s}/${e}`,
  },
];

/**
 * Get all embed URLs sorted by priority
 */
export function getAllEmbedUrls(
  mediaType: "movie" | "tv",
  tmdbId: number,
  season?: number,
  episode?: number
): { name: string; id: string; url: string; priority: number }[] {
  return providers
    .sort((a, b) => a.priority - b.priority)
    .map((p) => ({
      name: p.name,
      id: p.id,
      priority: p.priority,
      url:
        mediaType === "tv" && season !== undefined && episode !== undefined
          ? p.getTvUrl(tmdbId, season, episode)
          : p.getMovieUrl(tmdbId),
    }));
}

/**
 * Get only the primary providers (VidSrc and NexStream)
 */
export function getPrimaryEmbedUrls(
  mediaType: "movie" | "tv",
  tmdbId: number,
  season?: number,
  episode?: number
): { name: string; id: string; url: string; priority: number }[] {
  return providers
    .filter((p) => p.priority <= 2)
    .sort((a, b) => a.priority - b.priority)
    .map((p) => ({
      name: p.name,
      id: p.id,
      priority: p.priority,
      url:
        mediaType === "tv" && season !== undefined && episode !== undefined
          ? p.getTvUrl(tmdbId, season, episode)
          : p.getMovieUrl(tmdbId),
    }));
}

export { providers };
