"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, Star, Plus, Check, ChevronDown } from "lucide-react";
import { getImageUrl, getTitle, getYear, formatRating } from "@/lib/utils";
import type { MediaItem } from "@/types";

interface MediaCardProps {
  item: MediaItem;
  onClick: (item: MediaItem) => void;
  mediaType?: "movie" | "tv";
  showMeta?: boolean;
}

export default function MediaCard({ item, onClick, mediaType, showMeta = true }: MediaCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const type = mediaType || item.media_type || (item.title ? "movie" : "tv");

  return (
    <button
      onClick={() => onClick({ ...item, media_type: type })}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative flex-shrink-0 w-36 md:w-44 lg:w-48 overflow-hidden rounded-lg transition-all duration-300 ${
        isHovered 
          ? "scale-105 md:scale-110 z-20 shadow-2xl shadow-black/50" 
          : "hover:scale-102"
      }`}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-muted">
        <Image
          src={getImageUrl(item.poster_path)}
          alt={getTitle(item)}
          fill
          className={`object-cover transition-transform duration-500 ${
            isHovered ? "scale-110" : "scale-100"
          }`}
          sizes="(max-width: 768px) 144px, (max-width: 1024px) 176px, 192px"
          loading="lazy"
        />
        
        {/* Hover Overlay */}
        <div 
          className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-full bg-primary/90 p-4 md:p-5 shadow-xl transform transition-transform duration-300 hover:scale-110">
              <Play className="h-6 w-6 md:h-8 md:w-8 fill-white text-white" />
            </div>
          </div>
        </div>

        {/* Quick Add Button */}
        <div 
          className={`absolute top-2 right-2 transition-all duration-300 ${
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
          }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Add to list logic here
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40"
            aria-label="Add to list"
          >
            <Plus className="h-4 w-4 text-white" />
          </button>
        </div>

        {/* Meta Info */}
        {showMeta && (
          <div 
            className={`absolute bottom-0 left-0 right-0 p-3 transition-all duration-300 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="bg-black/80 backdrop-blur-md rounded-lg p-3 space-y-2">
              <p className="truncate text-sm font-medium line-clamp-1">{getTitle(item)}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-0.5">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {formatRating(item.vote_average)}
                  </span>
                  <span className="w-px h-3 bg-muted-foreground/30" />
                  <span>{getYear(item)}</span>
                </div>
                <span className="uppercase text-[10px] font-medium tracking-wider opacity-70">
                  {type === "tv" ? "TV" : "HD"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </button>
  );
}
