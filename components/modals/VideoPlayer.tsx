"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, ChevronDown, RefreshCw, Volume2, VolumeX, Maximize, Minimize, Settings, Wifi, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MediaItem, Season, Episode } from "@/types";
import { getTitle } from "@/lib/utils";

interface EmbedProvider {
  name: string;
  id: string;
  url: string;
  priority: number;
}

interface VideoPlayerProps {
  item: MediaItem;
  onClose: () => void;
  profileId: string | null;
  initialSeason?: number;
  initialEpisode?: number;
}

const BUFFER_TIMEOUT = 15000; // 15 seconds buffer timeout
const CHECK_INTERVAL = 5000; // Check every 5 seconds

export default function VideoPlayer({
  item,
  onClose,
  profileId,
  initialSeason = 1,
  initialEpisode = 1,
}: VideoPlayerProps) {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Loading player...");
  const [season, setSeason] = useState(initialSeason);
  const [episode, setEpisode] = useState(initialEpisode);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [providers, setProviders] = useState<EmbedProvider[]>([]);
  const [providerIndex, setProviderIndex] = useState(0);
  const [showServers, setShowServers] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [bufferProgress, setBufferProgress] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const bufferTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const mediaType = item.media_type || (item.title ? "movie" : "tv");

  // Fetch embed URLs with priority ordering
  const fetchEmbed = useCallback(async () => {
    setLoading(true);
    setError(null);
    setLoadingMessage("Connecting to streaming server...");
    
    let url = `/api/embed?tmdb=${item.id}&type=${mediaType}`;
    if (mediaType === "tv") {
      url += `&season=${season}&episode=${episode}`;
    }

    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        // Sort by priority (already sorted from API)
        const list: EmbedProvider[] = data.providers ?? [];
        setProviders(list);
        setProviderIndex(0);
        setEmbedUrl(list[0]?.url ?? data.url ?? null);
        
        if (!list.length && !data.url) {
          setError("No streaming sources available");
        }
      } else {
        setError("Failed to connect to streaming service");
      }
    } catch (err) {
      setError("Connection error. Please try again.");
    }
    setLoading(false);
  }, [item.id, mediaType, season, episode]);

  // Auto-switch to next server on failure
  const tryNextServer = useCallback(() => {
    if (providerIndex < providers.length - 1) {
      const nextIndex = providerIndex + 1;
      setProviderIndex(nextIndex);
      setEmbedUrl(providers[nextIndex].url);
      setLoadingMessage(`Trying ${providers[nextIndex].name}...`);
      setLoading(true);
      setError(null);
    } else {
      setError("All streaming sources failed. Please try again later.");
    }
  }, [providerIndex, providers]);

  // Monitor buffer status
  useEffect(() => {
    if (!embedUrl || loading) return;

    // Start buffer monitoring
    const checkBuffer = () => {
      setBufferProgress((prev) => {
        if (prev >= 100) {
          setIsBuffering(false);
          if (bufferTimerRef.current) {
            clearInterval(bufferTimerRef.current);
          }
          return prev;
        }
        
        // Simulate buffer progress
        setIsBuffering(true);
        return prev + 5;
      });
    };

    // Clear existing timer
    if (bufferTimerRef.current) {
      clearInterval(bufferTimerRef.current);
    }

    // Start new monitoring
    bufferTimerRef.current = setInterval(checkBuffer, CHECK_INTERVAL);

    return () => {
      if (bufferTimerRef.current) {
        clearInterval(bufferTimerRef.current);
      }
    };
  }, [embedUrl, loading]);

  // Auto-fallback on slow buffer
  useEffect(() => {
    if (bufferProgress > 0 && bufferProgress < 30 && loading) {
      const timeout = setTimeout(() => {
        if (loading && !error) {
          setLoadingMessage("Slow connection. Trying alternative server...");
          tryNextServer();
        }
      }, BUFFER_TIMEOUT);
      
      return () => clearTimeout(timeout);
    }
  }, [bufferProgress, loading, error, tryNextServer]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "f":
        case "F":
          toggleFullscreen();
          break;
        case "s":
        case "S":
          setShowServers(!showServers);
          break;
        case "m":
        case "M":
          // Toggle mute (if supported)
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, showServers]);

  const switchProvider = (index: number) => {
    if (index >= 0 && index < providers.length) {
      setProviderIndex(index);
      setEmbedUrl(providers[index].url);
      setShowServers(false);
      setLoading(true);
      setBufferProgress(0);
      setLoadingMessage(`Connecting to ${providers[index].name}...`);
    }
  };

  const toggleFullscreen = async () => {
    if (!playerRef.current) return;
    
    try {
      if (!isFullscreen) {
        await playerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      // Fullscreen not supported
    }
  };

  // Fetch seasons for TV shows
  useEffect(() => {
    if (mediaType !== "tv") return;
    fetch(`/api/tmdb?endpoint=/tv/${item.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.seasons) {
          setSeasons(data.seasons.filter((s: Season) => s.season_number > 0));
        }
      })
      .catch(() => {});
  }, [item.id, mediaType]);

  // Fetch episodes
  useEffect(() => {
    if (mediaType !== "tv") return;
    fetch(`/api/tmdb?endpoint=/tv/${item.id}/season/${season}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.episodes) setEpisodes(data.episodes);
      })
      .catch(() => {});
  }, [item.id, mediaType, season]);

  // Track watch progress
  useEffect(() => {
    if (!profileId || !embedUrl) return;
    const interval = setInterval(async () => {
      try {
        const { saveProgress } = await import("@/actions/progress");
        await saveProgress({
          profile_id: profileId,
          media_id: item.id,
          media_type: mediaType as "movie" | "tv",
          title: getTitle(item),
          poster_path: item.poster_path,
          progress: 0,
          duration: 0,
          ...(mediaType === "tv" ? { season_number: season, episode_number: episode } : {}),
        });
      } catch {
        // ignore
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [profileId, item, mediaType, season, episode, embedUrl]);

  // Add to history
  useEffect(() => {
    if (!profileId) return;
    import("@/actions/progress").then(({ addToHistory }) => {
      addToHistory(profileId, item.id, mediaType, getTitle(item), item.poster_path);
    }).catch(() => {});
  }, [profileId, item, mediaType]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div 
      ref={playerRef}
      className="fixed inset-0 z-[60] bg-black flex flex-col"
    >
      {/* Top Controls Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-3">
          {/* Server Indicator */}
          {providers.length > 0 && (
            <div 
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                providerIndex === 0 
                  ? "bg-green-500/20 text-green-400" 
                  : providerIndex === 1 
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-yellow-500/20 text-yellow-400"
              }`}
            >
              <Wifi className="h-3 w-3" />
              {providers[providerIndex]?.name ?? "Server"}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Server Switcher */}
          {providers.length > 1 && (
            <div className="relative">
              <button
                onClick={() => setShowServers(!showServers)}
                className="flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-2 text-sm text-white hover:bg-black/80 transition-colors"
                aria-label="Change server"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">Server</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${showServers ? "rotate-180" : ""}`} />
              </button>
              {showServers && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-lg bg-zinc-900 border border-border p-1 shadow-xl animate-scale-in">
                  {providers.map((p, i) => (
                    <button
                      key={p.id}
                      onClick={() => switchProvider(i)}
                      className={`w-full flex items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${
                        i === providerIndex
                          ? "bg-primary text-white"
                          : "text-zinc-300 hover:bg-zinc-800"
                      }`}
                    >
                      <span>{p.name}</span>
                      <span className="text-xs opacity-50">
                        {i === 0 ? "Primary" : i === 1 ? "Backup" : `Alt ${i - 1}`}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="rounded-full bg-black/60 p-2.5 text-white hover:bg-black/80 transition-colors"
            aria-label="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="rounded-full bg-black/60 p-2.5 text-white hover:bg-destructive/80 transition-colors"
            aria-label="Close player"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Loading/Error State */}
      {loading || error ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          {isBuffering && (
            <div className="w-64 h-1 bg-zinc-800 rounded-full overflow-hidden mb-4">
              <div 
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${bufferProgress}%` }}
              />
            </div>
          )}
          <div className="flex items-center gap-3 text-muted-foreground">
            {loading && (
              <>
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span>{loadingMessage}</span>
              </>
            )}
          </div>
          {error && (
            <div className="flex flex-col items-center gap-4 mt-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <p className="text-destructive">{error}</p>
              {providers.length > 1 && providerIndex < providers.length - 1 && (
                <Button onClick={tryNextServer} variant="secondary">
                  Try Next Server
                </Button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 relative">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              allowFullScreen
              title="Video Player"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Unable to load player
            </div>
          )}
        </div>
      )}

      {/* TV Show Controls */}
      {mediaType === "tv" && !loading && !error && (
        <div className="bg-card border-t border-border">
          <div className="flex items-center justify-between p-4">
            <div>
              <h3 className="font-semibold text-foreground">{getTitle(item)}</h3>
              <p className="text-sm text-muted-foreground">
                Season {season}, Episode {episode}
                {episodes[episode - 1] && ` — ${episodes[episode - 1].name}`}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEpisodes(!showEpisodes)}
              className="gap-1"
            >
              Episodes
              <ChevronDown className={`h-4 w-4 transition-transform ${showEpisodes ? "rotate-180" : ""}`} />
            </Button>
          </div>

          {showEpisodes && (
            <div className="px-4 pb-4 space-y-3 max-h-64 overflow-y-auto">
              {/* Season Selector */}
              <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
                {seasons.map((s) => (
                  <button
                    key={s.season_number}
                    onClick={() => { setSeason(s.season_number); setEpisode(1); }}
                    className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm transition-colors ${
                      season === s.season_number
                        ? "bg-primary text-white"
                        : "bg-secondary hover:bg-secondary/80"
                    }`}
                  >
                    Season {s.season_number}
                  </button>
                ))}
              </div>
              
              {/* Episode List */}
              <div className="space-y-1">
                {episodes.map((ep) => (
                  <button
                    key={ep.episode_number}
                    onClick={() => setEpisode(ep.episode_number)}
                    className={`w-full flex items-center justify-between rounded-lg p-3 text-left transition-colors ${
                      episode === ep.episode_number
                        ? "bg-primary/20 border border-primary/30"
                        : "hover:bg-secondary"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium block truncate">
                        {ep.episode_number}. {ep.name}
                      </span>
                      {ep.overview && (
                        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground truncate">
                          {ep.overview}
                        </p>
                      )}
                    </div>
                    {ep.runtime && (
                      <span className="ml-3 text-xs text-muted-foreground flex-shrink-0">
                        {ep.runtime}m
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
