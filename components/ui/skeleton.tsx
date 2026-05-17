import { cn } from "@/lib/utils";

/**
 * Enhanced skeleton loader with shimmer effect
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted relative overflow-hidden", className)}
      {...props}
    >
      {/* Shimmer effect overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" 
        style={{ 
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)',
          backgroundSize: '200% 100%'
        }}
      />
    </div>
  );
}

export { Skeleton };
