"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Play, Info, ChevronLeft, ChevronRight, MonitorPlay } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getImageUrl, getTitle } from "@/lib/utils";
import type { MediaItem } from "@/types";

interface HeroBannerProps {
  items: MediaItem[];
  onPlay: (item: MediaItem) => void;
  onInfo: (item: MediaItem) => void;
}

export default function HeroBanner({ items, onPlay, onInfo }: HeroBannerProps) {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const item = items[current];

  // Auto-advance carousel with pause on hover
  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % items.length);
      setImageLoaded(false);
    }, 8000);
    return () => clearInterval(interval);
  }, [items.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrent(index);
    setImageLoaded(false);
  }, []);

  const goToPrev = useCallback(() => {
    goToSlide((current - 1 + items.length) % items.length);
  }, [current, items.length, goToSlide]);

  const goToNext = useCallback(() => {
    goToSlide((current + 1) % items.length);
  }, [current, items.length, goToSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goToPrev();
      if (e.key === "ArrowRight") goToNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToPrev, goToNext]);

  if (!item) return (
    <div className="relative h-[70vh] w-full animate-pulse bg-muted" />
  );

  const mediaType = item.media_type || (item.title ? "movie" : "tv");

  return (
    <div 
      className="relative h-[60vh] w-full overflow-hidden md:h-[75vh]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Image with Ken Burns Effect */}
      <div className="absolute inset-0">
        <Image
          src={getImageUrl(item.backdrop_path, "original")}
          alt={getTitle(item)}
          fill
          className={`object-cover transition-transform duration-[10s] ease-linear ${
            imageLoaded ? "scale-100" : "scale-105"
          }`}
          onLoad={() => setImageLoaded(true)}
          priority
          sizes="100vw"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-transparent" />
        {/* Top gradient for navbar */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-transparent h-32" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-end pb-20 md:pb-28 px-4 md:px-8 lg:px-16">
        {/* Animated Content Entry */}
        <div 
          className={`max-w-2xl space-y-4 md:space-y-6 transition-all duration-700 ${
            imageLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {/* Media Type Badge */}
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-md">
              {mediaType === "movie" ? "Movie" : "TV Show"}
            </span>
            {mediaType === "movie" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">
                <MonitorPlay className="h-3 w-3" />
                HD
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
            <span className="bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
              {getTitle(item)}
            </span>
          </h1>

          {/* Overview */}
          <p className="line-clamp-2 text-sm text-foreground/80 md:text-base leading-relaxed">
            {item.overview}
          </p>

          {/* Rating & Year */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {item.vote_average > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded bg-yellow-500/20 text-yellow-400 text-xs font-bold">
                  {Number(item.vote_average).toFixed(1)}
                </span>
                Rating
              </span>
            )}
            <span>{new Date(item.release_date || item.first_air_date || "2000").getFullYear()}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              size="lg"
              onClick={() => onPlay({ ...item, media_type: mediaType })}
              className="gap-2 text-base font-semibold shadow-lg shadow-black/50 hover:shadow-xl"
            >
              <Play className="h-5 w-5 fill-current" />
              Play Now
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => onInfo({ ...item, media_type: mediaType })}
              className="gap-2 text-base font-medium"
            >
              <Info className="h-5 w-5" />
              More Info
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {items.length > 1 && (
        <>
          <button
            onClick={goToPrev}
            className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white transition-all hover:bg-black/60 hover:scale-110 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={goToNext}
            className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white transition-all hover:bg-black/60 hover:scale-110 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Progress Indicators */}
      {items.length > 1 && (
        <div className="absolute bottom-16 right-4 flex gap-1.5 md:bottom-24 md:right-8">
          {items.slice(0, 5).map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={`relative h-1 rounded-full transition-all duration-300 ${
                i === current 
                  ? "w-8 bg-primary" 
                  : "w-4 bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            >
              {i === current && (
                <span className="absolute inset-0 animate-ping rounded-full bg-primary/50" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
