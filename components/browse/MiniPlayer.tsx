"use client";

import { useState, useEffect, useRef } from "react";
import { X, Minimize, Maximize, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { getTitle } from "@/lib/utils";
import type { MediaItem } from "@/types";

interface MiniPlayerProps {
  item: MediaItem;
  embedUrl: string;
  isOpen: boolean;
  onClose: () => void;
  onOpenFull: () => void;
}

export default function MiniPlayer({
  item,
  embedUrl,
  isOpen,
  onClose,
  onOpenFull,
}: MiniPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Listen for Picture-in-Picture events
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleEnterPiP = () => {
      // Hide custom player when entering PiP
      setIsPlaying(false);
    };

    const handleExitPiP = () => {
      setIsPlaying(true);
    };

    container.addEventListener("enterpictureinpicture", handleEnterPiP);
    container.addEventListener("exitpictureinpicture", handleExitPiP);

    return () => {
      container.removeEventListener("enterpictureinpicture", handleEnterPiP);
      container.removeEventListener("exitpictureinpicture", handleExitPiP);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className="fixed bottom-20 right-4 z-50 w-72 md:w-80 rounded-xl overflow-hidden shadow-2xl border border-border bg-card animate-slide-up"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-2 bg-zinc-900/80">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
            {item.poster_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                alt={getTitle(item)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                <Play className="h-4 w-4 text-zinc-500" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-white truncate">
              {getTitle(item)}
            </p>
            <p className="text-[10px] text-zinc-400">Now Playing</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <VolumeX className="h-3.5 w-3.5 text-zinc-400" />
            ) : (
              <Volume2 className="h-3.5 w-3.5 text-zinc-400" />
            )}
          </button>
          <button
            onClick={onOpenFull}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Open full player"
          >
            <Maximize className="h-3.5 w-3.5 text-zinc-400" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <Minimize className="h-3.5 w-3.5 text-zinc-400" />
          </button>
        </div>
      </div>

      {/* Video Container */}
      <div className="relative aspect-video bg-black">
        <iframe
          src={embedUrl}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
          title={getTitle(item)}
        />

        {/* Hover Overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity" />
        )}
      </div>
    </div>
  );
}

/**
 * Floating Player Controller
 * Manages multiple mini-players and their state
 */
export function useMiniPlayer() {
  const [activePlayer, setActivePlayer] = useState<{
    item: MediaItem;
    embedUrl: string;
  } | null>(null);

  const openPlayer = (item: MediaItem, embedUrl: string) => {
    setActivePlayer({ item, embedUrl });
  };

  const closePlayer = () => {
    setActivePlayer(null);
  };

  return {
    activePlayer,
    openPlayer,
    closePlayer,
    isOpen: !!activePlayer,
  };
}