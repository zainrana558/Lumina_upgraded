"use client";

import { useState, useEffect } from "react";

interface ProviderIndicatorProps {
  mediaId: number;
  mediaType: "movie" | "tv";
  season?: number;
  episode?: number;
}

export function ProviderIndicator({ mediaId, mediaType, season, episode }: ProviderIndicatorProps) {
  const [provider, setProvider] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProvider() {
      try {
        const params = new URLSearchParams({
          tmdb: mediaId.toString(),
          type: mediaType,
        });
        if (season) params.set("season", season.toString());
        if (episode) params.set("episode", episode.toString());

        const res = await fetch(`/api/embed?${params}`);
        const data = await res.json();
        
        if (data.providers?.[0]) {
          setProvider(data.providers[0].name);
        } else if (data.error) {
          setError(data.error);
        }
      } catch (e) {
        setError("Failed to load provider");
      } finally {
        setLoading(false);
      }
    }

    fetchProvider();
  }, [mediaId, mediaType, season, episode]);

  if (loading) {
    return (
      <span className="text-xs text-[var(--color-muted-foreground)] animate-pulse">
        Loading...
      </span>
    );
  }

  if (error) {
    return (
      <span className="text-xs text-[var(--color-destructive)]">
        Error
      </span>
    );
  }

  const providerConfig: Record<string, { color: string; bg: string }> = {
    VidSrc: { color: "#22d3ee", bg: "rgba(34, 211, 238, 0.15)" },
    NexStream: { color: "#a855f7", bg: "rgba(168, 85, 247, 0.15)" },
    AutoEmbed: { color: "#22c55e", bg: "rgba(34, 197, 94, 0.15)" },
    VidPhantom: { color: "#f97316", bg: "rgba(249, 115, 22, 0.15)" },
    "2Embed": { color: "#ef4444", bg: "rgba(239, 68, 68, 0.15)" },
  };

  const config = providerConfig[provider || ""] || { color: "#58a6ff", bg: "rgba(88, 166, 255, 0.15)" };

  return (
    <span 
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ 
        color: config.color, 
        background: config.bg,
        border: `1px solid ${config.color}30`
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: config.color }} />
      {provider}
    </span>
  );
}

export default ProviderIndicator;