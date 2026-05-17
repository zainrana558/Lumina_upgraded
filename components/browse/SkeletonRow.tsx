import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Enhanced Skeleton Row with animated shimmer effect
 */
export default function SkeletonRow() {
  return (
    <div className="space-y-3 px-4 md:px-8">
      {/* Title Placeholder */}
      <Skeleton className="h-6 w-48" />
      
      {/* Cards Container */}
      <div className="flex gap-3 overflow-hidden pb-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div 
            key={i} 
            className="relative flex-shrink-0 w-36 md:w-44"
          >
            {/* Poster Skeleton with shimmer */}
            <div className="aspect-[2/3] rounded-lg overflow-hidden relative">
              <div className="absolute inset-0 bg-zinc-800 animate-pulse">
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
              </div>
            </div>
            
            {/* Title Line */}
            <div className="mt-2 space-y-1.5">
              <div className="h-3 w-3/4 rounded bg-zinc-800 animate-pulse" />
              <div className="h-2 w-1/2 rounded bg-zinc-800/50 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton for Hero Banner
 */
export function HeroSkeleton() {
  return (
    <div className="relative h-[60vh] md:h-[80vh] w-full">
      {/* Background */}
      <div className="absolute inset-0 bg-zinc-900 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />
      </div>
      
      {/* Content Placeholders */}
      <div className="relative pt-32 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="max-w-xl space-y-4">
          {/* Title */}
          <div className="h-10 w-3/4 rounded bg-zinc-800 animate-pulse" />
          
          {/* Meta info */}
          <div className="flex gap-3">
            <div className="h-5 w-16 rounded bg-zinc-800 animate-pulse" />
            <div className="h-5 w-12 rounded bg-zinc-800 animate-pulse" />
            <div className="h-5 w-20 rounded bg-zinc-800 animate-pulse" />
          </div>
          
          {/* Overview */}
          <div className="space-y-2 pt-2">
            <div className="h-4 w-full rounded bg-zinc-800 animate-pulse" />
            <div className="h-4 w-5/6 rounded bg-zinc-800 animate-pulse" />
          </div>
          
          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <div className="h-10 w-28 rounded-full bg-zinc-800 animate-pulse" />
            <div className="h-10 w-28 rounded-full bg-zinc-800/50 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton Grid for search results
 */
export function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="aspect-[2/3] rounded-lg bg-zinc-800 animate-pulse" />
          <div className="h-3 w-3/4 rounded bg-zinc-800 animate-pulse" />
        </div>
      ))}
    </div>
  );
}
